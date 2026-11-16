export type Gender = "Male" | "Female";

export type TreatmentOutcome = "InTreatment" | "Recovered" | "Death" | "OutOfScope";

export type AdherenceState = "Adhere" | "NotAdhere" | "NotAdhereValid" | "NotAdhereInvalid";

export type TreatmentPlanStatus = 0 | 1;

export interface PatientItem {
    id: string;
    fullName: string;
    dateOfBirth: string;
    age: number;
    gender: Gender;
    medicalRecordCode: string;
    treatmentOutcome: TreatmentOutcome;
}

export interface PaginatedPatients {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: PatientItem[];
}

export interface NextOfKinItem {
    id: string;
    fullName: string;
    phoneNumber: string;
    relationship: string;
}

export interface NextOfKinItem {
    id: string;
    fullName: string;
    phoneNumber: string;
    relationship: string;
}

export interface NextOfKinRequest {
    fullName: string;
    phoneNumber: string;
    relationship: string;
}

export interface PatientTreatmentPlanItem {
    id: string;
    adherenceState: AdherenceState;
    treatmentPlanStatus: TreatmentPlanStatus;
    updatedAt: string;
}

export interface PatientDetail {
    id: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: Gender;
    height: number;
    weight: number;
    medicalRecordCode: string;
    healthInsuranceCard: string;
    address: string;
    city: string;
    admission: string;
    discharge: string | null;
    treatmentOutcome: TreatmentOutcome;
    nextOfKins: NextOfKinItem[];
    treatmentPlans: PatientTreatmentPlanItem[];
}

export interface PatientFilters {
    gender?: Gender | "";
    minAge?: number | "";
    maxAge?: number | "";
}

export interface CreatePatientRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: Gender;
    height: number;
    weight: number;
    medicalRecordCode: string;
    healthInsuranceCard: string;
    address: string;
    city: string;
}

export type UpdatePatientRequest = CreatePatientRequest;

export interface CloseTreatmentPlanRequest {
    reason: string;
}

export interface ReviewTreatmentPlanRequest {
    adherenceState: AdherenceState;
}

export interface PlanMedicineItem {
    id: string;
    name: string;
    classification: "Access" | "Watch" | "Reserve" | string;
}

export interface DiagnosisObservation {
    variable: {
        id: string;
        code: string;
        valueType: string;
    };
    value: string | number | boolean;
}

export interface DiagnosisMissingVariable {
    id: string;
    name?: string;
    code: string;
    valueType?: string;
}

export interface DiagnosisEvidence {
    source: string;
    formula: string;
    relatedObservations: DiagnosisObservation[];
    missingVariables: DiagnosisMissingVariable[];
    evaluatedValue?: boolean;
    score?: number;
}

export interface MetricSeverityDiagnosis {
    code: string;
    severity: string;
    treatmentSite: string;
    evidences: DiagnosisEvidence[];
}

export interface SuspectedPathogen {
    id: string;
    name: string;
}

export interface RecommendedProtocol {
    id: string;
    severity: string;
    treatmentSite: string;
    medicines: PlanMedicineItem[][];
    pathogens: SuspectedPathogen[];
    criteria: {
        id: string;
        name: string;
        formula: string;
    }[];
}

export interface ParsedDiagnosis {
    diagnosisId: string;
    severity: string;
    treatmentSite: string;
    metricsSeverityDiagnosis: MetricSeverityDiagnosis[];
    worthSuspected: SuspectedPathogen[];
    heavySuspected: SuspectedPathogen[];
    evidences: DiagnosisEvidence[];
    missingVariables: DiagnosisMissingVariable[];
    isPatientPregnantOrInLactationPhase: boolean;
    otherInfections: string[];
    microbialTestResults: unknown[];
    allergy: {
        type: string;
        allergicAntibiotics: PlanMedicineItem[];
    };
    protocols: RecommendedProtocol[];
}

export interface TreatmentPlanDetail {
    id: string;
    patient: {
        id: string;
        name: string;
    };
    doctorId: string;
    diagnosis: string;
    medicines: PlanMedicineItem[];
    reasonForMedicineChoice: string | null;
    adherenceState: AdherenceState;
    status: TreatmentPlanStatus;
    closeReason: string | null;
}