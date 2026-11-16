import logger from "./logger";
import { clearAuth } from "./auth";
import { ApiResult } from "./models";
import { API_V1, CLIENT_API_BASE, GATEWAY_ORIGIN, API_VERSION } from "./api-base";

// Cho phép Node.js trên server chấp nhận chứng chỉ self-signed của ASP.NET Core dev
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const API_BASE = typeof window !== "undefined" ? CLIENT_API_BASE : `/api/${API_VERSION}`;
export const API_BASE_SERVER = typeof window !== "undefined" ? "" : GATEWAY_ORIGIN;

function redirectToLogin(): void {
	if (typeof window !== "undefined") {
		window.location.href = "/login";
	}
}

function handleSessionExpired(): never {
	clearAuth();
	redirectToLogin();
	throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
}

export async function apiFetch<T>(
	url: string,
	opts?: RequestInit
): Promise<T | null> {
	const { headers: optionHeaders, ...rest } = opts ?? {};
	const isFormData = rest.body instanceof FormData;
	const headers = new Headers(optionHeaders);

	if (!isFormData && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(url, {
		...rest,
		headers,
		signal: rest.signal ?? AbortSignal.timeout(15000),
	});

	// Handle 204 No Content for PUT/DELETE
	if (response.status === 204) {
		return null;
	}

	const raw = await response.text();
	let result: ApiResult<T> | null = null;

	if (raw) {
		try {
			result = JSON.parse(raw) as ApiResult<T>;
		} catch {
			throw new Error(`Máy chủ phản hồi trạng thái ${response.status} ${response.statusText}`);
		}
	}

	// Check both HTTP status and the API's custom error object
	if (!response.ok || result?.error) {
		const errorMessage = result?.error?.description || "An unexpected error occurred";
		logger.error("Failed to make API request", {
			url,
			message: errorMessage,
			status: response.status,
		});

		switch (response.status) {
			case 400:
				throw new Error(errorMessage);
			case 401:
				handleSessionExpired();
			case 403:
				throw new Error("Bạn không có quyền thực hiện thao tác này.");
			case 404:
				throw new Error(errorMessage);
			case 500:
				throw new Error("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
			case 503:
				throw new Error("Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.");
			default:
				throw new Error(errorMessage);
		}
	}

	return (result?.data ?? null) as T | null;
}

const DOCTOR_API_URL = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;

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

interface DoctorApiResult<T> {
	statusCode?: string;
	data?: T | null;
	error?: { statusCode?: string; description?: string; detail?: unknown } | null;
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

	let response: Response;
	try {
		response = await fetch(`${DOCTOR_API_URL}${path}`, {
			...rest,
			signal: rest.signal ?? AbortSignal.timeout(15000),
			headers: {
				Accept: "application/json",
				...(body !== undefined ? { "Content-Type": "application/json" } : {}),
				...headers,
			},
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
	} catch (networkErr) {
		console.warn(`[apiRequest] Network error calling ${DOCTOR_API_URL}${path}:`, networkErr);
		throw new ApiError("Không thể kết nối tới máy chủ.", 0);
	}

	if (response.status === 204) return undefined as T;

	let payload: DoctorApiResult<T> | null = null;
	try {
		payload = (await response.json()) as DoctorApiResult<T>;
	} catch {
		payload = null;
	}

	if (!response.ok) {
		if (response.status === 401) {
			clearAuth();
			redirectToLogin();
		}

		const message =
			payload?.error?.description ??
			(payload as { message?: string } | null)?.message ??
			describeStatus(response.status);
		throw new ApiError(message, response.status, payload?.error?.detail);
	}

	return (payload?.data ?? undefined) as T;
}
