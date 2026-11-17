import type { PatientDetail } from "@/features/doctor/patients/types";

export type { PatientDetail };

export type VariableValueType = "Numeric" | "Boolean" | "Categorical";
export type VariableCategory =
	| "PersonalInformation"
	| "MedicalHistory"
	| "Paraclinical"
	| "Clinical"
	| "Other";
export type AllergyType = "No" | "Yes" | "NonRegisteredAntibiotic" | "Unknown";
export type MicCategory = "Susceptible" | "Intermediate" | "Resistant";
export type AwareClassification =
	| "Access"
	| "AccessWatch"
	| "Watch"
	| "Reserve"
	| "Others"
	| "Unclassified";
export type SeverityLevel = "Mild" | "Moderate" | "Severe";
export type TreatmentSite = "Outpatient" | "Inpatient" | "IntensiveCareUnit";

export interface ApiResponse<T> {
	statusCode: "SUCCESS" | "ERROR" | string;
	data: T;
	error?: {
		code?: string;
		description?: string;
		/**
		 * Observation validation errors keyed by clinical variable id.
		 * The backend returns a `Dictionary<Guid, string>` here.
		 */
		detail?: ObservationErrorDetails | null;
	} | null;
}

/** Validation messages returned by the diagnose endpoint, keyed by variable id. */
export type ObservationErrorDetails = Record<string, string>;

export interface SubmitErrorInfo {
	message: string;
	details: ObservationErrorDetails;
}

export interface RangeDto {
	min?: number | null;
	max?: number | null;
	isMinExclusive?: boolean;
	isMaxExclusive?: boolean;
	unit?: string | null;
}

export interface NormalizedRange {
	min: number | null;
	max: number | null;
	isMinExclusive: boolean;
	isMaxExclusive: boolean;
	unit: string | null;
}

export interface ClinicalVariableDto {
	id: string;
	name: string;
	description?: string;
	code: string;
	valueType: VariableValueType;
	canonicalUnit?: string | null;
	isRequired: boolean;
	category: VariableCategory;
	normalRange?: RangeDto | null;
	acceptedRange?: RangeDto | null;
	acceptedValues?: string[];
}

export interface DiagnoseAntibioticDto {
	id: string;
	name: string;
	antibioticGroupId: string;
	antibioticGroupName: string;
	classification: AwareClassification;
}

export interface DiagnosePathogenDto {
	id: string;
	name: string;
}

export interface DiagnoseFormResponse {
	clinicalVariables: ClinicalVariableDto[];
	antibiotics: DiagnoseAntibioticDto[];
	pathogens: DiagnosePathogenDto[];
}

export interface ObservationInput {
	variableId: string;
	value: string;
}

export interface AllergyInput {
	type: AllergyType;
	allergicAntibioticIds: string[];
	otherAllergy: string | null;
}

export interface MicrobialSampleInput {
	sampleType: number;
	micCategory: MicCategory;
	pathogenId: string;
}

export interface SubmitDiagnosisRequest {
	observations: ObservationInput[];
	allergy: AllergyInput;
	specialMedicalHistory: string[];
	otherInfections: string[];
	microbialSamples: MicrobialSampleInput[];
}

export interface RelatedObservationDto {
	variable: {
		id: string;
		code: string;
		valueType: VariableValueType;
	};
	value: string | number | boolean;
}

export interface MissingVariableRefDto {
	id: string;
	name?: string;
	code: string;
	valueType?: VariableValueType;
}

export interface EvidenceDto {
	source: string;
	formula: string;
	relatedObservations: RelatedObservationDto[];
	missingVariables: MissingVariableRefDto[];
	evaluatedValue?: boolean;
	score?: number;
}

export interface MetricSeverityDiagnosisDto {
	code: string;
	severity: SeverityLevel;
	treatmentSite: TreatmentSite;
	evidences: EvidenceDto[];
}

export interface ProtocolMedicineDto {
	id: string;
	name: string;
	classification: AwareClassification;
	antibioticGroupName?: string;
}

export interface TreatmentProtocolDto {
	id: string;
	name?: string;
	severity: SeverityLevel;
	treatmentSite: TreatmentSite;
	medicines: ProtocolMedicineDto[][];
	pathogens: DiagnosePathogenDto[];
	criteria: Array<{ id?: string; name?: string; formula?: string }>;
}

export interface MicrobialTestResultDto {
	sampleType?: number | string;
	micCategory: MicCategory;
	pathogen: DiagnosePathogenDto;
	susceptibleAntibiotics?: ProtocolMedicineDto[];
}

export interface DiagnosisResultDto {
	diagnosisId: string;
	severity: SeverityLevel;
	treatmentSite: TreatmentSite;
	egfr?: number | null;
	metricsSeverityDiagnosis: MetricSeverityDiagnosisDto[];
	worthSuspected: DiagnosePathogenDto[];
	heavySuspected: DiagnosePathogenDto[];
	evidences: EvidenceDto[];
	missingVariables: MissingVariableRefDto[];
	isPatientPregnantOrInLactationPhase: boolean;
	otherInfections: string[];
	microbialTestResults: MicrobialTestResultDto[];
	allergy: {
		type: AllergyType;
		allergicAntibiotics: ProtocolMedicineDto[];
		otherAllergy?: string | null;
	};
	protocols: TreatmentProtocolDto[];
}

export interface WarnCombinationResponse {
	needWarning: boolean;
}

export interface ConfirmTreatmentRequest {
	patientId: string;
	diagnosis: DiagnosisResultDto;
	medicines: string[];
	reasonForMedicineChoice: string | null;
}

export interface PatientTreatmentPlanSummary {
	id: string;
	adherenceState: string;
	treatmentPlanStatus: number;
	updatedAt: string;
}

export interface PatientDetailWithPlans extends Omit<PatientDetail, "treatmentPlans"> {
	treatmentPlans?: PatientTreatmentPlanSummary[];
}

export interface TreatmentPlanDetailResponse {
	id: string;
	patient: {
		id: string;
		name: string;
	};
	doctorId: string;
	diagnosis: string;
	medicines: ProtocolMedicineDto[];
	reasonForMedicineChoice?: string | null;
	adherenceState: string;
	status: number;
	closeReason?: string | null;
}

export const CATEGORY_ORDER: VariableCategory[] = [
	"PersonalInformation",
	"MedicalHistory",
	"Paraclinical",
	"Clinical",
];

export const CATEGORY_LABELS: Record<VariableCategory, string> = {
	PersonalInformation: "Thông tin bệnh nhân",
	MedicalHistory: "Tiền sử bệnh lý & dùng thuốc",
	Paraclinical: "Cận lâm sàng",
	Clinical: "Lâm sàng",
	Other: "Chỉ số khác",
};

export const ALLERGY_TYPE_OPTIONS: Array<{ value: AllergyType; label: string }> = [
	{ value: "No", label: "Không dị ứng" },
	{ value: "Yes", label: "Có dị ứng kháng sinh" },
	{ value: "NonRegisteredAntibiotic", label: "Kháng sinh ngoài danh mục" },
	{ value: "Unknown", label: "Không rõ" },
];

export const MIC_CATEGORIES: Array<{ value: MicCategory; label: string }> = [
	{ value: "Susceptible", label: "Nhạy cảm (Susceptible)" },
	{ value: "Intermediate", label: "Trung gian (Intermediate)" },
	{ value: "Resistant", label: "Đề kháng (Resistant)" },
];

export const AWARE_LABELS: Record<AwareClassification, string> = {
	Access: "Access",
	AccessWatch: "Access-Watch",
	Watch: "Watch",
	Reserve: "Reserve",
	Others: "Others",
	Unclassified: "Unclassified",
};

export const SAMPLE_TYPES = [
	{ value: 0, name: "Sputum", label: "Đàm (Sputum)" },
	{ value: 1, name: "BronchoalveolarLavageFluid", label: "Dịch rửa phế quản phế nang (BAL)" },
	{ value: 2, name: "PleuralFluid", label: "Dịch màng phổi" },
	{ value: 3, name: "Urine", label: "Nước tiểu" },
	{ value: 4, name: "Blood", label: "Máu" },
	{ value: 5, name: "AbdominalFluid", label: "Dịch ổ bụng" },
	{ value: 6, name: "CerebrospinalFluid", label: "Dịch não tủy" },
	{ value: 7, name: "WoundExudate", label: "Dịch vết thương / mủ" },
	{ value: 8, name: "Other", label: "Mẫu bệnh phẩm khác" },
] as const;

export const INFECTION_TYPES = [
    { name: "SkinAndSoftTissueInfection", label: "Nhiễm khuẩn da/mô dưới da" },
    { name: "SepticArthritis", label: "Viêm khớp nhiễm khuẩn" },
    { name: "Osteomyelitis", label: "Viêm tủy xương nhiễm khuẩn" },
    { name: "BacterialMyositisOrMuscleAbscess", label: "Viêm cơ/áp xe cơ nhiễm khuẩn" },
    { name: "InfectedGoutyTophus", label: "Nhiễm khuẩn hạt tophi" },
    { name: "PyelonephritisOrRenalAbscess", label: "Viêm/áp xe thận - bể thận" },
    { name: "AcuteCystitis", label: "Viêm bàng quang cấp" },
    { name: "AcuteNonGonococcalUrethritis", label: "Viêm niệu đạo cấp không do lậu" },
    { name: "BacterialVaginourethritis", label: "Viêm âm đạo niệu đạo do vi khuẩn" },
    { name: "BacterialEndometritis", label: "Viêm tử cung do vi khuẩn" },
    { name: "PurulentMeningitis", label: "Viêm màng não mủ" },
    { name: "BacterialEncephalitis", label: "Viêm não do vi khuẩn" },
    { name: "PleuralEmpyema", label: "Tràn mủ màng phổi" },
    { name: "MediastinalAbscess", label: "Áp xe trung thất" },
    { name: "InfectiveEndocarditis", label: "Viêm nội tâm mạc nhiễm khuẩn" },
    { name: "BacterialMyocarditis", label: "Viêm cơ tim do vi khuẩn" },
    { name: "BacterialPericarditis", label: "Viêm màng ngoài tim do vi khuẩn" },
    { name: "PulmonaryTuberculosis", label: "Lao phổi" },
    { name: "ExtrapulmonaryTuberculosis", label: "Lao ngoài phổi" },
    { name: "BiliaryTractInfection", label: "Nhiễm trùng đường mật" },
    { name: "BacterialLiverAbscess", label: "Áp xe gan do vi khuẩn" },
    { name: "InfectedAcutePancreatitis", label: "Viêm tụy cấp nhiễm khuẩn" },
    { name: "BacterialPeritonitis", label: "Viêm phúc mạc nhiễm khuẩn" },
    { name: "BacterialDiarrhea", label: "Tiêu chảy do vi khuẩn" },
    { name: "HelicobacterPyloriInfection", label: "Nhiễm Helicobacter pylori" },
    { name: "Sepsis", label: "Nhiễm trùng huyết" },
    { name: "OrbitalCellulitis", label: "Viêm tổ chức hốc mắt" },
    { name: "Conjunctivitis", label: "Viêm kết mạc mắt" },
    { name: "Keratitis", label: "Viêm giác mạc mắt" },
    { name: "Dacryocystitis", label: "Viêm túi lệ mắt" },
    { name: "MaxillofacialAbscess", label: "Áp xe vùng hàm-mặt" },
    { name: "Other", label: "Nhiễm khuẩn khác" },
] as const;

export type SampleTypeName = (typeof SAMPLE_TYPES)[number]["name"];
export type InfectionTypeName = (typeof INFECTION_TYPES)[number]["name"];