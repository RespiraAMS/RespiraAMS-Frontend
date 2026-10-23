export type FormulaOperator = "Add" | "Sub" | "Mul" | "Div" | "Eq" | "Ne" | "Gt" | "Gte" | "Lt" | "Lte" | "And" | "Or" | "Not";

export interface FormulaNode {
    constant?: string;
    variable?: string;
    left?: FormulaNode;
    right?: FormulaNode;
    operator?: FormulaOperator;
    operand?: FormulaNode;
    condition?: FormulaNode;
    ifTrue?: FormulaNode;
    ifFalse?: FormulaNode;
}

export interface CriteriaItem {
    id: string;
    name: string;
    formula: string;
}

export interface PaginatedCriteria {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: CriteriaItem[];
}

export interface CriteriaDetail {
    id: string;
    name: string;
    formulaString: string;
    formula: FormulaNode;
}

export interface CreateCriteriaRequest {
    name: string;
    formula: FormulaNode;
}

export interface UpdateCriteriaRequest {
    name: string;
    formula: FormulaNode;
}

export interface ReferencedEntitiesResponse {
    hasReferencedEntities: boolean;
    riskFactorReference: string[];
    metricRuleReference: string[];
    treatmentReference: string[];
}

export interface RiskFactorReferenceDetail {
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
}

export interface MetricRuleReferenceDetail {
    id: string;
    clinicalMetricId: string;
    clinicalMetricName: string;
    criterion: {
        id: string;
        name: string;
        formula: string;
    };
    scoreFunction: string | null;
    scoreFunctionFormula: FormulaNode | null;
    isMajor: boolean | null;
}