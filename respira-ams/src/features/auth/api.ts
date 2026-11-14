import { deleteCookie, getCookie, setCookie } from "@/lib/cookies";
import { API_V1, CLIENT_API_BASE } from "@/lib/api-base";
import { ApiResponse, SendVerifyRequest, VerifyEmailRequest } from "./types";

// Cho phép Node.js trên server chấp nhận chứng chỉ self-signed của ASP.NET Core dev
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const API_BASE_URL = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;
const REMEMBERED_EMAIL = "remembered_email";

export function getRememberedEmail(): string {
	if (typeof window === "undefined") return "";
	return getCookie(REMEMBERED_EMAIL) || localStorage.getItem(REMEMBERED_EMAIL) || "";
}

export function setRememberedEmail(email: string, remember: boolean): void {
	if (typeof window === "undefined") return;

	if (remember && email) {
		setCookie(REMEMBERED_EMAIL, email, { days: 30 });
		localStorage.setItem(REMEMBERED_EMAIL, email);
		return;
	}

	deleteCookie(REMEMBERED_EMAIL);
	localStorage.removeItem(REMEMBERED_EMAIL);
}

/**
 * API: POST /api/v1/auth/email-verification
 * Gửi email xác thực tài khoản.
 */
export async function sendEmailVerification(
	email: string,
	sagaId?: string
): Promise<boolean> {
	const body: SendVerifyRequest = {
		email,
		sagaId: sagaId || "00000000-0000-0000-0000-000000000000",
	};

	const response = await fetch(`${API_BASE_URL}/auth/email-verification`, {
		method: "POST",
		signal: AbortSignal.timeout(15000),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(body),
	});

	const payload = (await response.json().catch(() => null)) as ApiResponse<boolean> | null;

	if (!response.ok || payload?.error) {
		throw new Error(
			payload?.error?.description ||
				"Không thể gửi email xác thực. Vui lòng thử lại sau."
		);
	}

	return true;
}

/**
 * API: POST /api/v1/auth/email-verification/confirm
 * Xác nhận email bằng mã token từ liên kết xác nhận.
 */
export async function confirmEmailVerification(token: string): Promise<boolean> {
	const body: VerifyEmailRequest = { token };

	const response = await fetch(`${API_BASE_URL}/auth/email-verification/confirm`, {
		method: "POST",
		signal: AbortSignal.timeout(15000),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(body),
	});

	const payload = (await response.json().catch(() => null)) as ApiResponse<boolean> | null;

	if (!response.ok || payload?.error) {
		throw new Error(
			payload?.error?.description ||
				"Liên kết xác thực không hợp lệ hoặc đã hết hạn."
		);
	}

	return true;
}
