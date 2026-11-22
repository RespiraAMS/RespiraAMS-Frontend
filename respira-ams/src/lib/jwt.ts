export type BackendRole =
	| "Admin"
	| "Doctor"
	| "HeadDepartmentDoctor"
	| "MedicalRegulationReviewer";

export type DisplayRole = "Admin" | "Doctor" | "Manager";

export interface DecodedAuthToken {
	id: string;
	email: string;
	role: BackendRole;
	exp?: number;
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_IDENTIFIER_CLAIM =
	"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

function decodeBase64Url(value: string): string {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized.padEnd(
		normalized.length + ((4 - (normalized.length % 4)) % 4),
		"="
	);
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

function readRawRole(rawRole: unknown): string | null {
	if (typeof rawRole === "string") return rawRole;
	if (Array.isArray(rawRole)) {
		const first = rawRole.find((value): value is string => typeof value === "string");
		return first ?? null;
	}
	return null;
}

/**
 * Maps a backend role to its canonical form. Unknown or missing roles return
 * null so callers fail closed instead of silently granting Doctor access.
 */
export function normalizeBackendRole(rawRole: string | null | undefined): BackendRole | null {
	if (!rawRole) return null;

	switch (rawRole.trim().toLowerCase()) {
		case "admin":
			return "Admin";
		case "medicalregulationreviewer":
			return "MedicalRegulationReviewer";
		case "headdepartmentdoctor":
			return "HeadDepartmentDoctor";
		case "doctor":
			return "Doctor";
		default:
			return null;
	}
}

export function toDisplayRole(rawRole: string | null | undefined): DisplayRole | null {
	const role = normalizeBackendRole(rawRole);
	if (!role) return null;
	if (role === "Admin") return "Admin";
	if (role === "MedicalRegulationReviewer") return "Manager";
	return "Doctor";
}

export function parseJwt(token: string): DecodedAuthToken | null {
	try {
		const parts = token.split(".");
		if (parts.length < 2) return null;

		const decoded = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
		const rawRole = readRawRole(decoded.role) ?? readRawRole(decoded[ROLE_CLAIM]);
		const role = normalizeBackendRole(rawRole);
		if (!role) return null;

		const rawId =
			decoded.sub ??
			decoded.nameid ??
			decoded[NAME_IDENTIFIER_CLAIM] ??
			"";
		const rawEmail = decoded.email ?? decoded[EMAIL_CLAIM] ?? "";

		return {
			id: String(rawId),
			email: String(rawEmail),
			role,
			exp: typeof decoded.exp === "number" ? decoded.exp : undefined,
		};
	} catch {
		return null;
	}
}
