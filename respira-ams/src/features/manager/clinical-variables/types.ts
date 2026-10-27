export type VariableValueType = "Numeric" | "Boolean" | "Categorical";
export type VariableCategory = "PersonalInformation" | "Paraclinical" | "Clinical";

export interface ClinicalVariableItem {
    id: string;
    name: string;
    code: string;
    isRequired: boolean;
    valueType: VariableValueType;
    category: VariableCategory;
}

export interface PaginatedClinicalVariables {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: ClinicalVariableItem[];
}

export interface RangeRule {
    min: number;
    isMinExclusive: boolean;
    max: number;
    isMaxExclusive: boolean;
    unit: string | null;
}

export interface ClinicalVariableDetail {
    id: string;
    name: string;
    code: string;
    description: string;
    valueType: VariableValueType;
    canonicalUnit: string | null;
    isRequired: boolean;
    category: VariableCategory;
    prerequisite: string | null;
    prerequisiteFormula?: FormulaNode | null;
    acceptedRange?: RangeRule | null;
    normalRange?: RangeRule | null;
    acceptedValues?: string[] | null;
}

export type FormulaOperator = "Add" | "Sub" | "Mul" | "Div" | "Eq" | "Ne" | "Gt" | "Gte" | "Lt" | "Lte" | "And" | "Or";

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

export interface CreateClinicalVariableRequest {
    code: string;
    name: string;
    description: string;
    valueType: VariableValueType;
    canonicalUnit?: string;
    isRequired: boolean;
    category: VariableCategory;
    prerequisite?: FormulaNode;
    acceptedRange?: RangeRule;
    normalRange?: RangeRule;
    acceptedValues?: string[];
}

export interface UpdateClinicalVariableRequest {
    id: string;
    code: string;
    name: string;
    description: string;
    valueType: VariableValueType;
    canonicalUnit?: string;
    isRequired: boolean;
    category: VariableCategory;
    prerequisite?: FormulaNode;
    acceptedRange?: RangeRule;
    normalRange?: RangeRule;
    acceptedValues?: string[];
}

export interface ClinicalVariableListOption {
    id: string;
    name: string;
    code: string;
}

export interface ClinicalVariableListResponse {
    clinicalVariables: ClinicalVariableListOption[];
}