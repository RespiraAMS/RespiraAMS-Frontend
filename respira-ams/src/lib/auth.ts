import logger from "./logger";

const USER_KEY = "user_data";

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

function getStorage(): Storage | null {
	return typeof window !== "undefined" ? window.localStorage : null;
}

export function getUser(): UserData | null {
	try {
		const raw = getStorage()?.getItem(USER_KEY);
		return raw ? (JSON.parse(raw) as UserData) : null;
	} catch {
		return null;
	}
}

export function saveUser(user: Partial<UserData>): void {
	const storage = getStorage();
	if (!storage) return;

	const current = getUser() || ({} as UserData);
	storage.setItem(USER_KEY, JSON.stringify({ ...current, ...user }));
}

function setUser(user: UserData): void {
	getStorage()?.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser(): void {
	getStorage()?.removeItem(USER_KEY);
}

export function clearAuth(): void {
	authenticated = false;
	clearUser();
}

export function isAuthenticated(): boolean {
	return authenticated;
}

/**
 * Fetch session from the server-side iron-session cookie.
 * Called on page load to restore the current user into the client.
 */
export async function restoreSession(): Promise<boolean> {
	try {
		const response = await fetch("/api/auth/session", { cache: "no-store" });

		if (response.status === 401) {
			clearAuth();
			return false;
		}

		const result = (await response.json().catch(() => null)) as AuthApiResponse<UserData> | null;

		if (response.ok && result?.success && result.data) {
			authenticated = true;
			setUser(result.data);
			return true;
		}
	} catch (error) {
		logger.error("Failed to restore session", { error });
	}

	return false;
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
			if (result.data) setUser(result.data);
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
	setUser(result.data);

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
