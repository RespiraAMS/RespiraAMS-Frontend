import { getIronSession, nextProxyCookies } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";
import { sessionOptions, type SessionData } from "@/lib/session-config";

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
			maxAge: 60 * 60 * 24 * 365,
			sameSite: "lax",
		});
	}
}

function getDefaultDashboard(role: string) {
	if (role === "admin") return "/admin/dashboard";
	if (role === "manager" || role === "medicalregulationreviewer") return "/manage/dashboard";
	return "/doctor/patients";
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const response = NextResponse.next();
	const session = await getIronSession<SessionData>(
		nextProxyCookies(request, response),
		sessionOptions
	);

	const userRole = (session.role || "").toLowerCase();
	const isAuthenticated = Boolean(session.accessToken && userRole);

	const isAuthRoute = pathname === "/login";
	const isProtectedRoute =
		pathname.startsWith("/admin") ||
		pathname.startsWith("/doctor") ||
		pathname.startsWith("/manage") ||
		pathname.startsWith("/profile");

	// -------------------------------------------------------------
	// 1. Trường hợp CHƯA ĐĂNG NHẬP hoặc SESSION KHÔNG HỢP LỆ
	// -------------------------------------------------------------
	if (!isAuthenticated) {
		if (isProtectedRoute) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			const redirectResponse = NextResponse.redirect(loginUrl);

			// Xóa các cookie phiên cũ nếu có
			redirectResponse.cookies.delete("accessToken");
			redirectResponse.cookies.delete("refreshToken");
			redirectResponse.cookies.delete("user_role");
			redirectResponse.cookies.delete("user_data");

			applyLocaleCookie(request, redirectResponse);
			return redirectResponse;
		}

		// Truy cập trang gốc "/" khi chưa đăng nhập -> chuyển hướng về /login
		if (pathname === "/") {
			const loginUrl = new URL("/login", request.url);
			const redirectResponse = NextResponse.redirect(loginUrl);
			applyLocaleCookie(request, redirectResponse);
			return redirectResponse;
		}

		applyLocaleCookie(request, response);
		return response;
	}

	// -------------------------------------------------------------
	// 2. Trường hợp ĐÃ ĐĂNG NHẬP HỢP LỆ
	// -------------------------------------------------------------

	// 2.1. Đã đăng nhập nhưng cố tình vào lại trang /login hoặc trang gốc "/"
	if (isAuthRoute || pathname === "/") {
		const target = getDefaultDashboard(userRole);
		const redirectResponse = NextResponse.redirect(new URL(target, request.url));
		applyLocaleCookie(request, redirectResponse);
		return redirectResponse;
	}

	// 2.2. Phân quyền truy cập theo vai trò (Role-Based Access Control)
	// Khu vực Admin: Chỉ dành riêng cho quyền "admin"
	if (pathname.startsWith("/admin")) {
		if (userRole !== "admin") {
			const target = getDefaultDashboard(userRole);
			const redirectResponse = NextResponse.redirect(new URL(target, request.url));
			applyLocaleCookie(request, redirectResponse);
			return redirectResponse;
		}
	}

	// Khu vực Doctor: Dành cho doctor, headdepartmentdoctor, admin
	if (pathname.startsWith("/doctor")) {
		if (userRole !== "doctor" && userRole !== "headdepartmentdoctor" && userRole !== "admin") {
			const target = getDefaultDashboard(userRole);
			const redirectResponse = NextResponse.redirect(new URL(target, request.url));
			applyLocaleCookie(request, redirectResponse);
			return redirectResponse;
		}
	}

	// Khu vực Quản lý / Manager: Dành cho manager, medicalregulationreviewer, headdepartmentdoctor, admin
	if (pathname.startsWith("/manage")) {
		if (
			userRole !== "manager" &&
			userRole !== "medicalregulationreviewer" &&
			userRole !== "headdepartmentdoctor" &&
			userRole !== "admin"
		) {
			const target = getDefaultDashboard(userRole);
			const redirectResponse = NextResponse.redirect(new URL(target, request.url));
			applyLocaleCookie(request, redirectResponse);
			return redirectResponse;
		}
	}

	// Route Profile (/profile)
	if (pathname === "/profile") {
		const target =
			userRole === "admin"
				? "/admin/dashboard"
				: userRole === "manager" || userRole === "medicalregulationreviewer"
					? "/manage/dashboard"
					: "/doctor/profile";
		const redirectResponse = NextResponse.redirect(new URL(target, request.url));
		applyLocaleCookie(request, redirectResponse);
		return redirectResponse;
	}

	applyLocaleCookie(request, response);
	return response;
}

export const config = {
	matcher: [
		/*
		 * Áp dụng cho tất cả các đường dẫn ngoại trừ static assets và internal API
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
