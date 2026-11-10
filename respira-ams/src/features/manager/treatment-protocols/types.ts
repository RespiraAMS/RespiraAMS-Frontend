export type SeverityLevel = "Mild" | "Moderate" | "Severe";
export type TreatmentSite = "Outpatient" | "Inpatient" | "IntensiveCareUnit";

export interface PathogenItem {
    id: string;
    name: string;
}

export interface CriterionItem {
    id: string;
    name: string;
    formula?: string;
}

export interface AntibioticItem {
    id: string;
    name: string;
    antibioticGroupId?: string;
    antibioticGroupName?: string;
    classification?: string;
}

export interface TreatmentProtocolItem {
    id: string;
    severity: SeverityLevel;
    treatmentSite: TreatmentSite;
    treatments: AntibioticItem[][];
    pathogens: PathogenItem[];
    criteria: CriterionItem[];
    version: string;
    publisher: string;
    isApplied: boolean;
}

export interface PaginatedTreatmentProtocols {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: TreatmentProtocolItem[];
}

export interface FilterTreatmentProtocolsRequest {
    page: number;
    pageSize: number;
    severity?: SeverityLevel | null;
    treatmentSite?: TreatmentSite | null;
    pathogenIds?: string[];
    criteriaIds?: string[];
}

export interface TreatmentProtocolRequest {
    severity: SeverityLevel;
    treatmentSite: TreatmentSite;
    medicines: string[][]; // Array of groups, each group is an array of antibiotic IDs
    pathogens: string[];
    criteria: string[];
    version: string;
    publisher: string;
    isApplied: boolean;
}