import { AcademicTitle, DegreeType, PositionType, UserRole } from "./types";

export const DEGREE_LABELS: Record<DegreeType, string> = {
	Professor: "Giáo sư",
	Doctor: "Bác sĩ",
	Master: "Thạc sĩ",
	Bachelor: "Cử nhân",
	Associate: "Cao đẳng",
	Undergraduate: "Chưa tốt nghiệp",
	Graduate: "Đã tốt nghiệp",
	PhD: "Tiến sĩ",
	PostDoc: "Sau tiến sĩ",
};

export const ACADEMIC_TITLE_LABELS: Record<AcademicTitle, string> = {
	None: "Không",
	AssociateProfessor: "Phó giáo sư (PGS)",
	Professor: "Giáo sư (GS)",
};

export const POSITION_LABELS: Record<PositionType, string> = {
	StaffDoctor: "Bác sĩ điều trị",
	SeniorDoctor: "Bác sĩ cao cấp",
	DepartmentDeputyHead: "Phó trưởng khoa",
	HeadOfDepartment: "Trưởng khoa",
	DeputyDirector: "Phó giám đốc",
	Director: "Giám đốc",
};

export const ROLE_LABELS: Record<UserRole, string> = {
	Doctor: "Bác sĩ",
	Manager: "Trưởng khoa / Quản lý",
	Admin: "Quản trị viên",
};

export function formatDegrees(degrees?: DegreeType[]): string {
	if (!degrees || degrees.length === 0) return "Chưa cập nhật";
	return degrees.map((d) => DEGREE_LABELS[d] || d).join(", ");
}

export function formatFullNameWithTitle(
	lastName: string,
	firstName: string,
	academicTitle?: AcademicTitle,
	degrees?: DegreeType[]
): string {
	let prefix = "";
	if (academicTitle === "Professor") prefix = "GS. ";
	else if (academicTitle === "AssociateProfessor") prefix = "PGS. ";
	else if (degrees?.includes("PhD")) prefix = "TS. ";
	else if (degrees?.includes("Master")) prefix = "ThS. ";
	else if (degrees?.includes("Doctor")) prefix = "BS. ";

	return `${prefix}${lastName} ${firstName}`.trim();
}

export function formatDate(dateString?: string): string {
	if (!dateString) return "—";
	try {
		const d = new Date(dateString);
		return d.toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
}

export function formatDateTime(dateString?: string): string {
	if (!dateString) return "—";
	try {
		const d = new Date(dateString);
		return d.toLocaleDateString("vi-VN", {
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

