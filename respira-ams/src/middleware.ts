import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

/**
 * Kiểm tra tính hợp lệ và lấy thông tin role từ Access Token (JWT)
 */
function inspectToken(token?: string | null): { isValid: boolean; role: string } {
	if (!token || typeof token !== "string" || token.trim() === "") {
		return { isValid: false, role: "" };
	}

	try {
		const parts = token.split(".");
		if (parts.length < 2) return { isValid: false, role: "" };

		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = atob(base64);
		const decoded = JSON.parse(jsonPayload);

		// Kiểm tra hạn sử dụng nếu có claim exp
		if (decoded.exp && typeof decoded.exp === "number") {
			const nowSeconds = Math.floor(Date.now() / 1000);
			if (decoded.exp <= nowSeconds) {
				return { isValid: false, role: "" };
			}
		}

		const rawRole =
			decoded.role ||
			decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
			"";

		const role = String(rawRole).toLowerCase();
		return { isValid: true, role };
	} catch {
		return { isValid: false, role: "" };
	}
}

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

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const tokenCookie = request.cookies.get("accessToken")?.value;
	const { isValid, role: tokenRole } = inspectToken(tokenCookie);

	// Lấy role từ token hoặc cookie dự phòng
	const cookieRole = (request.cookies.get("user_role")?.value || "").toLowerCase();
	const userRole = tokenRole || cookieRole || "doctor";

	const isAuthRoute = pathname === "/login";
	const isProtectedRoute =
		pathname.startsWith("/admin") ||
		pathname.startsWith("/doctor") ||
		pathname.startsWith("/manage") ||
		pathname.startsWith("/profile");

	// -------------------------------------------------------------
	// 1. Trường hợp CHƯA ĐĂNG NHẬP hoặc TOKEN ĐÃ HẾT HẠN
	// -------------------------------------------------------------
	if (!isValid) {
		// Bắt buộc đăng nhập nếu truy cập các trang được bảo vệ: doctor, admin, manage, profile
		if (isProtectedRoute) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			const response = NextResponse.redirect(loginUrl);

			// Xóa các cookie phiên cũ nếu có
			response.cookies.delete("accessToken");
			response.cookies.delete("user_role");
			response.cookies.delete("user_data");

			applyLocaleCookie(request, response);
			return response;
		}

		// Truy cập trang gốc "/" khi chưa đăng nhập -> chuyển hướng về /login
		if (pathname === "/") {
			const loginUrl = new URL("/login", request.url);
			const response = NextResponse.redirect(loginUrl);
			applyLocaleCookie(request, response);
			return response;
		}

		const response = NextResponse.next();
		applyLocaleCookie(request, response);
		return response;
	}

	// -------------------------------------------------------------
	// 2. Trường hợp ĐÃ ĐĂNG NHẬP HỢP LỆ
	// -------------------------------------------------------------

	// Xác định trang đích mặc định cho từng vai trò
	const getDefaultDashboard = (r: string) => {
		if (r === "admin") return "/admin/dashboard";
		if (r === "manager" || r === "medicalregulationreviewer") return "/manage/dashboard";
		return "/doctor/patients";
	};

	// 2.1. Đã đăng nhập nhưng cố tình vào lại trang /login hoặc trang gốc "/"
	if (isAuthRoute || pathname === "/") {
		const target = getDefaultDashboard(userRole);
		const response = NextResponse.redirect(new URL(target, request.url));
		applyLocaleCookie(request, response);
		return response;
	}

	// 2.2. Phân quyền truy cập theo vai trò (Role-Based Access Control)
	// Khu vực Admin: Chỉ dành riêng cho quyền "admin"
	if (pathname.startsWith("/admin")) {
		if (userRole !== "admin") {
			const target = getDefaultDashboard(userRole);
			const response = NextResponse.redirect(new URL(target, request.url));
			applyLocaleCookie(request, response);
			return response;
		}
	}

	// Khu vực Doctor: Dành cho doctor, headdepartmentdoctor, admin
	if (pathname.startsWith("/doctor")) {
		if (userRole !== "doctor" && userRole !== "headdepartmentdoctor" && userRole !== "admin") {
			const target = getDefaultDashboard(userRole);
			const response = NextResponse.redirect(new URL(target, request.url));
			applyLocaleCookie(request, response);
			return response;
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
			const response = NextResponse.redirect(new URL(target, request.url));
			applyLocaleCookie(request, response);
			return response;
		}
	}

	// Route Profile (/profile)
	if (pathname === "/profile") {
		const target = userRole === "admin" ? "/admin/dashboard" : "/doctor/profile";
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
		 * Áp dụng cho tất cả các đường dẫn ngoại trừ static assets và internal API
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};

