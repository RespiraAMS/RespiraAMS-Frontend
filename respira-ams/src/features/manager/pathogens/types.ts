export interface PathogenItem {
    id: string;
    name: string;
    description: string;
    isAtypical: boolean;
}

export interface PaginatedPathogens {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: PathogenItem[];
}

export interface CreatePathogenRequest {
    name: string;
    description: string;
    isAtypical: boolean;
}

export interface UpdatePathogenRequest {
    name: string;
    description: string;
    isAtypical: boolean;
}