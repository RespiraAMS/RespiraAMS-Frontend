const API_URL = (
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5016/api/v1"
).replace(/\/$/, "");

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
			return "Phi├¬n ─æ─âng nhß║¡p ─æ├ú hß║┐t hß║ín hoß║╖c bß║ín ch╞░a ─æ─âng nhß║¡p.";
		case 403:
			return "Bß║ín kh├┤ng c├│ quyß╗ün thß╗▒c hiß╗çn thao t├íc n├áy.";
		case 404:
			return "Kh├┤ng t├¼m thß║Ñy dß╗» liß╗çu y├¬u cß║ºu.";
		default:
			return "─É├ú xß║úy ra lß╗ùi hß╗ç thß╗æng. Vui l├▓ng thß╗¡ lß║íi sau.";
	}
}

export async function apiRequest<T = void>(
	path: string,
	options: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<T> {
	const { body, headers, ...rest } = options;
	const token = getToken();

	let response: Response;
	try {
		response = await fetch(`${API_URL}${path}`, {
			...rest,
			headers: {
				Accept: "application/json",
				...(body !== undefined ? { "Content-Type": "application/json" } : {}),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...headers,
			},
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
	} catch {
		throw new ApiError("Kh├┤ng thß╗â kß║┐t nß╗æi tß╗¢i m├íy chß╗º.", 0);
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

