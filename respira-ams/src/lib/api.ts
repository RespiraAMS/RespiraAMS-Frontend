import logger from "./logger";
import { getAccessToken, refreshSession, clearAuth } from "./auth";
import { ApiResult } from "./models";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";

export const API_BASE = `/api/${API_VERSION}`;
export const API_BASE_SERVER = `${process.env.GATEWAY_URL || "https://gateway-respira.dev.localhost:7283"}`;

function redirectToLogin(): void {
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

async function handle401(): Promise<boolean> {
    const refreshed = await refreshSession();
    if (!refreshed) {
        clearAuth();
        redirectToLogin();
        return false;
    }
    return true;
}

export async function apiFetch<T>(
    url: string,
    opts?: RequestInit,
    withAuth: boolean = true
): Promise<T | null> {
    const isFormData = opts?.body instanceof FormData;
    const headers = new Headers(opts?.headers);

    if (withAuth) {
        const token = getAccessToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }

    if (!isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const resp = await fetch(url, {
        headers,
        ...opts,
    });

    // Handle 204 No Content for PUT/DELETE
    if (resp.status === 204) {
        return null;
    }

    const result = (await resp.json()) as ApiResult<T>;

    // Check both HTTP status and the API's custom error object
    if (!resp.ok || result.error) {
        const errorMessage = result.error?.description || "An unexpected error occurred";
        logger.error("Failed to make API request", { url, message: errorMessage, status: resp.status });

        switch (resp.status) {
            case 400:
                throw new Error(errorMessage);
            case 401: {
                const recovered = await handle401();
                if (recovered) {
                    return apiFetch<T>(url, opts, withAuth);
                }
                throw new Error("Session expired. Please log in again.");
            }
            case 403:
                throw new Error("You cannot access this resource");
            case 404:
                throw new Error(errorMessage);
            case 500:
                throw new Error("Internal server error");
            case 503:
                throw new Error("Service temporarily unavailable");
            default:
                throw new Error(errorMessage);
        }
    }

    return result.data;
}

// ---------------------------------------------------------
// Helper functions and classes for Doctor features
// ---------------------------------------------------------

const DOCTOR_API_URL = (
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5016/api/v1"
).replace(/\/$/, "");

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
	const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;

	let response: Response;
	try {
		response = await fetch(`${DOCTOR_API_URL}${path}`, {
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
		const message =
			payload?.error?.description ??
			(payload as { message?: string } | null)?.message ??
			describeStatus(response.status);
		throw new ApiError(message, response.status, payload?.error?.detail);
	}

	return (payload?.data ?? undefined) as T;
}
