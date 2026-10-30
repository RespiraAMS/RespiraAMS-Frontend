const API_URL = (
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5016/api/v1"
).replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 15000;

/** Error thrown for any non-2xx response coming from the backend. */
export class ApiError extends Error {
	status: number;
	detail?: unknown;

	constructor(message: string, status: number, detail?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.detail = detail;
	}
}

/** Backend wraps every payload in `Result<T>`: `{ statusCode, data, error }`. */
interface ApiResult<T> {
	statusCode?: string;
	data?: T | null;
	error?: { statusCode?: string; description?: string; detail?: unknown } | null;
}

function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem("accessToken");
}

export function buildQuery(
	params: Record<string, string | number | boolean | null | undefined>
): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") continue;
		search.set(key, String(value));
	}
	const qs = search.toString();
	return qs ? `?${qs}` : "";
}

function describeStatus(status: number): string {
	switch (status) {
		case 401:
			return "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập.";
		case 403:
			return "Bạn không có quyền thực hiện thao tác này.";
		case 404:
			return "Không tìm thấy dữ liệu yêu cầu.";
		default:
			return "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
	}
}

export async function apiRequest<T = void>(
	path: string,
	options: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<T> {
	const { body, headers, ...rest } = options;
	const token = getToken();

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	let response: Response;
	try {
		response = await fetch(`${API_URL}${path}`, {
			...rest,
			signal: controller.signal,
			headers: {
				Accept: "application/json",
				...(body !== undefined ? { "Content-Type": "application/json" } : {}),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...headers,
			},
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") {
			throw new ApiError(
				"Máy chủ không phản hồi. Vui lòng kiểm tra các service backend đã chạy chưa.",
				0
			);
		}
		throw new ApiError("Không thể kết nối tới máy chủ.", 0);
	} finally {
		clearTimeout(timeout);
	}

	if (response.status === 204) return undefined as T;

	let payload: ApiResult<T> | null = null;
	try {
		payload = (await response.json()) as ApiResult<T>;
	} catch {
		payload = null;
	}

	if (!response.ok) {
		const message =
			payload?.error?.description ??
			(payload as { message?: string } | null)?.message ??
			describeStatus(response.status);
		throw new ApiError(message, response.status, payload?.error?.detail);
	}

	return (payload?.data ?? undefined) as T;
}
