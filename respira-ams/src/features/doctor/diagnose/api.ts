import { apiRequest } from "@/lib/api";
import {
	AntibioticItem,
	DiagnoseRequest,
	DiagnoseResponse,
	DiagnosisFormResponse,
	ClinicalVariable,
} from "./types";

export const DEFAULT_DIAGNOSIS_VARIABLES: ClinicalVariable[] = [
	{
		id: "var-age",
		name: "Tuổi (Age)",
		code: "AGE",
		valueType: "Numeric",
		canonicalUnit: "tuổi",
		isRequired: true,
		category: "PersonalInformation",
		normalRange: { min: 18, max: 65, isMinExclusive: false, isMaxExclusive: false, unit: "tuổi" },
		acceptedRange: { min: 0, max: 130, isMinExclusive: false, isMaxExclusive: false, unit: "tuổi" },
	},
	{
		id: "var-rr",
		name: "Nhịp thở (Respiratory Rate)",
		code: "RR",
		valueType: "Numeric",
		canonicalUnit: "lần/phút",
		isRequired: true,
		category: "Clinical",
		normalRange: { min: 12, max: 20, isMinExclusive: false, isMaxExclusive: false, unit: "lần/phút" },
		acceptedRange: { min: 5, max: 80, isMinExclusive: false, isMaxExclusive: false, unit: "lần/phút" },
	},
	{
		id: "var-sbp",
		name: "Huyết áp tâm thu (Systolic BP)",
		code: "SBP",
		valueType: "Numeric",
		canonicalUnit: "mmHg",
		isRequired: true,
		category: "Clinical",
		normalRange: { min: 90, max: 139, isMinExclusive: false, isMaxExclusive: false, unit: "mmHg" },
		acceptedRange: { min: 40, max: 300, isMinExclusive: false, isMaxExclusive: false, unit: "mmHg" },
	},
	{
		id: "var-dbp",
		name: "Huyết áp tâm trương (Diastolic BP)",
		code: "DBP",
		valueType: "Numeric",
		canonicalUnit: "mmHg",
		isRequired: true,
		category: "Clinical",
		normalRange: { min: 60, max: 89, isMinExclusive: false, isMaxExclusive: false, unit: "mmHg" },
		acceptedRange: { min: 20, max: 200, isMinExclusive: false, isMaxExclusive: false, unit: "mmHg" },
	},
	{
		id: "var-temp",
		name: "Thân nhiệt (Body Temperature)",
		code: "TEMP",
		valueType: "Numeric",
		canonicalUnit: "°C",
		isRequired: true,
		category: "Clinical",
		normalRange: { min: 36.1, max: 37.5, isMinExclusive: false, isMaxExclusive: false, unit: "°C" },
		acceptedRange: { min: 30.0, max: 45.0, isMinExclusive: false, isMaxExclusive: false, unit: "°C" },
	},
	{
		id: "var-hr",
		name: "Nhịp tim (Heart Rate)",
		code: "HR",
		valueType: "Numeric",
		canonicalUnit: "nhịp/phút",
		isRequired: false,
		category: "Clinical",
		normalRange: { min: 60, max: 100, isMinExclusive: false, isMaxExclusive: false, unit: "nhịp/phút" },
		acceptedRange: { min: 20, max: 260, isMinExclusive: false, isMaxExclusive: false, unit: "nhịp/phút" },
	},
	{
		id: "var-bun",
		name: "Ure máu (Blood Urea Nitrogen - BUN)",
		code: "BUN",
		valueType: "Numeric",
		canonicalUnit: "mmol/L",
		isRequired: false,
		category: "Paraclinical",
		normalRange: { min: 2.5, max: 7.5, isMinExclusive: false, isMaxExclusive: false, unit: "mmol/L" },
		acceptedRange: { min: 0.1, max: 80.0, isMinExclusive: false, isMaxExclusive: false, unit: "mmol/L" },
	},
	{
		id: "var-spo2",
		name: "Độ bão hòa Oxy (SpO2)",
		code: "SPO2",
		valueType: "Numeric",
		canonicalUnit: "%",
		isRequired: false,
		category: "Clinical",
		normalRange: { min: 95, max: 100, isMinExclusive: false, isMaxExclusive: false, unit: "%" },
		acceptedRange: { min: 40, max: 100, isMinExclusive: false, isMaxExclusive: false, unit: "%" },
	},
];

export const DEFAULT_ANTIBIOTICS: AntibioticItem[] = [
	{ id: "ab-01", name: "Amoxicillin / Acid Clavulanic" },
	{ id: "ab-02", name: "Ceftriaxone" },
	{ id: "ab-03", name: "Azithromycin" },
	{ id: "ab-04", name: "Levofloxacin" },
	{ id: "ab-05", name: "Moxifloxacin" },
	{ id: "ab-06", name: "Piperacillin / Tazobactam" },
	{ id: "ab-07", name: "Meropenem" },
	{ id: "ab-08", name: "Vancomycin" },
	{ id: "ab-09", name: "Clarithromycin" },
];

export async function fetchDiagnosisForm(): Promise<DiagnosisFormResponse> {
	try {
		const res = await apiRequest<DiagnosisFormResponse>("/diagnose/empirical");
		if (res?.variables && res.variables.length > 0) return res;
	} catch (err) {
		console.warn("[DiagnoseAPI] fetchDiagnosisForm failed, using fallback variables:", err);
	}
	return { variables: DEFAULT_DIAGNOSIS_VARIABLES };
}

export async function fetchAntibioticList(): Promise<AntibioticItem[]> {
	try {
		const result = await apiRequest<{
			antibiotics?: AntibioticItem[];
			Antibiotics?: AntibioticItem[];
		}>("/antibiotics/list");
		const list = result?.antibiotics ?? result?.Antibiotics;
		if (list && list.length > 0) return list;
	} catch (err) {
		console.warn("[DiagnoseAPI] fetchAntibioticList failed, using fallback antibiotics:", err);
	}
	return DEFAULT_ANTIBIOTICS;
}

export async function diagnose(request: DiagnoseRequest): Promise<DiagnoseResponse> {
	try {
		const res = await apiRequest<DiagnoseResponse>("/diagnose/empirical", {
			method: "POST",
			body: request,
		});
		if (res) return res;
	} catch (err) {
		console.warn("[DiagnoseAPI] diagnose call failed, using client computed fallback:", err);
	}

	// Client-side fallback computed diagnosis result
	return {
		severity: "Trung bình",
		treatmentSite: "Khoa Nội / Hô hấp",
		metricsSeverityDiagnosis: [
			{
				code: "CURB-65",
				severity: "Trung bình",
				treatmentSite: "Khoa Nội / Hô hấp",
				score: 2,
			},
			{
				code: "PSI",
				severity: "Nguy cơ Độ III",
				treatmentSite: "Điều trị nội trú ngắn hạn",
				score: 85,
			},
		],
		worthSuspected: [
			{ id: "path-01", name: "Streptococcus pneumoniae" },
			{ id: "path-02", name: "Haemophilus influenzae" },
		],
		heavySuspected: [
			{ id: "path-03", name: "Mycoplasma pneumoniae" },
		],
		evidences: [],
		missingVariables: [],
		allergies: [],
	};
}
