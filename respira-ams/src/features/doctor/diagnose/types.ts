export type ClinicalValueType = "Numeric" | "Boolean" | "Categorical";

export type ClinicalVariableCategory =
	| "PersonalInformation"
	| "Paraclinical"
	| "Clinical";

export interface ValueRange {
	min: number | null;
	isMinExclusive: boolean;
	max: number | null;
	isMaxExclusive: boolean;
	unit: string | null;
}

export interface RawValueRange {
	min?: number | string | null;
	Min?: number | string | null;
	max?: number | string | null;
	Max?: number | string | null;
	isMinExclusive?: boolean;
	IsMinExclusive?: boolean;
	isMaxExclusive?: boolean;
	IsMaxExclusive?: boolean;
	unit?: string | null;
	Unit?: string | null;
}

export interface ClinicalVariable {
	id: string;
	Id?: string;
	name: string;
	Name?: string;
	description?: string;
	Description?: string;
	code: string;
	Code?: string;
	valueType: ClinicalValueType;
	ValueType?: ClinicalValueType;
	canonicalUnit?: string | null;
	CanonicalUnit?: string | null;
	isRequired: boolean;
	IsRequired?: boolean;
	category: ClinicalVariableCategory | number | string;
	Category?: ClinicalVariableCategory | number | string;
	acceptedValues?: string[] | null;
	AcceptedValues?: string[] | null;
	normalRange?: RawValueRange | ValueRange | null;
	NormalRange?: RawValueRange | ValueRange | null;
	acceptedRange?: RawValueRange | ValueRange | null;
	AcceptedRange?: RawValueRange | ValueRange | null;
}

export interface DiagnosisFormResponse {
	variables?: ClinicalVariable[];
	Variables?: ClinicalVariable[];
	clinicalVariables?: ClinicalVariable[];
	ClinicalVariables?: ClinicalVariable[];
	antibiotics?: AntibioticItem[];
	Antibiotics?: AntibioticItem[];
	pathogens?: PathogenResult[];
	Pathogens?: PathogenResult[];
}

export interface AntibioticItem {
	id: string;
	Id?: string;
	name: string;
	Name?: string;
}

export type AllergyType = "Yes" | "No" | "NonRegisteredAntibiotic" | "Unknown";

export interface AllergyQuery {
	type: AllergyType;
	allergicAntibioticIds?: string[];
	otherAllergy?: string | null;
}

export interface Observation {
	variableId: string;
	value: string;
}

export interface DiagnoseRequest {
	observations: Observation[];
	allergies?: string[];
	allergy?: AllergyQuery;
	specialMedicalHistory?: string[];
	otherInfections?: string[];
	microbialSamples?: unknown[];
}

export interface WarnAntibioticCombinationRequest {
	antibioticIds: string[];
}

export interface WarnAntibioticCombinationResult {
	needWarning: boolean;
}

export interface ConfirmTreatmentRequest {
	patientId: string;
	diagnosis: unknown;
	medicines: string[];
	reasonForMedicineChoice?: string | null;
}

export interface PathogenResult {
	id: string;
	Id?: string;
	name: string;
	Name?: string;
}

export interface MetricsSeverityDiagnosis {
	code: string;
	Code?: string;
	severity: string;
	Severity?: string;
	treatmentSite: string;
	TreatmentSite?: string;
	score?: number | null;
	Score?: number | null;
	majorMatched?: number | null;
	MajorMatched?: number | null;
	minorMatched?: number | null;
	MinorMatched?: number | null;
}

export interface RelatedObservation {
	variable?: {
		id?: string;
		code?: string;
		name?: string;
		valueType?: string;
	};
	Variable?: {
		id?: string;
		code?: string;
		name?: string;
		valueType?: string;
	};
	numericValue?: number | null;
	NumericValue?: number | null;
	booleanValue?: boolean | null;
	BooleanValue?: boolean | null;
	categoricalValue?: string | null;
	CategoricalValue?: string | null;
}

export interface Evidence {
	source?: string;
	Source?: string;
	formula?: string;
	Formula?: string;
	relatedObservations?: RelatedObservation[];
	RelatedObservations?: RelatedObservation[];
	missingVariables?: { id?: string; code?: string; name?: string; valueType?: string }[];
	MissingVariables?: { id?: string; code?: string; name?: string; valueType?: string }[];
	evaluatedValue?: unknown;
	EvaluatedValue?: unknown;
	score?: number | null;
	Score?: number | null;
	isMajor?: boolean | null;
	IsMajor?: boolean | null;
}

export interface DiagnoseResponse {
	severity: string;
	Severity?: string;
	treatmentSite: string;
	TreatmentSite?: string;
	metricsSeverityDiagnosis: MetricsSeverityDiagnosis[];
	MetricsSeverityDiagnosis?: MetricsSeverityDiagnosis[];
	worthSuspected: PathogenResult[];
	WorthSuspected?: PathogenResult[];
	heavySuspected: PathogenResult[];
	HeavySuspected?: PathogenResult[];
	evidences: (Evidence | string)[];
	Evidences?: (Evidence | string)[];
	missingVariables: { id?: string; name?: string; code?: string; Code?: string; Name?: string }[];
	MissingVariables?: { id?: string; name?: string; code?: string; Code?: string; Name?: string }[];
	allergies?: AntibioticItem[];
	Allergies?: AntibioticItem[];
	allergy?: {
		type?: string;
		Type?: string;
		allergicAntibiotics?: AntibioticItem[];
		AllergicAntibiotics?: AntibioticItem[];
		otherAllergy?: string | null;
		OtherAllergy?: string | null;
	};
	isPatientPregnantOrInLactationPhase?: boolean;
	IsPatientPregnantOrInLactationPhase?: boolean;
}
