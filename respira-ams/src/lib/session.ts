import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "./session-config";

export { sessionOptions };
export type { SessionData };

export async function getSession(): Promise<IronSession<SessionData>> {
	const cookieStore = await cookies();
	return getIronSession<SessionData>(cookieStore, sessionOptions);
}
