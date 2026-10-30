import { apiRequest, buildQuery } from "@/lib/api";
import {
	ApiGender,
	DisplayGender,
	Pagination,
	Patient,
	PatientDto,
	PatientListItemDto,
	PatientPayload,
	PatientStatus,
	TreatmentOutcome,
} from "./types";

// ---- Mapping helpers ----

const OUTCOME_TO_STATUS: Record<TreatmentOutcome, PatientStatus> = {
	InTreatment: "treating",
	Recovered: "recovered",
	Death: "deceased",
	OutOfScope: "outOfScope",
};

export const STATUS_TO_OUTCOME: Record<PatientStatus, TreatmentOutcome> = {
	treating: "InTreatment",
	recovered: "Recovered",
	deceased: "Death",
	outOfScope: "OutOfScope",
};

export const toApiGender = (g: DisplayGender): ApiGender =>
	g === "Nam" ? "Male" : "Female";

const toDisplayGender = (g: ApiGender): DisplayGender =>
	g === "Male" ? "Nam" : "Nữ";

/** yyyy-MM-dd -> dd/MM/yyyy */
export function isoDateToDisplay(iso: string): string {
	const [y, m, d] = iso.slice(0, 10).split("-");
	return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** dd/MM/yyyy -> yyyy-MM-dd (returns null if invalid) */
export function displayDateToIso(display: string): string | null {
	const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(display.trim());
	if (!match) return null;
	const [, d, m, y] = match;
	const date = new Date(Number(y), Number(m) - 1, Number(d));
	if (
		date.getFullYear() !== Number(y) ||
		date.getMonth() !== Number(m) - 1 ||
		date.getDate() !== Number(d)
	) {
		return null;
	}
	return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Backend full name is "LastName FirstName" (Vietnamese style). */
export function splitFullName(fullName: string): {
	lastName: string;
	firstName: string;
} {
	const parts = fullName.trim().split(/\s+/);
	const firstName = parts.pop() ?? "";
	return { lastName: parts.join(" "), firstName };
}

function mapListItem(dto: PatientListItemDto): Patient {
	return {
		id: dto.id,
		name: dto.fullName,
		code: dto.medicalRecordCode,
		age: dto.age,
		gender: toDisplayGender(dto.gender),
		status: OUTCOME_TO_STATUS[dto.treatmentOutcome] ?? "treating",
		birthDate: isoDateToDisplay(dto.dateOfBirth),
	};
}

function mapPatient(dto: PatientDto): Patient {
	const birthYear = Number(dto.dateOfBirth.slice(0, 4));
	return {
		id: dto.id,
		name: dto.fullName,
		code: dto.medicalRecordCode,
		// Backend computes age by year only
		age: new Date().getFullYear() - birthYear,
		gender: toDisplayGender(dto.gender),
		status: OUTCOME_TO_STATUS[dto.treatmentOutcome] ?? "treating",
		birthDate: isoDateToDisplay(dto.dateOfBirth),
		phone: dto.phoneNumber,
		bhyt: dto.healthInsuranceCard,
		address: dto.address,
		city: dto.city,
		height: dto.height,
		weight: dto.weight,
		admission: dto.admission,
		discharge: dto.discharge ?? null,
		nextOfKins: dto.nextOfKins ?? [],
		treatmentCount: dto.treatments?.length ?? 0,
	};
}

// ---- API calls ----

export interface PagedPatients {
	items: Patient[];
	totalCount: number;
	totalPages: number;
}

function mapPage(page: Pagination<PatientListItemDto>): PagedPatients {
	return {
		items: (page.items ?? []).map(mapListItem),
		totalCount: page.metadata?.totalItemCount ?? 0,
		totalPages: Math.max(1, page.metadata?.pageCount ?? 1),
	};
}

export async function fetchPatients(params: {
	page: number;
	size: number;
	gender?: ApiGender;
}): Promise<PagedPatients> {
	const data = await apiRequest<Pagination<PatientListItemDto>>(
		`/patients${buildQuery({ page: params.page, size: params.size, gender: params.gender })}`
	);
	return mapPage(data);
}

export async function searchPatients(params: {
	page: number;
	size: number;
	searchTerm: string;
}): Promise<PagedPatients> {
	const data = await apiRequest<Pagination<PatientListItemDto>>(
		`/patients/search${buildQuery({ page: params.page, size: params.size, searchTerm: params.searchTerm })}`
	);
	return mapPage(data);
}

export async function fetchPatientById(id: string): Promise<Patient> {
	return mapPatient(await apiRequest<PatientDto>(`/patients/${id}`));
}

export async function createPatient(payload: PatientPayload): Promise<string> {
	const result = await apiRequest<{ id: string }>("/patients", {
		method: "POST",
		body: payload,
	});
	return result.id;
}

export async function updatePatient(
	id: string,
	payload: PatientPayload
): Promise<void> {
	await apiRequest(`/patients/${id}`, { method: "PUT", body: payload });
}

export async function dischargePatient(
	id: string,
	outcome: TreatmentOutcome
): Promise<void> {
	await apiRequest(`/patients/${id}/discharge${buildQuery({ outcome })}`, {
		method: "PUT",
	});
}

export async function deletePatient(id: string): Promise<void> {
	await apiRequest(`/patients/${id}`, { method: "DELETE" });
}

