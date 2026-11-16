import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import type {
    ConfirmTreatmentRequest,
    DiagnoseFormResponse,
    DiagnosisResultDto,
    PatientDetailWithPlans,
    SubmitDiagnosisRequest,
    TreatmentPlanDetailResponse,
    WarnCombinationResponse,
} from "./types";

const TREATMENT_PLAN_TOLERATED_ERROR = "failed to create patient's treatment plan";

export async function getFormMetadata(): Promise<DiagnoseFormResponse> {
    const result = await apiFetch<DiagnoseFormResponse>(
        `${API_BASE_SERVER}${API_BASE}/diagnose`,
        {
            method: "GET",
            cache: "no-store",
        }
    );
    if (!result) throw new Error("Failed to fetch diagnose form metadata");
    return result;
}

export async function getPatientDetail(patientId: string): Promise<PatientDetailWithPlans> {
    const result = await apiFetch<PatientDetailWithPlans>(
        `${API_BASE_SERVER}${API_BASE}/patients/${patientId}`,
        {
            method: "GET",
            cache: "no-store",
        }
    );
    if (!result) throw new Error("Failed to fetch patient detail");
    return result;
}

export async function getTreatmentPlanDetail(
    treatmentPlanId: string
): Promise<TreatmentPlanDetailResponse> {
    const result = await apiFetch<TreatmentPlanDetailResponse>(
        `${API_BASE_SERVER}${API_BASE}/treatment-plans/${treatmentPlanId}`,
        {
            method: "GET",
            cache: "no-store",
        }
    );
    if (!result) throw new Error("Failed to fetch treatment plan detail");
    return result;
}

export async function submitDiagnosis(
    payload: SubmitDiagnosisRequest
): Promise<DiagnosisResultDto> {
    const result = await apiFetch<DiagnosisResultDto>(
        `${API_BASE_SERVER}${API_BASE}/diagnose`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
    if (!result) throw new Error("Failed to submit diagnosis");
    return result;
}

export async function warnAntibioticCombination(
    antibioticIds: string[]
): Promise<WarnCombinationResponse> {
    const result = await apiFetch<WarnCombinationResponse>(
        `${API_BASE_SERVER}${API_BASE}/diagnose/warn-antibiotic-combination`,
        {
            method: "POST",
            body: JSON.stringify({ antibioticIds }),
        }
    );
    if (!result) throw new Error("Failed to warn antibiotic combination");
    return result;
}

export async function confirmTreatment(payload: ConfirmTreatmentRequest): Promise<void> {
    try {
        await apiFetch(`${API_BASE_SERVER}${API_BASE}/diagnose/confirm-treatment`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : "";
        if (msg.includes(TREATMENT_PLAN_TOLERATED_ERROR)) {
            return;
        }
        throw error;
    }
}

export const diagnoseApi = {
    getFormMetadata,
    getPatientDetail,
    getTreatmentPlanDetail,
    submitDiagnosis,
    warnAntibioticCombination,
    confirmTreatment,
};