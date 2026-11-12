export type TimeRange = "30d" | "quarter" | "year";

export interface KpiMetric {
	id: string;
	title: string;
	value: number | string;
	changePercent: number;
	subtitle: string;
	type: "diagnosis" | "treatment" | "microbiology";
}

export interface WeeklyDiagnosisData {
	week: string; // e.g. "T1", "T2", ...
	fullLabel: string;
	count: number;
}

export interface PathogenData {
	id: string;
	name: string;
	count: number;
	percentage: number; // width in %
	barColor: string;
	sensitivityText: string;
	extraInfo: string;
	isWarning?: boolean;
	warningColor?: string;
}

export interface MedicineAnalysisSummary {
	medicineId: string;
	name: string;
	classification: string;
	totalTreatmentPlans: number;
	totalAdherentPlans: number;
	totalNonAdherentPlans: number;
	totalPendingReviewPlans: number;
}

export interface DoctorMedicineAnalysisSummary {
	doctorId: string;
	totalPatients: number;
	totalTreatmentPlans: number;
	totalAdherentPlans: number;
	totalNonAdherentPlans: number;
	totalPendingReviewPlans: number;
	medicines: MedicineAnalysisSummary[];
}

export interface AnalysisReportResult {
	analysisId: string;
	doctorId?: string | null;
	start: string;
	end: string;
	totalTreatmentPlans: number;
	totalPatients: number;
	totalAdherentPlans: number;
	totalNonAdherentPlans: number;
	totalPendingReviewPlans: number;
	totalDeceasedPatients: number;
	totalRecoveredPatients: number;
	totalOtherOutcomePatients: number;
	doctors: DoctorMedicineAnalysisSummary[];
}

export interface AnalysisReportListItem {
	analysisId: string;
	doctorId?: string | null;
	start: string;
	end: string;
	totalTreatmentPlans: number;
	totalPatients: number;
	totalAdherentPlans: number;
	totalNonAdherentPlans: number;
	totalPendingReviewPlans: number;
	totalDeceasedPatients: number;
	totalRecoveredPatients: number;
	totalOtherOutcomePatients: number;
	createdAt: string;
}

export interface PatientStatItem {
	id: string;
	medicalRecordCode: string;
	firstName: string;
	lastName: string;
	gender: string;
	dateOfBirth: string;
	admission: string;
	discharge?: string | null;
	treatmentOutcome: "InTreatment" | "Recovered" | "Death" | "OutOfScope" | string;
}
