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

// Access token lives only in memory — never persisted to storage.
// The iron-session cookie is HttpOnly + encrypted on the server side.
let inMemoryAccessToken: string | null = null;

function getStorage(): Storage {
    return typeof window !== "undefined" ? localStorage : ({} as Storage);
}

export function getAccessToken(): string | null {
    return inMemoryAccessToken;
}

export function getUser(): UserData | null {
    try {
        const raw = getStorage().getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveUser(user: Partial<UserData>): void {
    const current = getUser() || ({} as UserData);
    const merged = { ...current, ...user };
    getStorage().setItem(USER_KEY, JSON.stringify(merged));
}

function setUser(user: UserData): void {
    getStorage().setItem(USER_KEY, JSON.stringify(user));
}

function clearUser(): void {
    getStorage().removeItem(USER_KEY);
}

export function clearAuth(): void {
    inMemoryAccessToken = null;
    clearUser();
}

export function isAuthenticated(): boolean {
    return !!inMemoryAccessToken;
}

/**
 * Fetch session from the server-side iron-session cookie.
 * Called on page load to restore the access token into memory.
 */
export async function restoreSession(): Promise<boolean> {
    try {
        const resp = await fetch("/api/auth/session");
        const result = await resp.json();

        if (resp.ok && result.success && result.data?.accessToken) {
            inMemoryAccessToken = result.data.accessToken;
            setUser({
                id: result.data.id,
                firstName: result.data.firstName,
                lastName: result.data.lastName,
                email: result.data.email,
                phoneNumber: result.data.phoneNumber,
                role: result.data.role,
            });
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
        const resp = await fetch("/api/auth/refresh", { method: "POST" });
        const result = await resp.json();

        if (resp.ok && result.success && result.data?.accessToken) {
            inMemoryAccessToken = result.data.accessToken;
            return true;
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
    const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    const result = await resp.json();

    if (!resp.ok || !result.success) {
        throw new Error(result.message || "Login failed");
    }

    const userData = result.data as UserData;

    // Store in-memory access token (after login, session API already populated it)
    // We also need to fetch the session to get the access token
    await restoreSession();

    // Save user data for quick access
    setUser(userData);

    return userData;
}

export async function logout(): Promise<void> {
    try {
        await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
        logger.error("Logout API call failed", { error });
    }
    clearAuth();
}