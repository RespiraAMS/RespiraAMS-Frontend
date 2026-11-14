import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { toSessionUser } from "@/lib/server-auth";

export async function GET() {
	const session = await getSession();

	if (!session.accessToken || !session.role) {
		return NextResponse.json({ success: false }, { status: 401 });
	}

	return NextResponse.json({ success: true, data: toSessionUser(session) });
}
