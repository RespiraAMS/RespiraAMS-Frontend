import type { IronSession } from "iron-session";
import { backendFetch } from "./backend-fetch";
import { parseJwt, toDisplayRole, type DisplayRole } from "./jwt";
import type { SessionData } from "./session-config";

interface BackendTokenResult {
	accessToken?: string;
	refreshToken?: string;
}

interface BackendResult<T> {
	statusCode?: string;
	data?: T | null;
	error?: { description?: string } | null;
}

export interface SessionUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	role: DisplayRole;
}

export type RefreshOutcome = "ok" | "unauthorized" | "error";

export function toSessionUser(session: IronSession<SessionData>): SessionUser {
	return {
		id: session.id ?? "",
		firstName: session.firstName ?? "",
		lastName: session.lastName ?? "",
		email: session.email ?? "",
		phoneNumber: session.phoneNumber ?? "",
		role: toDisplayRole(session.role ?? ""),
	};
}

/**
 * Rotates the refresh token stored in the iron-session cookie.
 * The session is saved only when the backend returns a new token pair.
 */
export async function refreshSessionTokens(
	session: IronSession<SessionData>
): Promise<RefreshOutcome> {
	if (!session.refreshToken) return "unauthorized";

	try {
		const callBackend = () =>
			backendFetch("/auth/refresh", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ refreshToken: session.refreshToken }),
			});

		let response = await callBackend();

		// The backend can reply 500 when a token is rotated in the same second it was
		// issued (duplicate token hash). Wait a moment and retry once.
		if (response.status >= 500) {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			response = await callBackend();
		}

		const payload = (await response.json().catch(() => null)) as BackendResult<BackendTokenResult> | null;

		if (response.status === 400 || response.status === 401) {
			return "unauthorized";
		}

		if (
			!response.ok ||
			!payload?.data?.accessToken ||
			!payload.data.refreshToken
		) {
			console.warn("[auth/refresh] Backend refresh rejected", {
				status: response.status,
				description: payload?.error?.description,
			});
			return "error";
		}

		const decoded = parseJwt(payload.data.accessToken);

		session.accessToken = payload.data.accessToken;
		session.refreshToken = payload.data.refreshToken;

		if (decoded) {
			session.id = decoded.id;
			session.email = decoded.email;
			session.role = decoded.role;
		}

		await session.save();
		return "ok";
	} catch (error) {
		console.error("[auth/refresh] Backend refresh request failed", error);
		return "error";
	}
}
