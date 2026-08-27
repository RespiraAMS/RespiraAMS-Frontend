// ─── Doctor Types ─────────────────────────────────────────────────────────────

export interface DoctorItem {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	role: string;
	createdAt: string;
	address: string;
	degrees: string[];
	academicTitle: string | null;
	citizenIdentificationCard: string;
	gender: boolean;
	dateOfBirth: string | null;
	position: string;
	mediaId: string | null;
	mediaUrl: string | null;
}

// ─── Form Options ──────────────────────────────────────────────────────────────

export const ACADEMIC_TITLE_OPTIONS = [
	"None",
	"AssociateProfessor",
	"Professor",
] as const;

export const POSITION_OPTIONS = [
	"StaffDoctor",
	"SeniorDoctor",
	"DepartmentDeputyHead",
	"DepartmentHead",
	"DeputyDirector",
	"Director",
] as const;

export const DEGREE_OPTIONS = [
	"Doctor",
	"SpecialistLevel1",
	"SpecialistLevel2",
	"Master",
	"PhD",
	"AssociateProfessor",
	"Professor",
] as const;

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_DOCTORS: DoctorItem[] = [
	{
		id: "1",
		firstName: "Nguyễn",
		lastName: "Văn An",
		email: "nguyen.vanan@respira.vn",
		phoneNumber: "0901234567",
		role: "Doctor",
		createdAt: "2024-01-15T08:00:00Z",
		address: "123 Lê Lợi, Quận 1, TP.HCM",
		degrees: ["PhD", "SpecialistLevel2"],
		academicTitle: "AssociateProfessor",
		citizenIdentificationCard: "012345678901",
		gender: true,
		dateOfBirth: "1980-05-15",
		position: "DepartmentHead",
		mediaId: null,
		mediaUrl: null,
	},
	{
		id: "2",
		firstName: "Trần",
		lastName: "Thị Bình",
		email: "tran.thibinh@respira.vn",
		phoneNumber: "0912345678",
		role: "Doctor",
		createdAt: "2024-02-20T09:30:00Z",
		address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
		degrees: ["Master", "SpecialistLevel1"],
		academicTitle: null,
		citizenIdentificationCard: "098765432100",
		gender: false,
		dateOfBirth: "1985-08-22",
		position: "SeniorDoctor",
		mediaId: null,
		mediaUrl: null,
	},
	{
		id: "3",
		firstName: "Lê",
		lastName: "Minh Cường",
		email: "le.minhcuong@respira.vn",
		phoneNumber: "0923456789",
		role: "Doctor",
		createdAt: "2024-03-10T10:00:00Z",
		address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
		degrees: ["Doctor", "PhD"],
		academicTitle: "Professor",
		citizenIdentificationCard: "111222333444",
		gender: true,
		dateOfBirth: "1975-12-01",
		position: "Director",
		mediaId: null,
		mediaUrl: null,
	},
	{
		id: "4",
		firstName: "Phạm",
		lastName: "Thu Dung",
		email: "pham.thudung@respira.vn",
		phoneNumber: "0934567890",
		role: "Doctor",
		createdAt: "2024-04-05T14:00:00Z",
		address: "321 Điện Biên Phủ, Quận 3, TP.HCM",
		degrees: ["SpecialistLevel2"],
		academicTitle: null,
		citizenIdentificationCard: "222333444555",
		gender: false,
		dateOfBirth: "1990-03-18",
		position: "StaffDoctor",
		mediaId: null,
		mediaUrl: null,
	},
	{
		id: "5",
		firstName: "Hoàng",
		lastName: "Đức Thịnh",
		email: "hoang.ducthinh@respira.vn",
		phoneNumber: "0945678901",
		role: "Doctor",
		createdAt: "2024-05-01T08:30:00Z",
		address: "654 Cách Mạng Tháng 8, Quận 10, TP.HCM",
		degrees: ["Master"],
		academicTitle: null,
		citizenIdentificationCard: "333444555666",
		gender: true,
		dateOfBirth: "1988-07-25",
		position: "DepartmentDeputyHead",
		mediaId: null,
		mediaUrl: null,
	},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getInitials = (first: string, last: string) =>
	`${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
