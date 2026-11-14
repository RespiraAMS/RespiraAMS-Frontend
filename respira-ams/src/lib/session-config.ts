import type { SessionOptions } from "iron-session";

export interface SessionData {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	/** Raw backend role, e.g. Admin, Doctor, HeadDepartmentDoctor, MedicalRegulationReviewer. */
	role: string;
	accessToken: string;
	refreshToken: string;
}

const FALLBACK_PASSWORD = "complex_password_at_least_32_characters_long_for_security";

export const sessionOptions: SessionOptions = {
	password: process.env.SESSION_SECRET || FALLBACK_PASSWORD,
	cookieName: "respira_session",
	ttl: 60 * 60 * 24 * 7,
	chunk: true,
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax",
		path: "/",
	},
};
