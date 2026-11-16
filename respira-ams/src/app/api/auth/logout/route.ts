import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-fetch";
import { getSession } from "@/lib/session";

export async function POST() {
	const session = await getSession();
	const accessToken = session.accessToken;
	const refreshToken = session.refreshToken;

	if (accessToken && refreshToken) {
		try {
			await backendFetch("/auth/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ accessToken, refreshToken }),
			});
		} catch (error) {
			console.error("[api/auth/logout] Backend logout failed", error);
		}
	}

	session.destroy();

	return NextResponse.json({ success: true });
}
