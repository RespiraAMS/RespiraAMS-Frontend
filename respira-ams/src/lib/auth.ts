import {
	getStoredAccessToken,
	getStoredRefreshToken,
	getStoredUser,
	clearStoredAuth,
	isAuthenticated as checkAuth,
	login as apiLogin,
	logout as apiLogout,
	refreshAuthToken,
} from "@/features/auth/api";
import { AuthUser, LoginRequest } from "@/features/auth/types";

export interface UserData extends AuthUser {
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
}

export function getAccessToken(): string | null {
	return getStoredAccessToken();
}

export function getRefreshToken(): string | null {
	return getStoredRefreshToken();
}

export function getUser(): UserData | null {
	return getStoredUser() as UserData | null;
}

export function saveUser(user: Partial<UserData>): void {
	if (typeof window === "undefined") return;
	const current = getUser() || ({} as UserData);
	const merged = { ...current, ...user };
	localStorage.setItem("user_data", JSON.stringify(merged));
}

export function clearAuth(): void {
	clearStoredAuth();
}

export function isAuthenticated(): boolean {
	return checkAuth();
}

export async function login(credentials: LoginRequest) {
	return await apiLogin(credentials);
}

export async function logout() {
	return await apiLogout();
}

export async function refreshSession(): Promise<boolean> {
	const newToken = await refreshAuthToken();
	return !!newToken;
}

export async function restoreSession(): Promise<boolean> {
	return isAuthenticated();
}
