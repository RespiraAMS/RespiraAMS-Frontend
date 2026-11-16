import { AcademicTitle, DegreeType } from "./types";

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
