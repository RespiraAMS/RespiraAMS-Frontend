import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-fetch";
import { parseJwt } from "@/lib/jwt";
import { getSession } from "@/lib/session";
import { toSessionUser } from "@/lib/server-auth";

interface BackendLoginResult {
	accessToken?: string;
	refreshToken?: string;
}

interface BackendResult<T> {
	statusCode?: string;
	data?: T | null;
	error?: { description?: string } | null;
}

export async function POST(request: NextRequest) {
	let body: { email?: string; password?: string };

	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ success: false, message: "Dữ liệu đăng nhập không hợp lệ." },
			{ status: 400 }
		);
	}

	const email = (body.email ?? "").trim().toLowerCase();
	const password = body.password ?? "";

	if (!email || !password) {
		return NextResponse.json(
			{ success: false, message: "Vui lòng nhập email và mật khẩu." },
			{ status: 400 }
		);
	}

	try {
		const response = await backendFetch("/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		const payload = (await response.json().catch(() => null)) as BackendResult<BackendLoginResult> | null;

		if (
			!response.ok ||
			!payload?.data?.accessToken ||
			!payload.data.refreshToken
		) {
			const message =
				response.status === 401
					? "Tài khoản hoặc mật khẩu không chính xác."
					: payload?.error?.description ??
					  "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";

			return NextResponse.json(
				{ success: false, message },
				{ status: response.status === 200 ? 401 : response.status }
			);
		}

		const decoded = parseJwt(payload.data.accessToken);

		if (!decoded) {
			return NextResponse.json(
				{ success: false, message: "Máy chủ trả về token không hợp lệ." },
				{ status: 502 }
			);
		}

		const session = await getSession();

		session.id = decoded.id;
		session.firstName = "";
		session.lastName = "";
		session.email = decoded.email || email;
		session.phoneNumber = "";
		session.role = decoded.role;
		session.accessToken = payload.data.accessToken;
		session.refreshToken = payload.data.refreshToken;

		await session.save();

		return NextResponse.json({ success: true, data: toSessionUser(session) });
	} catch (error) {
		console.error("[api/auth/login] Backend login failed", error);
		return NextResponse.json(
			{ success: false, message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau." },
			{ status: 502 }
		);
	}
}
