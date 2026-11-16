export type MicCategory = "Susceptible" | "Intermediate" | "Resistant";

export interface AntibioticItem {
    id: string;
    name: string;
    antibioticGroupId?: string;
    antibioticGroupName?: string;
    classification?: string;
}

export interface PathogenItem {
    id: string;
    name: string;
}

export interface AntibiogramItem {
    id: string;
    pathogen: PathogenItem;
    micCategory: MicCategory;
    antibiotics: AntibioticItem[];
}

export interface PaginatedAntibiograms {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: AntibiogramItem[];
}

export interface CreateAntibiogramRequest {
    micCategory: MicCategory;
    pathogenId: string;
    antibioticIds: string[];
}

export interface UpdateAntibiogramRequest {
    micCategory: MicCategory;
    pathogenId: string;
    antibioticIds: string[];
}