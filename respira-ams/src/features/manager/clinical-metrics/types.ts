import { FormulaNode } from "../clinical-variables/types";

export interface ClinicalMetricItem {
    id: string;
    name: string;
    code: string;
    description: string;
    version: string;
    publisher: string;
    isApplied: boolean;
}

export interface PaginatedClinicalMetrics {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: ClinicalMetricItem[];
}

export interface MetricRule {
    id: string;
    criterion: {
        id: string;
        name: string;
        formula: string;
    };
    scoreFunction?: string | null;
    isMajorRule?: boolean | null;
}

export interface ClinicalMetricDetail extends ClinicalMetricItem {
    rules: MetricRule[];
}

export interface CreateClinicalMetricRequest {
    name: string;
    code: string;
    description: string;
    version: string;
    publisher: string;
}

export interface UpdateClinicalMetricRequest {
    name: string;
    description: string;
    version: string;
    publisher: string;
    isApplied: boolean;
}

export interface MetricRuleDetail extends MetricRule {
    clinicalMetricId: string;
    clinicalMetricName: string;
    scoreFunctionFormula?: FormulaNode;
}

export interface CreateMetricRuleRequest {
    criterionId: string;
    scoreFunction?: FormulaNode;
    isMajor?: boolean;
}

export interface UpdateMetricRuleRequest {
    criterionId: string;
    scoreFunction?: FormulaNode;
    isMajor?: boolean;
}