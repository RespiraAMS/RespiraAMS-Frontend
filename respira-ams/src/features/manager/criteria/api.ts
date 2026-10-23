import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedCriteria, 
    CriteriaDetail, 
    CreateCriteriaRequest, 
    UpdateCriteriaRequest, 
    MetricRuleReferenceDetail,
    RiskFactorReferenceDetail,
    ReferencedEntitiesResponse
} from "./types";

export async function getCriteriaList(
    page: number, 
    pageSize: number,
    // searchTerm?: string
): Promise<PaginatedCriteria> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    // let endpoint = `${API_BASE_SERVER}${API_BASE}/criteria`;
    
    // if (searchTerm) {
    //     endpoint = `${API_BASE_SERVER}${API_BASE}/criteria/search`;
    //     params.append("SearchTerm", searchTerm);
    // }

    const endpoint = `${API_BASE_SERVER}${API_BASE}/criteria`;

    const result = await apiFetch<PaginatedCriteria>(`${endpoint}?${params.toString()}`);
    if (!result) throw new Error("Failed to fetch criteria list");
    return result;
}

export async function getCriteriaDetail(id: string): Promise<CriteriaDetail> {
    const result = await apiFetch<CriteriaDetail>(`${API_BASE_SERVER}${API_BASE}/criteria/${id}`);
    if (!result) throw new Error("Failed to fetch criteria detail");
    return result;
}

export async function createCriteria(data: CreateCriteriaRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/criteria`, {
        method: "POST",
        body: JSON.stringify(data, (key, value) => (value === null ? undefined : value)),
    });
}

export async function updateCriteria(id: string, data: UpdateCriteriaRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/criteria/${id}`, {
        method: "PUT",
        body: JSON.stringify(data, (key, value) => (value === null ? undefined : value)),
    });
}

export async function deleteCriteria(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/criteria/${id}`, {
        method: "DELETE",
    });
}

export async function getCriteriaReferencedEntities(id: string): Promise<ReferencedEntitiesResponse> {
    const result = await apiFetch<ReferencedEntitiesResponse>(`${API_BASE_SERVER}${API_BASE}/criteria/${id}/referenced-entities`);
    if (!result) throw new Error("Failed to fetch referenced entities");
    return result;
}

export async function getRiskFactorDetail(id: string): Promise<RiskFactorReferenceDetail> {
    const result = await apiFetch<RiskFactorReferenceDetail>(`${API_BASE_SERVER}${API_BASE}/risk-factors/${id}`);
    if (!result) throw new Error("Failed to fetch risk factor detail");
    return result;
}

export async function getMetricRuleDetail(ruleId: string): Promise<MetricRuleReferenceDetail> {
    const result = await apiFetch<MetricRuleReferenceDetail>(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/rules/${ruleId}`);
    if (!result) throw new Error("Failed to fetch metric rule detail");
    return result;
}