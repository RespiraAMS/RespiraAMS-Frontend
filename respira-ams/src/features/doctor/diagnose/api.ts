import { apiRequest } from "@/lib/api";
import {
	AntibioticItem,
	ConfirmTreatmentRequest,
	DiagnoseRequest,
	DiagnoseResponse,
	DiagnosisFormResponse,
	WarnAntibioticCombinationResult,
} from "./types";

export async function fetchDiagnosisForm(): Promise<DiagnosisFormResponse> {
	const res = await apiRequest<any>("/diagnose");
	const vars =
		res?.clinicalVariables ??
		res?.ClinicalVariables ??
		res?.variables ??
		res?.Variables ??
		[];
	const antibiotics = res?.antibiotics ?? res?.Antibiotics ?? [];
	const pathogens = res?.pathogens ?? res?.Pathogens ?? [];

	return {
		variables: vars,
		Variables: vars,
		clinicalVariables: vars,
		ClinicalVariables: vars,
		antibiotics,
		Antibiotics: antibiotics,
		pathogens,
		Pathogens: pathogens,
	};
}

export async function diagnose(request: DiagnoseRequest): Promise<DiagnoseResponse> {
	const allergyList = request.allergies || [];
	const allergyPayload = request.allergy ?? {
		type: allergyList.length > 0 ? "Yes" : "No",
		allergicAntibioticIds: allergyList,
		otherAllergy: null,
	};

	const payload = {
		observations: request.observations,
		allergy: allergyPayload,
		specialMedicalHistory: request.specialMedicalHistory ?? [],
		otherInfections: request.otherInfections ?? [],
		microbialSamples: request.microbialSamples ?? [],
	};

	return await apiRequest<DiagnoseResponse>("/diagnose", {
		method: "POST",
		body: payload,
	});
}

export async function warnAntibioticCombination(
	antibioticIds: string[]
): Promise<WarnAntibioticCombinationResult> {
	return apiRequest<WarnAntibioticCombinationResult>(
		"/diagnose/warn-antibiotic-combination",
		{
			method: "POST",
			body: { antibioticIds },
		}
	);
}

export async function confirmTreatment(
	request: ConfirmTreatmentRequest
): Promise<void> {
	await apiRequest<void>("/diagnose/confirm-treatment", {
		method: "POST",
		body: request,
	});
}
