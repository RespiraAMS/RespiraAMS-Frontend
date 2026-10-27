
export type Severity = "Mild" | "Moderate" | "Severe";
export type TreatmentSite = "Outpatient" | "Inpatient" | "IntensiveCareUnit";

export interface SuspectedCauseItem {
    id: string;
    pathogenId: string;
    pathogenName: string;
    severity: Severity;
    treatmentSite: TreatmentSite;
}

export interface PaginatedSuspectedCauses {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: SuspectedCauseItem[];
}

export interface PathogenListItem {
    id: string;
    name: string;
}

export interface PathogenListResponse {
    pathogens: PathogenListItem[];
}

export interface CreateSuspectedCauseRequest {
    pathogenId: string;
    severity: Severity;
    treatmentSite: TreatmentSite;
}

export interface UpdateSuspectedCauseRequest {
    pathogenId: string;
    severity: Severity;
    treatmentSite: TreatmentSite;
}