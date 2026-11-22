/**
 * Shared role constants and route-area authorization helpers.
 *
 * Backend roles are stored in the session as-is (e.g. "Admin",
 * "MedicalRegulationReviewer"). The legacy "manager" value is still accepted
 * because older sessions may have stored the display role instead.
 */

export type RouteArea = "admin" | "doctor" | "manage";

export const ROLE_ADMIN = "admin";
export const ROLE_DOCTOR = "doctor";
export const ROLE_HEAD_DEPARTMENT_DOCTOR = "headdepartmentdoctor";
export const ROLE_MEDICAL_REGULATION_REVIEWER = "medicalregulationreviewer";
export const ROLE_MANAGER = "manager";

const AREA_ROLES: Record<RouteArea, readonly string[]> = {
	admin: [ROLE_ADMIN],
	doctor: [ROLE_DOCTOR, ROLE_HEAD_DEPARTMENT_DOCTOR],
	manage: [ROLE_MANAGER, ROLE_MEDICAL_REGULATION_REVIEWER, ROLE_HEAD_DEPARTMENT_DOCTOR],
};

const KNOWN_ROLES: readonly string[] = [
	ROLE_ADMIN,
	ROLE_DOCTOR,
	ROLE_HEAD_DEPARTMENT_DOCTOR,
	ROLE_MEDICAL_REGULATION_REVIEWER,
	ROLE_MANAGER,
];

export function normalizeRole(role: string | null | undefined): string {
	return (role ?? "").trim().toLowerCase();
}

export function isKnownRole(role: string | null | undefined): boolean {
	return KNOWN_ROLES.includes(normalizeRole(role));
}

export function canAccessArea(role: string | null | undefined, area: RouteArea): boolean {
	return AREA_ROLES[area].includes(normalizeRole(role));
}

/** Landing page for a role. Unknown roles are sent to the login page. */
export function getDefaultDashboard(role: string | null | undefined): string {
	const normalized = normalizeRole(role);

	if (normalized === ROLE_ADMIN) return "/admin/dashboard";
	if (normalized === ROLE_MANAGER || normalized === ROLE_MEDICAL_REGULATION_REVIEWER) {
		return "/manage/dashboard";
	}
	if (normalized === ROLE_DOCTOR || normalized === ROLE_HEAD_DEPARTMENT_DOCTOR) {
		return "/doctor/patients";
	}

	return "/login";
}
