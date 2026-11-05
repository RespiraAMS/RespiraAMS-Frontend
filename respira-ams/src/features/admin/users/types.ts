export type UserRole = "Doctor" | "Manager" | "Admin";

export type UserStatus = "Active" | "Inactive";

export type AcademicTitle = "None" | "AssociateProfessor" | "Professor";

export type DegreeType =
	| "Professor"
	| "Doctor"
	| "Master"
	| "Bachelor"
	| "Associate"
	| "Undergraduate"
	| "Graduate"
	| "PhD"
	| "PostDoc";

export type PositionType =
	| "StaffDoctor"
	| "SeniorDoctor"
	| "DepartmentDeputyHead"
	| "HeadOfDepartment"
	| "DeputyDirector"
	| "Director";

export type GenderType = "Male" | "Female";

export interface UserItem {
	id: string; // Account ID
	doctorId?: string; // Doctor / Profile ID
	mediaId?: string; // Avatar Media ID
	email: string;
	phone: string;
	role: UserRole;
	status: UserStatus;
	isEmailConfirmed: boolean;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
	degrees: DegreeType[];
	academicTitle: AcademicTitle;
	position: PositionType;
	gender: GenderType;
	citizenIdentificationNumber: string;
	dateOfBirth?: string;
	address: string;
	createdAt: string;
}

export interface CreateUserPayload {
	email: string;
	password: string;
	phone: string;
	role: "Doctor" | "Manager";
	firstName: string;
	lastName: string;
	degrees: DegreeType[];
	academicTitle: AcademicTitle;
	position: PositionType;
	gender: GenderType;
	citizenIdentificationNumber: string;
	dateOfBirth?: string;
	address: string;
	avatarFile?: File | null;
}

export interface UpdateUserPayload {
	accountId: string;
	doctorId: string;
	email: string;
	phone: string;
	password?: string;
	firstName: string;
	lastName: string;
	degrees: DegreeType[];
	academicTitle: AcademicTitle;
	position: PositionType;
	gender: GenderType;
	citizenIdentificationNumber: string;
	dateOfBirth?: string;
	address: string;
	avatarFile?: File | null;
}

export interface UserFilters {
	search: string;
	role: string;
	status: string;
}

export interface UserStats {
	total: number;
	doctors: number;
	managers: number;
	admins: number;
	active: number;
	inactive: number;
}

