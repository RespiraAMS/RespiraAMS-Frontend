export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResult {
	accessToken: string;
	refreshToken: string;
}

export interface LogoutRequest {
	accessToken: string;
	refreshToken: string;
}

export interface RefreshRequest {
	refreshToken: string;
}

export interface SendVerifyRequest {
	email: string;
	sagaId?: string;
}

export interface VerifyEmailRequest {
	token: string;
}

export interface ApiErrorDetail {
	statusCode?: string;
	description?: string;
	detail?: unknown;
}

export interface ApiResponse<T> {
	statusCode?: string;
	data?: T | null;
	error?: ApiErrorDetail | null;
}

export interface AuthUser {
	id: string;
	email: string;
	role: "Doctor" | "Manager" | "Admin" | string;
	exp?: number;
}

export interface AuthSession {
	user: AuthUser;
	accessToken: string;
	refreshToken: string;
}

