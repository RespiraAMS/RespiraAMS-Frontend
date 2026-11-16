/**
 * Cookie Utilities for Client-side and Next.js compatibility
 */

export interface CookieOptions {
	days?: number;
	maxAge?: number; // seconds
	path?: string;
	domain?: string;
	sameSite?: "Lax" | "Strict" | "None";
	secure?: boolean;
}

/**
 * Đặt Cookie trên trình duyệt
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
	if (typeof document === "undefined") return;

	const {
		days,
		maxAge,
		path = "/",
		domain,
		sameSite = "Lax",
		secure = typeof window !== "undefined" && window.location.protocol === "https:",
	} = options;

	let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`;

	if (maxAge !== undefined) {
		cookieStr += `; max-age=${maxAge}`;
	} else if (days !== undefined) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		cookieStr += `; expires=${date.toUTCString()}`;
	}

	if (domain) {
		cookieStr += `; domain=${domain}`;
	}

	if (secure) {
		cookieStr += "; Secure";
	}

	document.cookie = cookieStr;
}

/**
 * Đọc Cookie theo tên
 */
export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;

	const nameEQ = `${encodeURIComponent(name)}=`;
	const ca = document.cookie.split(";");

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) === 0) {
			try {
				return decodeURIComponent(c.substring(nameEQ.length, c.length));
			} catch {
				return c.substring(nameEQ.length, c.length);
			}
		}
	}

	return null;
}

/**
 * Xóa Cookie
 */
export function deleteCookie(name: string, path: string = "/"): void {
	if (typeof document === "undefined") return;
	document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
}

