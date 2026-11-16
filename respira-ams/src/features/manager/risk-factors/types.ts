export interface RiskFactorItem {
    id: string;
    pathogen: {
        id: string;
        name: string;
    };
    criterion: {
        id: string;
        name: string;
        formula: string;
    };
    isCriticalFactor: boolean;
}

export interface PaginatedRiskFactors {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: RiskFactorItem[];
}

export interface CreateRiskFactorRequest {
    pathogenId: string;
    criterionId: string;
    isCriticalFactor: boolean;
}

export interface UpdateRiskFactorRequest {
    pathogenId: string;
    criterionId: string;
    isCriticalFactor: boolean;
}

export interface SimpleDropdownItem {
    id: string;
    name: string;
}