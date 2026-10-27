import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedClinicalVariables, 
    ClinicalVariableDetail,
    VariableCategory,
    VariableValueType,
    UpdateClinicalVariableRequest,
    CreateClinicalVariableRequest,
    ClinicalVariableListResponse
} from "./types";

export async function getClinicalVariables(
    page: number, 
    pageSize: number, 
    searchTerm?: string,
    isRequired?: boolean | null,
    valueType?: VariableValueType | "",
    category?: VariableCategory | ""
): Promise<PaginatedClinicalVariables> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (isRequired !== undefined && isRequired !== null) params.append("IsRequired", isRequired.toString());
    if (valueType) params.append("ValueType", valueType);
    if (category) params.append("Category", category);

    let endpoint = `${API_BASE_SERVER}${API_BASE}/clinical-variables`;

    if (searchTerm) {
        endpoint = `${API_BASE_SERVER}${API_BASE}/clinical-variables/search`;
        params.append("SearchTerm", searchTerm);
    }

    const result = await apiFetch<PaginatedClinicalVariables>(`${endpoint}?${params.toString()}`);
    if (result === null) {
        throw new Error("Failed to fetch clinical variables");
    }
    return result;
}

export async function getClinicalVariableDetail(id: string): Promise<ClinicalVariableDetail> {
    const result = await apiFetch<ClinicalVariableDetail>(`${API_BASE_SERVER}${API_BASE}/clinical-variables/${id}`);
    if (result === null) {
        throw new Error("Failed to fetch clinical variable detail");
    }
    return result;
}

export async function createClinicalVariable(data: CreateClinicalVariableRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-variables`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateClinicalVariable(id: string, data: UpdateClinicalVariableRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-variables/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteClinicalVariable(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-variables/${id}`, {
        method: "DELETE",
    });
}

export async function getClinicalVariablesList(): Promise<ClinicalVariableListResponse> {
    const result = await apiFetch<ClinicalVariableListResponse>(`${API_BASE_SERVER}${API_BASE}/clinical-variables/list`);
    if (result === null) {
        throw new Error("Failed to fetch clinical variables list");
    }
    return result;
}