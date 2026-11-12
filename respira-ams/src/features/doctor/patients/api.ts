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

// ---- Storage & Fallback for offline resilience ----

const PATIENTS_STORAGE_KEY = "respira_doctor_patients_v1";

export const INITIAL_PATIENTS: Patient[] = [
	{
		id: "pat-001",
		name: "Nguyễn Văn Hùng",
		code: "BA-2026-00088",
		age: 58,
		gender: "Nam",
		status: "treating",
		birthDate: "15/04/1968",
		phone: "0912345671",
		bhyt: "GD4797931852468",
		address: "Số 24 Hoàng Hoa Thám, Ba Đình, Hà Nội",
		city: "Hà Nội",
		height: 168,
		weight: 65,
		admission: new Date(Date.now() - 5 * 86400000).toISOString(),
		treatmentCount: 2,
	},
	{
		id: "pat-002",
		name: "Trần Thị Mai",
		code: "BA-2026-00089",
		age: 46,
		gender: "Nữ",
		status: "recovered",
		birthDate: "20/08/1980",
		phone: "0987654322",
		bhyt: "DN4797931852469",
		address: "Số 112 Lê Lợi, Quận 1, TP.HCM",
		city: "TP.HCM",
		height: 156,
		weight: 52,
		admission: new Date(Date.now() - 10 * 86400000).toISOString(),
		discharge: new Date(Date.now() - 1 * 86400000).toISOString(),
		treatmentCount: 1,
	},
	{
		id: "pat-003",
		name: "Lê Hoàng Phúc",
		code: "BA-2026-00090",
		age: 67,
		gender: "Nam",
		status: "treating",
		birthDate: "03/11/1959",
		phone: "0934567893",
		bhyt: "HT4797931852470",
		address: "Xã An Khánh, Hoài Đức, Hà Nội",
		city: "Hà Nội",
		height: 165,
		weight: 60,
		admission: new Date(Date.now() - 2 * 86400000).toISOString(),
		treatmentCount: 1,
	},
	{
		id: "pat-004",
		name: "Phạm Thu Hà",
		code: "BA-2026-00091",
		age: 39,
		gender: "Nữ",
		status: "treating",
		birthDate: "12/06/1987",
		phone: "0945678904",
		bhyt: "DN4797931852471",
		address: "Phường Thảo Điền, TP. Thủ Đức, TP.HCM",
		city: "TP.HCM",
		height: 160,
		weight: 55,
		admission: new Date(Date.now() - 1 * 86400000).toISOString(),
		treatmentCount: 1,
	},
	{
		id: "pat-005",
		name: "Vũ Đình Trọng",
		code: "BA-2026-00092",
		age: 72,
		gender: "Nam",
		status: "treating",
		birthDate: "28/01/1954",
		phone: "0912345675",
		bhyt: "GD4797931852472",
		address: "Số 88 Giải Phóng, Hai Bà Trưng, Hà Nội",
		city: "Hà Nội",
		height: 170,
		weight: 68,
		admission: new Date(Date.now() - 3 * 86400000).toISOString(),
		treatmentCount: 1,
	},
];

export function getStoredPatients(): Patient[] {
	if (typeof window === "undefined") return INITIAL_PATIENTS;
	try {
		const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
		if (!raw) {
			localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
			return INITIAL_PATIENTS;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PATIENTS;
	} catch {
		return INITIAL_PATIENTS;
	}
}

function saveStoredPatients(items: Patient[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(items));
	} catch (e) {
		console.error("Failed to save patients to localStorage:", e);
	}
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
	try {
		const data = await apiRequest<Pagination<PatientListItemDto>>(
			`/patients${buildQuery({ page: params.page, size: params.size, gender: params.gender })}`
		);
		if (data?.items) {
			return mapPage(data);
		}
	} catch (err) {
		console.warn("[PatientsAPI] Backend unavailable, using cached patients:", err);
	}

	// Fallback to local stored patients
	let all = getStoredPatients();
	if (params.gender) {
		const targetGender: DisplayGender = params.gender === "Male" ? "Nam" : "Nữ";
		all = all.filter((p) => p.gender === targetGender);
	}
	const total = all.length;
	const totalPages = Math.max(1, Math.ceil(total / params.size));
	const start = (params.page - 1) * params.size;
	const items = all.slice(start, start + params.size);

	return {
		items,
		totalCount: total,
		totalPages,
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

	// 1 ký tự: Lọc client ngay lập tức
	if (trimmed.length < 2) {
		const list = await fetchPatients({ page: 1, size: 50 });
		const lower = trimmed.toLowerCase();
		const matched = list.items.filter(
			(p) =>
				p.name?.toLowerCase().includes(lower) ||
				p.code?.toLowerCase().includes(lower) ||
				p.phone?.toLowerCase().includes(lower) ||
				p.bhyt?.toLowerCase().includes(lower)
		);
		return {
			items: matched,
			totalCount: matched.length,
			totalPages: 1,
		};
	}

	try {
		const data = await apiRequest<Pagination<PatientListItemDto>>(
			`/patients/search${buildQuery({ page: params.page, size: params.size, searchTerm: trimmed })}`
		);
		if (data?.items) {
			return mapPage(data);
		}
	} catch (err) {
		console.warn("[PatientsAPI] Search backend failed, searching locally:", err);
	}

	const all = getStoredPatients();
	const lower = trimmed.toLowerCase();
	const matched = all.filter(
		(p) =>
			p.name?.toLowerCase().includes(lower) ||
			p.code?.toLowerCase().includes(lower) ||
			p.phone?.toLowerCase().includes(lower) ||
			p.bhyt?.toLowerCase().includes(lower)
	);
	const start = (params.page - 1) * params.size;
	return {
		items: matched.slice(start, start + params.size),
		totalCount: matched.length,
		totalPages: Math.max(1, Math.ceil(matched.length / params.size)),
	};
}

export async function fetchPatientById(id: string): Promise<Patient> {
	try {
		const data = await apiRequest<PatientDto>(`/patients/${id}`);
		if (data) {
			return mapPatient(data);
		}
	} catch (err) {
		console.warn("[PatientsAPI] Get by ID failed, searching locally:", err);
	}

	const local = getStoredPatients().find((p) => p.id === id);
	if (local) return local;

	throw new Error("Không tìm thấy thông tin bệnh nhân.");
}

export async function createPatient(payload: PatientPayload): Promise<string> {
	try {
		const result = await apiRequest<{ id: string }>("/patients", {
			method: "POST",
			body: payload,
		});
		if (result?.id) return result.id;
	} catch (err) {
		console.warn("[PatientsAPI] Backend create failed, saving to local cache:", err);
	}

	const newId = `pat-${Date.now()}`;
	const current = getStoredPatients();
	const newPatient: Patient = {
		id: newId,
		name: `${payload.lastName} ${payload.firstName}`.trim(),
		code: payload.medicalRecordCode,
		age: new Date().getFullYear() - Number(payload.dateOfBirth.slice(0, 4)),
		gender: payload.gender === "Male" ? "Nam" : "Nữ",
		status: "treating",
		birthDate: isoDateToDisplay(payload.dateOfBirth),
		phone: payload.phoneNumber,
		bhyt: payload.healthInsuranceCard,
		address: payload.address,
		city: payload.city,
		height: payload.height,
		weight: payload.weight,
		admission: new Date().toISOString(),
		treatmentCount: 1,
	};
	saveStoredPatients([newPatient, ...current]);
	return newId;
}

export async function updatePatient(
	id: string,
	payload: PatientPayload
): Promise<void> {
	try {
		await apiRequest(`/patients/${id}`, { method: "PUT", body: payload });
		return;
	} catch (err) {
		console.warn("[PatientsAPI] Backend update failed, updating local cache:", err);
	}

	const current = getStoredPatients();
	const updated = current.map((p) => {
		if (p.id === id) {
			return {
				...p,
				name: `${payload.lastName} ${payload.firstName}`.trim(),
				code: payload.medicalRecordCode,
				age: new Date().getFullYear() - Number(payload.dateOfBirth.slice(0, 4)),
				gender: (payload.gender === "Male" ? "Nam" : "Nữ") as DisplayGender,
				birthDate: isoDateToDisplay(payload.dateOfBirth),
				phone: payload.phoneNumber,
				bhyt: payload.healthInsuranceCard,
				address: payload.address,
				city: payload.city,
				height: payload.height,
				weight: payload.weight,
			};
		}
		return p;
	});
	saveStoredPatients(updated);
}

export async function dischargePatient(
	id: string,
	outcome: TreatmentOutcome
): Promise<void> {
	try {
		await apiRequest(`/patients/${id}/discharge${buildQuery({ outcome })}`, {
			method: "PUT",
		});
		return;
	} catch (err) {
		console.warn("[PatientsAPI] Backend discharge failed, updating local cache:", err);
	}

	const current = getStoredPatients();
	const updated = current.map((p) => {
		if (p.id === id) {
			return {
				...p,
				status: OUTCOME_TO_STATUS[outcome] ?? "recovered",
				discharge: new Date().toISOString(),
			};
		}
		return p;
	});
	saveStoredPatients(updated);
}

export async function deletePatient(id: string): Promise<void> {
	try {
		await apiRequest(`/patients/${id}`, { method: "DELETE" });
		return;
	} catch (err) {
		console.warn("[PatientsAPI] Backend delete failed, updating local cache:", err);
	}

	const current = getStoredPatients();
	saveStoredPatients(current.filter((p) => p.id !== id));
}
