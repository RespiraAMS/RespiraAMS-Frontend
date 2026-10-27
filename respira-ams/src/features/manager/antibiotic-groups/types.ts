export interface AntibioticGroupItem {
    id: string;
    name: string;
    parentId: string | null;
    parentName: string | null;
    description: string;
}

export interface AntibioticGroupListResponse {
    antibioticGroups: { id: string; name: string }[];
}

export interface PaginatedAntibioticGroups {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: AntibioticGroupItem[];
}

export interface CreateAntibioticGroupRequest {
    name: string;
    parentId?: string | null;
    description?: string;
}

export interface UpdateAntibioticGroupRequest {
    name: string;
    parentId?: string | null;
    description?: string;
}