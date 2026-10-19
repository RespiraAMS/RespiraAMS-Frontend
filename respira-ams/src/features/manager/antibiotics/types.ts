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
    dosages?: Record<string, string[]>;
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