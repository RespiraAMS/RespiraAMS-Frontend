import logger from "./logger";
import { getAccessToken, refreshSession, clearAuth } from "./auth";
import { ApiResult } from "./models";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "1";

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