import { AcademicTitle, DegreeType, PositionType } from "./types";

/** Maximum characters accepted by the phone input, including the leading "+". */
export const PHONE_MAX_LENGTH = 12;

/** Citizen identification numbers are always 12 digits. */
export const CITIZEN_ID_LENGTH = 12;

/** Positions a Doctor account may hold when created from the admin dialog. */
export const DOCTOR_POSITIONS: PositionType[] = ["StaffDoctor", "SeniorDoctor"];

/** A HeadDepartmentDoctor account always holds this position. */
export const HEAD_DEPARTMENT_POSITION: PositionType = "HeadOfDepartment";

/**
 * Keeps only digits and enforces the supported Vietnamese phone shapes:
 * 0xxxxxxxxx, +84xxxxxxxxx, or 84xxxxxxxxx.
 */
export function sanitizePhoneInput(value: string): string {
	const startsWithPlus = value.trimStart().startsWith("+");
	const digits = value.replace(/\D/g, "");

	if (startsWithPlus) return `+${digits.slice(0, 11)}`;
	if (digits.startsWith("84")) return digits.slice(0, 11);

	return digits.slice(0, 10);
}

/** Keeps only digits and caps the value at the citizen ID length. */
export function sanitizeCitizenIdInput(value: string): string {
	return value.replace(/\D/g, "").slice(0, CITIZEN_ID_LENGTH);
}

export function formatFullNameWithTitle(
	lastName: string,
	firstName: string,
	academicTitle?: AcademicTitle,
	degrees?: DegreeType[],
	locale: string = "vi"
): string {
	const isVietnamese = locale.startsWith("vi");
	let prefix = "";

	if (academicTitle === "Professor") prefix = isVietnamese ? "GS. " : "Prof. ";
	else if (academicTitle === "AssociateProfessor") {
		prefix = isVietnamese ? "PGS. " : "Assoc. Prof. ";
	} else if (degrees?.includes("PhD")) prefix = isVietnamese ? "TS. " : "PhD. ";
	else if (degrees?.includes("Master")) prefix = isVietnamese ? "ThS. " : "MSc. ";
	else if (degrees?.includes("Doctor")) prefix = isVietnamese ? "BS. " : "Dr. ";

	return `${prefix}${lastName} ${firstName}`.trim();
}

export function formatDate(dateString?: string, locale: string = "vi-VN"): string {
	if (!dateString) return "—";
	try {
		const d = new Date(dateString);
		return d.toLocaleDateString(locale, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
}

export function formatDateTime(dateString?: string, locale: string = "vi-VN"): string {
	if (!dateString) return "—";
	try {
		const d = new Date(dateString);
		return d.toLocaleDateString(locale, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateString;
	}
}
