import { apiRequest, buildQuery } from "@/lib/api";
import {
	AdherenceState,
	ApiGender,
	DisplayGender,
	NextOfKinPayload,
	Pagination,
	Patient,
	PatientDto,
	PatientListItemDto,
	PatientPayload,
	PatientStatus,
	TreatmentOutcome,
	TreatmentPlanDetailDto,
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
	const treatmentsCount =
		dto.treatmentPlans?.length ??
		dto.treatments?.length ??
		0;
	return {
		id: dto.id,
		name: dto.fullName,
		code: dto.medicalRecordCode,
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
		treatmentCount: treatmentsCount,
		treatmentPlans: dto.treatmentPlans ?? [],
	};
}

// ---- Storage & Cache Helpers (chỉ lưu dữ liệu thật từ API) ----

const PATIENTS_STORAGE_KEY = "respira_doctor_patients_v1";

export function getStoredPatients(): Patient[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		// Loại bỏ triệt để dữ liệu giả lập cũ nếu còn sót lại trong cache trình duyệt
		const clean = parsed.filter(
			(p: Patient) => p.id && !p.id.startsWith("pat-")
		);
		if (clean.length !== parsed.length) {
			localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(clean));
		}
		return clean;
	} catch {
		return [];
	}
}

function saveStoredPatients(items: Patient[]): void {
	if (typeof window === "undefined") return;
	try {
		// Chỉ lưu các bản ghi hợp lệ từ API (không chứa ID giả dạng pat-)
		const clean = items.filter((p) => p.id && !p.id.startsWith("pat-"));
		localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(clean));
	} catch (e) {
		console.error("Failed to save patients to localStorage:", e);
	}
}

// ---- API calls (100% dữ liệu thực từ Backend) ----

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
	const query = buildQuery({
		page: params.page,
		size: params.size,
		gender: params.gender,
	});

	const data = await apiRequest<Pagination<PatientListItemDto>>(`/patients${query}`);
	if (data?.items) {
		const mapped = mapPage(data);
		if (params.page === 1 && !params.gender) {
			saveStoredPatients(mapped.items);
		}
		return mapped;
	}

	return {
		items: [],
		totalCount: 0,
		totalPages: 1,
	};
}

export async function searchPatients(params: {
	page: number;
	size: number;
	searchTerm: string;
}): Promise<PagedPatients> {
	const trimmed = params.searchTerm.trim();
	if (!trimmed) {
		return fetchPatients({ page: params.page, size: params.size });
	}

	const query = buildQuery({
		page: params.page,
		size: params.size,
		searchTerm: trimmed,
	});

	const data = await apiRequest<Pagination<PatientListItemDto>>(`/patients/search${query}`);
	if (data?.items) {
		return mapPage(data);
	}

	return {
		items: [],
		totalCount: 0,
		totalPages: 1,
	};
}

export async function fetchPatientById(id: string): Promise<Patient> {
	const data = await apiRequest<PatientDto>(`/patients/${id}`);
	if (data) {
		return mapPatient(data);
	}
	throw new Error("Không tìm thấy thông tin bệnh nhân.");
}

export async function createPatient(payload: PatientPayload): Promise<string> {
	const result = await apiRequest<{ id: string }>("/patients", {
		method: "POST",
		body: payload,
	});
	if (!result?.id) {
		throw new Error("Không nhận được mã ID bệnh nhân từ máy chủ.");
	}
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

// ---- Next Of Kin APIs (Tasks 72, 80, 74) ----

export async function addNextOfKin(
	patientId: string,
	payload: NextOfKinPayload
): Promise<string> {
	const res = await apiRequest<{ id: string }>(`/patients/${patientId}/next-of-kin`, {
		method: "POST",
		body: payload,
	});
	return res?.id ?? "";
}

export async function updateNextOfKin(
	nextOfKinId: string,
	payload: NextOfKinPayload
): Promise<void> {
	await apiRequest(`/patients/next-of-kin/${nextOfKinId}`, {
		method: "PUT",
		body: payload,
	});
}

export async function deleteNextOfKin(nextOfKinId: string): Promise<void> {
	await apiRequest(`/patients/next-of-kin/${nextOfKinId}`, {
		method: "DELETE",
	});
}

// ---- Treatment Plans APIs (Tasks 82, 83, 84) ----

export async function fetchTreatmentPlanById(
	planId: string
): Promise<TreatmentPlanDetailDto> {
	const data = await apiRequest<TreatmentPlanDetailDto>(`/treatment-plans/${planId}`);
	if (data) {
		return data;
	}
	throw new Error("Không tìm thấy thông tin phác đồ điều trị.");
}

export async function closeTreatmentPlan(
	planId: string,
	reason: string
): Promise<void> {
	await apiRequest(`/treatment-plans/${planId}/close`, {
		method: "PUT",
		body: { reason },
	});
}

export async function reviewTreatmentPlan(
	planId: string,
	adherenceState: AdherenceState
): Promise<void> {
	await apiRequest(`/treatment-plans/${planId}/review`, {
		method: "PUT",
		body: { adherenceState },
	});
}

