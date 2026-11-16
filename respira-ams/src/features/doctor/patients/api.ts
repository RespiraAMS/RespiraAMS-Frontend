import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import {
    type PaginatedPatients,
    type PatientDetail,
    type PatientFilters,
    type CreatePatientRequest,
    type UpdatePatientRequest,
    type TreatmentOutcome,
    NextOfKinRequest,
    TreatmentPlanDetail,
    ReviewTreatmentPlanRequest,
    CloseTreatmentPlanRequest,
} from "./types";

const PATIENT_ENDPOINT = `${API_BASE_SERVER}${API_BASE}/patients`;
const TREATMENT_PLAN_ENDPOINT = `${API_BASE_SERVER}${API_BASE}/treatment-plans`;

export async function getPatientsList(
    page: number,
    pageSize: number,
    searchTerm?: string,
    filters?: PatientFilters
): Promise<PaginatedPatients> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (filters?.gender) {
        params.append("Gender", filters.gender);
    }
    if (filters?.minAge !== undefined && filters.minAge !== "") {
        params.append("MinAge", filters.minAge.toString());
    }
    if (filters?.maxAge !== undefined && filters.maxAge !== "") {
        params.append("MaxAge", filters.maxAge.toString());
    }

    let endpoint = PATIENT_ENDPOINT;
    if (searchTerm && searchTerm.trim() !== "") {
        endpoint = `${PATIENT_ENDPOINT}/search`;
        params.append("SearchTerm", searchTerm.trim());
    }

    const result = await apiFetch<PaginatedPatients>(`${endpoint}?${params.toString()}`);
    if (!result) throw new Error("Failed to fetch patients list");
    return result;
}

export async function getPatientDetail(id: string): Promise<PatientDetail> {
    const result = await apiFetch<PatientDetail>(`${PATIENT_ENDPOINT}/${id}`);
    if (!result) throw new Error("Failed to fetch patient detail");
    return result;
}

export async function createPatient(data: CreatePatientRequest): Promise<unknown> {
    return await apiFetch<unknown>(PATIENT_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updatePatient(id: string, data: UpdatePatientRequest): Promise<void> {
    await apiFetch(`${PATIENT_ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deletePatient(id: string): Promise<void> {
    await apiFetch(`${PATIENT_ENDPOINT}/${id}`, {
        method: "DELETE",
    });
}

export async function dischargePatient(id: string, outcome: TreatmentOutcome): Promise<void> {
    const params = new URLSearchParams({ outcome });
    await apiFetch(`${PATIENT_ENDPOINT}/${id}/discharge?${params.toString()}`, {
        method: "PUT",
    });
}

export async function addNextOfKin(patientId: string, data: NextOfKinRequest): Promise<unknown> {
    return await apiFetch<unknown>(`${PATIENT_ENDPOINT}/${patientId}/next-of-kin`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateNextOfKin(nextOfKinId: string, data: NextOfKinRequest): Promise<void> {
    await apiFetch(`${PATIENT_ENDPOINT}/next-of-kin/${nextOfKinId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteNextOfKin(nextOfKinId: string): Promise<void> {
    await apiFetch(`${PATIENT_ENDPOINT}/next-of-kin/${nextOfKinId}`, {
        method: "DELETE",
    });
}

export async function getTreatmentPlanDetail(id: string): Promise<TreatmentPlanDetail> {
    const result = await apiFetch<TreatmentPlanDetail>(`${TREATMENT_PLAN_ENDPOINT}/${id}`);
    if (!result) throw new Error("Failed to fetch treatment plan detail");
    return result;
}

export async function closeTreatmentPlan(id: string, data: CloseTreatmentPlanRequest): Promise<void> {
    await apiFetch(`${TREATMENT_PLAN_ENDPOINT}/${id}/close`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function reviewTreatmentPlan(id: string, data: ReviewTreatmentPlanRequest): Promise<void> {
    await apiFetch(`${TREATMENT_PLAN_ENDPOINT}/${id}/review`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}