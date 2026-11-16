export interface AnalysisReportItem {
    analysisId: string;
    doctorId: string | null;
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

export interface PaginatedAnalysisReports {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: AnalysisReportItem[];
}

export interface MedicineAnalysisBreakdown {
    medicineId: string;
    name: string;
    classification: "Access" | "Watch" | "Reserve" | string;
    totalTreatmentPlans: number;
    totalAdherentPlans: number;
    totalNonAdherentPlans: number;
    totalPendingReviewPlans: number;
}

export interface DoctorAnalysisBreakdown {
    doctorId: string;
    totalPatients: number;
    totalTreatmentPlans: number;
    totalAdherentPlans: number;
    totalNonAdherentPlans: number;
    totalPendingReviewPlans: number;
    medicines: MedicineAnalysisBreakdown[];
}

export interface AnalysisReportDetail {
    analysisId: string;
    doctorId: string | null;
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
    createdAt?: string;
    doctors: DoctorAnalysisBreakdown[];
}

export interface CreateAnalysisReportRequest {
    doctorId: string | null;
    start: string;
    end: string;
}

export interface DoctorProfile {
    id: string;
    accountId: string;
    role: string;
    firstName: string;
    lastName: string;
    degrees: string[];
    academicTitle: string;
    position: string;
    gender: string;
    citizenIdentificationNumber: string;
    dateOfBirth: string;
    address: string;
    mediaId: string | null;
    createdAt: string;
}