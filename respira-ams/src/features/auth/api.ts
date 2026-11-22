import { deleteCookie, getCookie, setCookie } from "@/lib/cookies";
import { API_V1, CLIENT_API_BASE } from "@/lib/api-base";
import { ApiResponse, ResetPasswordRequest, SendVerifyRequest, VerifyEmailRequest } from "./types";

// Cho phép Node.js trên server chấp nhận chứng chỉ self-signed của ASP.NET Core dev
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const API_BASE_URL = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;
const REMEMBERED_EMAIL = "remembered_email";

export function getRememberedEmail(): string {
	if (typeof window === "undefined") return "";
	return getCookie(REMEMBERED_EMAIL) || "";
}

export function setRememberedEmail(email: string, remember: boolean): void {
	if (typeof window === "undefined") return;

	if (remember && email) {
		setCookie(REMEMBERED_EMAIL, email, { days: 30 });
		return;
	}

	deleteCookie(REMEMBERED_EMAIL);
}

/**
 * Verification tokens are single-use on the backend: a second request with the
 * same token returns 401 even though the account is already confirmed. Both the
 * verify page and the login page can mount the same confirmation, and React
 * StrictMode mounts effects twice in development, so requests are coalesced here.
 */
const CONFIRM_SUCCESS_TTL_MS = 5 * 60 * 1000;
const SEND_DEDUPE_TTL_MS = 30 * 1000;

const confirmInFlight = new Map<string, Promise<boolean>>();
const confirmedAt = new Map<string, number>();
const sendInFlight = new Map<string, Promise<boolean>>();
const sentAt = new Map<string, number>();

async function requestEmailVerification(
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
 * API: POST /api/v1/auth/email-verification
 * Gửi email xác thực tài khoản. Yêu cầu trùng trong 30 giây được gộp lại.
 */
export function sendEmailVerification(
	email: string,
	sagaId?: string
): Promise<boolean> {
	const key = `${email.trim().toLowerCase()}|${sagaId ?? ""}`;

	const sentTimestamp = sentAt.get(key);
	if (sentTimestamp && Date.now() - sentTimestamp < SEND_DEDUPE_TTL_MS) {
		return Promise.resolve(true);
	}

	const pending = sendInFlight.get(key);
	if (pending) return pending;

	const task = requestEmailVerification(email, sagaId)
		.then((result) => {
			sentAt.set(key, Date.now());
			return result;
		})
		.finally(() => {
			sendInFlight.delete(key);
		});

	sendInFlight.set(key, task);
	return task;
}

async function requestEmailConfirmation(token: string): Promise<boolean> {
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

/**
 * API: POST /api/v1/auth/email-verification/confirm
 * Xác nhận email bằng mã token từ liên kết xác nhận.
 * Token chỉ dùng được một lần nên kết quả thành công được cache ngắn hạn.
 */
export function confirmEmailVerification(token: string): Promise<boolean> {
	const key = token.trim();

	const confirmedTimestamp = confirmedAt.get(key);
	if (confirmedTimestamp && Date.now() - confirmedTimestamp < CONFIRM_SUCCESS_TTL_MS) {
		return Promise.resolve(true);
	}

	const pending = confirmInFlight.get(key);
	if (pending) return pending;

	const task = requestEmailConfirmation(key)
		.then((result) => {
			confirmedAt.set(key, Date.now());
			return result;
		})
		.finally(() => {
			confirmInFlight.delete(key);
		});

	confirmInFlight.set(key, task);
	return task;
}

/**
 * Chuyển các thông báo lỗi tiếng Anh của backend sang tiếng Việt.
 */
function translateAuthError(message: string | undefined, fallback: string): string {
	if (!message) return fallback;
	if (/account not found/i.test(message)) {
		return "Không tìm thấy tài khoản với email này.";
	}
	if (/could not be sent/i.test(message)) {
		return "Không thể gửi email. Vui lòng kiểm tra cấu hình email của hệ thống hoặc thử lại sau.";
	}
	if (/invalid|expired|not found/i.test(message)) {
		return "Liên kết không hợp lệ hoặc đã hết hạn.";
	}
	return message;
}

/**
 * API: POST /api/v1/auth/forgot-password
 * Gửi liên kết đặt lại mật khẩu tới email của tài khoản.
 */
export async function forgotPassword(email: string): Promise<boolean> {
	const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
		method: "POST",
		signal: AbortSignal.timeout(20000),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ email: email.trim().toLowerCase() }),
	});

	const payload = (await response.json().catch(() => null)) as ApiResponse<boolean> | null;

	if (!response.ok || payload?.error) {
		throw new Error(
			translateAuthError(
				payload?.error?.description,
				"Không thể gửi liên kết đặt lại mật khẩu. Vui lòng thử lại sau."
			)
		);
	}

	return true;
}

/**
 * API: POST /api/v1/auth/forgot-password/confirm
 * Đặt mật khẩu mới bằng token lấy từ liên kết trong email.
 */
export async function resetPassword(request: ResetPasswordRequest): Promise<boolean> {
	const response = await fetch(`${API_BASE_URL}/auth/forgot-password/confirm`, {
		method: "POST",
		signal: AbortSignal.timeout(20000),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(request),
	});

	const payload = (await response.json().catch(() => null)) as ApiResponse<boolean> | null;

	if (!response.ok || payload?.error) {
		throw new Error(
			translateAuthError(
				payload?.error?.description,
				"Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
			)
		);
	}

	return true;
}
