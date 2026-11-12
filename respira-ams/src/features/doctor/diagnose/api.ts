import { apiRequest } from "@/lib/api";
import {
	AntibioticItem,
	DiagnoseRequest,
	DiagnoseResponse,
	DiagnosisFormResponse,
} from "./types";

export function fetchDiagnosisForm(): Promise<DiagnosisFormResponse> {
	return apiRequest<DiagnosisFormResponse>("/diagnose/empirical");
}

export async function fetchAntibioticList(): Promise<AntibioticItem[]> {
	const result = await apiRequest<{
		antibiotics?: AntibioticItem[];
		Antibiotics?: AntibioticItem[];
	}>("/antibiotics/list");
	return result?.antibiotics ?? result?.Antibiotics ?? [];
}

export function diagnose(request: DiagnoseRequest): Promise<DiagnoseResponse> {
	return apiRequest<DiagnoseResponse>("/diagnose/empirical", {
		method: "POST",
		body: request,
	});
}
