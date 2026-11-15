import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { refreshSessionTokens, toSessionUser } from "@/lib/server-auth";

export async function POST() {
	const session = await getSession();
	const outcome = await refreshSessionTokens(session);

	if (outcome === "ok") {
		return NextResponse.json({ success: true, data: toSessionUser(session) });
	}

	if (outcome === "unauthorized") {
		session.destroy();
		return NextResponse.json(
			{ success: false, message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
			{ status: 401 }
		);
	}

	return NextResponse.json(
		{ success: false, message: "Không thể làm mới phiên đăng nhập. Vui lòng thử lại sau." },
		{ status: 503 }
	);
}
