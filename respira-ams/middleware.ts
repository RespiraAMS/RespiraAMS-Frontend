import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

function applyLocaleCookie(request: NextRequest, response: NextResponse) {
	const hasLocaleCookie = request.cookies.has(COOKIE_NAME);

	if (!hasLocaleCookie) {
		const acceptLang = request.headers.get("accept-language");
		let detectedLocale: Locale = DEFAULT_LOCALE;

		if (acceptLang) {
			const preferred = acceptLang.split(",")[0].split("-")[0];
			if (LOCALES.includes(preferred as Locale)) {
				detectedLocale = preferred as Locale;
			}
		}

		response.cookies.set(COOKIE_NAME, detectedLocale, {
			path: "/",
			maxAge: 60 * 60 * 24 * 365, // 1 năm
			sameSite: "lax",
		});
	}
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const accessToken = request.cookies.get("accessToken")?.value;
	const userRole = (request.cookies.get("user_role")?.value || "").toLowerCase();

	const isAuthRoute = pathname === "/login";
	const isProtectedRoute =
		pathname.startsWith("/admin") ||
		pathname.startsWith("/doctor") ||
		pathname.startsWith("/manage") ||
		pathname.startsWith("/profile");

	// 0. Truy cập trang gốc "/" -> Điều hướng hợp lý dựa theo trạng thái đăng nhập
	if (pathname === "/") {
		if (!accessToken) {
			const loginUrl = new URL("/login", request.url);
			const response = NextResponse.redirect(loginUrl);
			applyLocaleCookie(request, response);
			return response;
		}
		let target = "/doctor/patients";
		if (userRole === "admin") {
			target = "/admin/dashboard";
		} else if (userRole === "manager") {
			target = "/manage/dashboard";
		}
		const response = NextResponse.redirect(new URL(target, request.url));
		applyLocaleCookie(request, response);
		return response;
	}

	// 1. Chưa đăng nhập mà truy cập trang bảo vệ -> Chuyển hướng về /login
	if (!accessToken && isProtectedRoute) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		const response = NextResponse.redirect(loginUrl);
		applyLocaleCookie(request, response);
		return response;
	}

	// 2. Đã đăng nhập mà vào lại /login -> Chuyển hướng đến Dashboard tương ứng
	if (accessToken && isAuthRoute) {
		let target = "/doctor/patients";
		if (userRole === "admin") {
			target = "/admin/dashboard";
		} else if (userRole === "manager") {
			target = "/manage/dashboard";
		}
		const response = NextResponse.redirect(new URL(target, request.url));
		applyLocaleCookie(request, response);
		return response;
	}

	const response = NextResponse.next();
	applyLocaleCookie(request, response);
	return response;
}

export const config = {
	matcher: [
		/*
		 * Khớp tất cả các đường dẫn ngoại trừ:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, hình ảnh công khai (.png, .jpg, .svg)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
