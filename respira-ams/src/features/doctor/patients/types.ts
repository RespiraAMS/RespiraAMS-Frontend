/** Treatment outcome as returned by the backend (`TreatmentOutcome` enum). */
export type TreatmentOutcome = "InTreatment" | "Recovered" | "Death" | "OutOfScope";

/** Gender as returned by the backend (`Gender` enum). */
export type ApiGender = "Male" | "Female";

export type PatientStatus = "treating" | "recovered" | "deceased" | "outOfScope";

export type DisplayGender = "Nam" | "Nữ";

export interface NextOfKin {
	id: string;
	fullName: string;
	phoneNumber: string;
	relationship: string;
}

export interface Patient {
	id: string;
	name: string;
	code: string;
	age: number;
	gender: DisplayGender;
	status: PatientStatus;
	/** DD/MM/YYYY */
	birthDate: string;
	// Only available once the full record has been loaded (GET /patients/{id}).
	phone?: string;
	bhyt?: string;
	address?: string;
	city?: string;
	height?: number;
	weight?: number;
	/** ISO datetime */
	admission?: string;
	/** ISO datetime */
	discharge?: string | null;
	nextOfKins?: NextOfKin[];
	treatmentCount?: number;
}

export type StatFilter = "all" | "Male" | "Female";

// ---- Backend DTOs ----

export interface PaginationMetadata {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	totalItemCount: number;
	pageCount: number;
	currentPage: number;
	pageSize: number;
}

export interface Pagination<T> {
	metadata: PaginationMetadata;
	items: T[];
}

export interface PatientListItemDto {
	id: string;
	fullName: string;
	dateOfBirth: string; // yyyy-MM-dd
	age: number;
	gender: ApiGender;
	medicalRecordCode: string;
	treatmentOutcome: TreatmentOutcome;
}

export interface PatientDto {
	id: string;
	fullName: string;
	phoneNumber: string;
	dateOfBirth: string;
	gender: ApiGender;
	height: number;
	weight: number;
	medicalRecordCode: string;
	healthInsuranceCard: string;
	address: string;
	city: string;
	admission: string;
	discharge?: string | null;
	treatmentOutcome: TreatmentOutcome;
	nextOfKins: NextOfKin[];
	treatments: { id: string }[];
}

export interface PatientPayload {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	dateOfBirth: string; // yyyy-MM-dd
	gender: ApiGender;
	height: number;
	weight: number;
	medicalRecordCode: string;
	healthInsuranceCard: string;
	address: string;
	city: string;
}
