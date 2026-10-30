export type ClinicalValueType = "Numeric" | "Boolean" | "Categorical";

export type ClinicalVariableCategory =
	| "PersonalInformation"
	| "Paraclinical"
	| "Clinical";

export interface ValueRange {
	min: number;
	isMinExclusive: boolean;
	max: number;
	isMaxExclusive: boolean;
	unit: string | null;
}

export interface ClinicalVariable {
	id: string;
	name: string;
	description: string;
	code: string;
	valueType: ClinicalValueType;
	canonicalUnit?: string | null;
	isRequired: boolean;
	category: ClinicalVariableCategory;
	acceptedValues?: string[] | null;
	normalRange?: ValueRange | null;
	acceptedRange?: ValueRange | null;
}

export interface DiagnosisFormResponse {
	variables: ClinicalVariable[];
}

export interface AntibioticItem {
	id: string;
	name: string;
}

export interface Observation {
	variableId: string;
	value: string;
}

export interface DiagnoseRequest {
	observations: Observation[];
	allergies: string[];
}

export interface PathogenResult {
	id: string;
	name: string;
}

export interface MetricsSeverityDiagnosis {
	code: string;
	severity: string;
	treatmentSite: string;
	score?: number | null;
	majorMatched?: number | null;
	minorMatched?: number | null;
}

export interface Evidence {
	source: string;
	formula: string;
	relatedObservations: unknown[];
	missingVariables: { id: string; code: string; valueType: string }[];
	evaluatedValue?: unknown;
	score?: number | null;
	isMajor?: boolean | null;
}

export interface DiagnoseResponse {
	severity: string;
	treatmentSite: string;
	metricsSeverityDiagnosis: MetricsSeverityDiagnosis[];
	worthSuspected: PathogenResult[];
	heavySuspected: PathogenResult[];
	evidences: Evidence[];
	missingVariables: { id: string; name: string; code: string }[];
	allergies: AntibioticItem[];
	isPatientPregnantOrInLactationPhase: boolean;
}
