import { NextResponse, type NextRequest } from "next/server";

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

	// 1. Chưa đăng nhập mà truy cập trang bảo vệ -> Chuyển hướng về /login
	if (!accessToken && isProtectedRoute) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// 2. Đã đăng nhập mà vào lại /login -> Chuyển hướng đến Dashboard tương ứng
	if (accessToken && isAuthRoute) {
		if (userRole === "admin") {
			return NextResponse.redirect(new URL("/admin/dashboard", request.url));
		}
		if (userRole === "manager") {
			return NextResponse.redirect(new URL("/manage/dashboard", request.url));
		}
		return NextResponse.redirect(new URL("/doctor/patients", request.url));
	}

	return NextResponse.next();
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

