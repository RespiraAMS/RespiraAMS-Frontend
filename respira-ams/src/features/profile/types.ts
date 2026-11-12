// ─── Backend Enums & Options ────────────────────────────────────────────────

export type DegreeTypeValue =
	| "Professor"
	| "Doctor"
	| "Master"
	| "Bachelor"
	| "Associate"
	| "Undergraduate"
	| "Graduate"
	| "PhD"
	| "PostDoc";

export type AcademicTitleValue = "None" | "AssociateProfessor" | "Professor";

export type PositionTypeValue =
	| "StaffDoctor"
	| "SeniorDoctor"
	| "DepartmentDeputyHead"
	| "HeadOfDepartment"
	| "DeputyDirector"
	| "Director";

export type GenderTypeValue = "Male" | "Female";

export type ProfileRoleValue = "Doctor" | "HeadDepartmentDoctor";

export const degreeOptions: Array<{ value: DegreeTypeValue; label: string; short: string }> = [
	{ value: "Doctor", label: "Bác sĩ (Doctor)", short: "BS" },
	{ value: "Master", label: "Thạc sĩ Y khoa (Master)", short: "ThS" },
	{ value: "PhD", label: "Tiến sĩ Y khoa (PhD)", short: "TS" },
	{ value: "Bachelor", label: "Cử nhân Y khoa (Bachelor)", short: "CN" },
	{ value: "Professor", label: "Học vị Giáo sư (Professor)", short: "GS" },
	{ value: "PostDoc", label: "Sau Tiến sĩ (Post-Doctorate)", short: "PostDoc" },
	{ value: "Associate", label: "Bằng liên kết (Associate)", short: "Assoc" },
	{ value: "Graduate", label: "Sau đại học (Graduate)", short: "Sau ĐH" },
	{ value: "Undergraduate", label: "Đại học (Undergraduate)", short: "ĐH" },
];

export const academicTitleOptions: Array<{ value: AcademicTitleValue; label: string; prefix: string }> = [
	{ value: "None", label: "Không có", prefix: "" },
	{ value: "AssociateProfessor", label: "Phó Giáo sư (PGS)", prefix: "PGS." },
	{ value: "Professor", label: "Giáo sư (GS)", prefix: "GS." },
];

export const positionOptions: Array<{ value: PositionTypeValue; label: string; badgeColor: string }> = [
	{ value: "StaffDoctor", label: "Bác sĩ điều trị", badgeColor: "sky" },
	{ value: "SeniorDoctor", label: "Bác sĩ cao cấp", badgeColor: "blue" },
	{ value: "DepartmentDeputyHead", label: "Phó Trưởng khoa", badgeColor: "indigo" },
	{ value: "HeadOfDepartment", label: "Trưởng khoa", badgeColor: "emerald" },
	{ value: "DeputyDirector", label: "Phó Giám đốc Bệnh viện", badgeColor: "amber" },
	{ value: "Director", label: "Giám đốc Bệnh viện", badgeColor: "rose" },
];

// Helper labels
export const DEGREE_LABELS: Record<string, string> = {
	Doctor: "Bác sĩ",
	Master: "Thạc sĩ",
	PhD: "Tiến sĩ",
	Bachelor: "Cử nhân",
	Professor: "Giáo sư",
	PostDoc: "Sau Tiến sĩ",
	Associate: "Liên kết",
	Graduate: "Sau đại học",
	Undergraduate: "Đại học",
};

export const ACADEMIC_TITLE_LABELS: Record<string, string> = {
	None: "Không",
	AssociateProfessor: "Phó Giáo sư (PGS)",
	Professor: "Giáo sư (GS)",
};

export const POSITION_LABELS: Record<string, string> = {
	StaffDoctor: "Bác sĩ điều trị",
	SeniorDoctor: "Bác sĩ cao cấp",
	DepartmentDeputyHead: "Phó Trưởng khoa",
	HeadOfDepartment: "Trưởng khoa",
	DeputyDirector: "Phó Giám đốc Bệnh viện",
	Director: "Giám đốc Bệnh viện",
};

export const ROLE_LABELS: Record<string, string> = {
	Doctor: "Bác sĩ chuyên môn",
	HeadDepartmentDoctor: "Bác sĩ Trưởng khoa",
	Admin: "Quản trị viên",
	Manager: "Quản lý",
};

// ─── Profile Types ────────────────────────────────────────────────────────────

export interface DoctorProfile {
	id?: string;
	doctorId?: string;
	accountId?: string;
	role?: ProfileRoleValue | string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	address: string;
	gender: boolean; // true = Male, false = Female
	dateOfBirth: string; // YYYY-MM-DD
	citizenIdentificationCard: string;
	academicTitle: AcademicTitleValue | string;
	degree: string;
	degrees: DegreeTypeValue[] | string[];
	position: PositionTypeValue | string;
	specialty?: string;
	certificates?: string[];
	educations?: string[];
	mediaId?: string;
	mediaUrl?: string;
	avatarUrl?: string;
	accountRole?: string;
	accountStatus?: string;
	createdAt?: string;
}

export interface ProfileFormState {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	address: string;
	position: PositionTypeValue | string;
	academicTitle: AcademicTitleValue | string;
	citizenIdentificationCard: string;
	dateOfBirth: string;
	gender: boolean;
	degrees: DegreeTypeValue[] | string[];
	newPassword?: string;
	confirmPassword?: string;
}

// ─── Default Values ───────────────────────────────────────────────────────────

export const defaultDoctor: DoctorProfile = {
	id: "",
	doctorId: "",
	accountId: "",
	role: "Doctor",
	firstName: "",
	lastName: "",
	email: "",
	phoneNumber: "",
	address: "",
	gender: true,
	dateOfBirth: "",
	citizenIdentificationCard: "",
	academicTitle: "None",
	degree: "Doctor",
	degrees: ["Doctor"],
	position: "StaffDoctor",
	specialty: undefined,
	certificates: [],
	educations: [],
	mediaUrl: undefined,
	avatarUrl: undefined,
	accountRole: "Doctor",
	accountStatus: "Active",
};

export const defaultFormState: ProfileFormState = {
	firstName: "",
	lastName: "",
	email: "",
	phoneNumber: "",
	address: "",
	position: "StaffDoctor",
	academicTitle: "None",
	citizenIdentificationCard: "",
	dateOfBirth: "",
	gender: true,
	degrees: ["Doctor"],
	newPassword: "",
	confirmPassword: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const parseIsoToLocalDate = (value?: string | null): string => {
	if (!value) return "";
	try {
		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			return value;
		}
		const d = new Date(value);
		if (isNaN(d.getTime())) return value.slice(0, 10);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	} catch {
		return value?.slice(0, 10) || "";
	}
};

export const formatDate = (value?: string | null): string => {
	if (!value) return "Chưa cập nhật";
	const localDateStr = parseIsoToLocalDate(value);
	if (/^\d{4}-\d{2}-\d{2}$/.test(localDateStr)) {
		const [year, month, day] = localDateStr.split("-");
		return `${day}/${month}/${year}`;
	}
	return localDateStr;
};

export const maskValue = (value?: string | null): string => {
	if (!value) return "Chưa cập nhật";
	if (value.length <= 4) return "****";
	const visible = value.slice(-4);
	return `${"*".repeat(Math.max(4, value.length - 4))}${visible}`;
};

export const getDoctorDisplayName = (doctor: DoctorProfile): string => {
	const firstName = (doctor.firstName || "").trim();
	const lastName = (doctor.lastName || "").trim();
	const fullName = [lastName, firstName].filter(Boolean).join(" ").trim();
	if (!fullName) {
		if (doctor.email) {
			return `Bác sĩ (${doctor.email})`;
		}
		return "Bác sĩ";
	}

	const titlePrefix =
		doctor.academicTitle === "Professor"
			? "GS. "
			: doctor.academicTitle === "AssociateProfessor"
				? "PGS. "
				: "";

	let degreePrefix = "BS. ";
	if (doctor.degrees?.includes("PhD")) {
		degreePrefix = "TS. ";
	} else if (doctor.degrees?.includes("Master")) {
		degreePrefix = "ThS. ";
	} else if (doctor.degrees?.includes("Doctor")) {
		degreePrefix = "BS. ";
	}

	return `${titlePrefix}${degreePrefix}${fullName}`;
};
