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

export function normalizeBackendRole(rawRole: string): BackendRole {
	const normalized = rawRole.trim().toLowerCase();

	if (normalized === "admin") return "Admin";
	if (normalized === "medicalregulationreviewer") return "MedicalRegulationReviewer";
	if (normalized === "headdepartmentdoctor") return "HeadDepartmentDoctor";
	return "Doctor";
}

export function toDisplayRole(rawRole: string): DisplayRole {
	const role = normalizeBackendRole(rawRole);
	if (role === "Admin") return "Admin";
	if (role === "MedicalRegulationReviewer") return "Manager";
	return "Doctor";
}

export function parseJwt(token: string): DecodedAuthToken | null {
	try {
		const parts = token.split(".");
		if (parts.length < 2) return null;

		const decoded = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
		const rawRole = String(decoded.role ?? decoded[ROLE_CLAIM] ?? "Doctor");

		const rawId =
			decoded.sub ??
			decoded.nameid ??
			decoded[NAME_IDENTIFIER_CLAIM] ??
			"";
		const rawEmail = decoded.email ?? decoded[EMAIL_CLAIM] ?? "";

		return {
			id: String(rawId),
			email: String(rawEmail),
			role: normalizeBackendRole(rawRole),
			exp: typeof decoded.exp === "number" ? decoded.exp : undefined,
		};
	} catch {
		return null;
	}
}
