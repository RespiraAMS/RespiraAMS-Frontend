export enum AwareCategory {
    Access = "Access",
    AccessWatch = "AccessWatch",
    Watch = "Watch",
    Reserve = "Reserve",
    Others = "Others",
    Unclassified = "Unclassified"
}

export interface AntibioticGroup {
    id: string;
    name: string;
}

export interface AntibioticItem {
    id: string;
    name: string;
    antibioticGroup: AntibioticGroup;
    classification: string | AwareCategory;
    rank?: number; 
}

export interface AntibioticGroupsResponse {
    antibioticGroups: AntibioticGroup[];
}

export interface CreateAntibioticRequest {
    name: string;
    antibioticGroupId: string;
    classification: string;
    routeOfAdministration: string; 
    standardDose: string;
}

export interface UpdateAntibioticRequest {
    name: string;
    antibioticGroupId: string;
    classification: string;
}

export interface CrCl {
    min: number;
    isMinExclusive: boolean;
    max: number;
    isMaxExclusive: boolean;
    unit: string | null;
}

export interface DosageItem {
    id: string;
    routeOfAdministration: string;
    dose: string;
    crcl: CrCl | null;
}

export interface AntibioticDetailResponse {
    id: string;
    name: string;
    antibioticGroup: AntibioticGroup & { description?: string; parentId?: string; parentName?: string };
    classification: string;
    dosages: DosageItem[];
}