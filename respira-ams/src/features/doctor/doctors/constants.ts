import {
	AcademicTitle,
	AccountStatus,
	DoctorDegree,
	DoctorGender,
	DoctorPosition,
	DoctorRole,
} from "./types";

export const GENDER_LABELS: Record<DoctorGender, string> = {
	Male: "Nam",
	Female: "Nữ",
};

export const ACADEMIC_TITLE_LABELS: Record<AcademicTitle, string> = {
	None: "Không",
	AssociateProfessor: "Phó Giáo sư (PGS)",
	Professor: "Giáo sư (GS)",
};

export const POSITION_LABELS: Record<DoctorPosition, string> = {
	StaffDoctor: "Bác sĩ điều trị",
	SeniorDoctor: "Bác sĩ cao cấp",
	DepartmentDeputyHead: "Phó Trưởng khoa",
	HeadOfDepartment: "Trưởng khoa",
	DeputyDirector: "Phó Giám đốc",
	Director: "Giám đốc",
};

export const ROLE_LABELS: Record<DoctorRole, string> = {
	HeadDepartmentDoctor: "Trưởng khoa (Quản lý)",
	Doctor: "Bác sĩ",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
	Active: "Đang hoạt động",
	InActive: "Ngừng hoạt động",
};

export const DEGREE_LABELS: Record<DoctorDegree, string> = {
	Professor: "Giáo sư",
	Doctor: "Bác sĩ",
	Master: "Thạc sĩ",
	Bachelor: "Cử nhân",
	Associate: "Cao đẳng",
	Undergraduate: "Đại học",
	Graduate: "Sau đại học",
	PhD: "Tiến sĩ",
	PostDoc: "Sau tiến sĩ",
};

export type DoctorPrefixKey = "Professor" | "AssociateProfessor" | "Default";

export function formatDoctorFullName(
	doctor: {
		firstName: string;
		lastName: string;
		academicTitle?: string;
	},
	tPrefix?: (key: DoctorPrefixKey) => string
): string {
	const prefixKey: DoctorPrefixKey =
		doctor.academicTitle === "Professor"
			? "Professor"
			: doctor.academicTitle === "AssociateProfessor"
			? "AssociateProfessor"
			: "Default";

	const prefix = tPrefix
		? tPrefix(prefixKey)
		: prefixKey === "Professor"
		? "GS."
		: prefixKey === "AssociateProfessor"
		? "PGS."
		: "BS.";

	return `${prefix} ${doctor.lastName} ${doctor.firstName}`.trim();
}

export function getDoctorGenderLabel(
	gender: string,
	t?: (key: DoctorGender) => string
): string {
	if (gender in GENDER_LABELS) {
		const typedKey = gender as DoctorGender;
		return t ? t(typedKey) : GENDER_LABELS[typedKey];
	}
	return gender;
}

export function getAcademicTitleLabel(
	title: string,
	t?: (key: AcademicTitle) => string
): string {
	if (title in ACADEMIC_TITLE_LABELS) {
		const typedKey = title as AcademicTitle;
		return t ? t(typedKey) : ACADEMIC_TITLE_LABELS[typedKey];
	}
	return title;
}

export function getDoctorPositionLabel(
	position: string,
	t?: (key: DoctorPosition) => string
): string {
	if (position in POSITION_LABELS) {
		const typedKey = position as DoctorPosition;
		return t ? t(typedKey) : POSITION_LABELS[typedKey];
	}
	return position;
}

export function getDoctorRoleLabel(
	role: string,
	t?: (key: DoctorRole) => string
): string {
	if (role in ROLE_LABELS) {
		const typedKey = role as DoctorRole;
		return t ? t(typedKey) : ROLE_LABELS[typedKey];
	}
	return role;
}

export function getAccountStatusLabel(
	status: string,
	t?: (key: AccountStatus) => string
): string {
	if (status in ACCOUNT_STATUS_LABELS) {
		const typedKey = status as AccountStatus;
		return t ? t(typedKey) : ACCOUNT_STATUS_LABELS[typedKey];
	}
	return status;
}

export function getDoctorDegreeLabel(
	degree: string,
	t?: (key: DoctorDegree) => string
): string {
	if (degree in DEGREE_LABELS) {
		const typedKey = degree as DoctorDegree;
		return t ? t(typedKey) : DEGREE_LABELS[typedKey];
	}
	return degree;
}