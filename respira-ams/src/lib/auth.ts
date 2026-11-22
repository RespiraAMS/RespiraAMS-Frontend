import logger from "./logger";

export interface UserData {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	role: string;
}

interface AuthApiResponse<T> {
	success: boolean;
	data?: T | null;
	message?: string;
}

let authenticated = false;

/**
 * The current user only lives in memory. The server-side iron-session cookie is
 * the single source of truth, so nothing is written to browser storage.
 */
let currentUser: UserData | null = null;

export function getUser(): UserData | null {
	return currentUser;
}

export function clearAuth(): void {
	authenticated = false;
	currentUser = null;
}

export function isAuthenticated(): boolean {
	return authenticated;
}

let pendingSessionLoad: Promise<UserData | null> | null = null;

async function requestSessionUser(): Promise<UserData | null> {
	try {
		const response = await fetch("/api/auth/session", { cache: "no-store" });

		if (response.status === 401) {
			clearAuth();
			return null;
		}

		const result = (await response.json().catch(() => null)) as AuthApiResponse<UserData> | null;

		if (response.ok && result?.success && result.data) {
			authenticated = true;
			currentUser = result.data;
			return result.data;
		}
	} catch (error) {
		logger.error("Failed to load session", { error });
	}

	return null;
}

/** Loads the session once and shares the in-flight request between callers. */
function fetchSessionUser(): Promise<UserData | null> {
	if (pendingSessionLoad) return pendingSessionLoad;

	pendingSessionLoad = requestSessionUser().finally(() => {
		pendingSessionLoad = null;
	});

	return pendingSessionLoad;
}

/**
 * Returns the in-memory user, loading it from the server session when the page
 * was reloaded and the client cache is still empty.
 */
export async function ensureSessionUser(): Promise<UserData | null> {
	if (currentUser) return currentUser;
	return fetchSessionUser();
}

/**
 * Fetch session from the server-side iron-session cookie.
 * Called on page load to restore the current user into the client.
 */
export async function restoreSession(): Promise<boolean> {
	const user = await fetchSessionUser();
	return user !== null;
}

/**
 * Attempt a token refresh via the server-side API route.
 * The server reads the refreshToken from its encrypted session cookie.
 */
export async function refreshSession(): Promise<boolean> {
	try {
		const response = await fetch("/api/auth/refresh", { method: "POST" });
		const result = (await response.json().catch(() => null)) as AuthApiResponse<UserData> | null;

		if (response.ok && result?.success) {
			authenticated = true;
			if (result.data) currentUser = result.data;
			return true;
		}

		if (response.status === 401) {
			clearAuth();
		}
	} catch (error) {
		logger.error("Failed to refresh session", { error });
	}

	return false;
}

export async function login(request: {
	email: string;
	password: string;
}): Promise<UserData> {
	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: request.email.trim().toLowerCase(),
			password: request.password,
		}),
	});

	const result = (await response.json().catch(() => null)) as AuthApiResponse<UserData> | null;

	if (!response.ok || !result?.success || !result.data) {
		throw new Error(result?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
	}

	authenticated = true;
	currentUser = result.data;

	return result.data;
}

export async function logout(): Promise<void> {
	try {
		await fetch("/api/auth/logout", { method: "POST" });
	} catch (error) {
		logger.error("Logout API call failed", { error });
	}

	clearAuth();
}
