// ─── Profile Types ────────────────────────────────────────────────────────────

export interface DoctorProfile {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	address: string;
	gender: boolean;
	dateOfBirth: string;
	citizenIdentificationCard: string;
	academicTitle: string;
	degree: string;
	degrees: string[];
	position: string;
	specialty: string;
	certificates: string[];
	educations: string[];
	mediaUrl?: string;
}

export interface ProfileFormState {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	address: string;
	position: string;
	academicTitle: string;
	citizenIdentificationCard: string;
	dateOfBirth: string;
	gender: boolean;
	degrees: string[];
}

// ─── Option Lists ─────────────────────────────────────────────────────────────

export const academicTitleOptions = [
	{ value: "None", label: "None" },
	{ value: "AssociateProfessor", label: "Associate Professor" },
	{ value: "Professor", label: "Professor" },
] as const;

export const positionOptions = [
	{ value: "StaffDoctor", label: "Staff Doctor" },
	{ value: "SeniorDoctor", label: "Senior Doctor" },
	{ value: "DepartmentDeputyHead", label: "Department Deputy Head" },
	{ value: "DepartmentHead", label: "Department Head" },
	{ value: "DeputyDirector", label: "Deputy Director" },
	{ value: "Director", label: "Director" },
] as const;

export const degreeOptions = [
	{ value: "Doctor", label: "Doctor" },
	{ value: "SpecialistLevel1", label: "Specialist Level 1" },
	{ value: "SpecialistLevel2", label: "Specialist Level 2" },
	{ value: "Master", label: "Master" },
	{ value: "PhD", label: "PhD" },
	{ value: "AssociateProfessor", label: "Associate Professor" },
	{ value: "Professor", label: "Professor" },
] as const;

// ─── Default Values ───────────────────────────────────────────────────────────

export const defaultDoctor: DoctorProfile = {
	firstName: "Nguyễn",
	lastName: "Văn An",
	email: "nguyen.vanan@respira.vn",
	phoneNumber: "0901234567",
	address: "123 Lê Lợi, Quận 1, TP.HCM",
	gender: true,
	dateOfBirth: "1980-05-15",
	citizenIdentificationCard: "012345678901",
	academicTitle: "AssociateProfessor",
	degree: "PhD",
	degrees: ["PhD", "SpecialistLevel2"],
	position: "DepartmentHead",
	specialty: "Hô hấp học",
	certificates: ["Chứng chỉ Hành nghề Khám chữa bệnh", "ACLS", "BLS"],
	educations: [],
	mediaUrl: undefined,
};

export const defaultFormState: ProfileFormState = {
	firstName: defaultDoctor.firstName,
	lastName: defaultDoctor.lastName,
	email: defaultDoctor.email,
	phoneNumber: defaultDoctor.phoneNumber,
	address: defaultDoctor.address,
	position: defaultDoctor.position,
	academicTitle: defaultDoctor.academicTitle,
	citizenIdentificationCard: defaultDoctor.citizenIdentificationCard,
	dateOfBirth: defaultDoctor.dateOfBirth,
	gender: defaultDoctor.gender,
	degrees: defaultDoctor.degrees,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (value: string): string => {
	if (!value) return "Chưa cập nhật";
	try {
		return new Date(value).toLocaleDateString("vi-VN");
	} catch {
		return value;
	}
};

export const maskValue = (value: string): string => {
	if (!value) return "Chưa cập nhật";
	return "*".repeat(Math.max(8, value.length));
};
