import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedClinicalMetrics, 
    ClinicalMetricDetail,
    CreateClinicalMetricRequest, 
    UpdateClinicalMetricRequest, 
    MetricRuleDetail,
    CreateMetricRuleRequest,
    UpdateMetricRuleRequest
} from "./types";

export async function getClinicalMetricsList(
    page: number, 
    pageSize: number,
    searchTerm?: string,
    isApplied?: boolean | null
): Promise<PaginatedClinicalMetrics> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (isApplied !== null && isApplied !== undefined) {
        params.append("IsApplied", isApplied.toString());
    }

    let endpoint = `${API_BASE_SERVER}${API_BASE}/clinical-metrics`;
    
    if (searchTerm) {
        endpoint = `${API_BASE_SERVER}${API_BASE}/clinical-metrics/search`;
        params.append("SearchTerm", searchTerm);
    }

    const result = await apiFetch<PaginatedClinicalMetrics>(`${endpoint}?${params.toString()}`);
    if (!result) throw new Error("Failed to fetch clinical metrics list");
    return result;
}

export async function getClinicalMetricDetail(id: string): Promise<ClinicalMetricDetail> {
    const result = await apiFetch<ClinicalMetricDetail>(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${id}`);
    if (!result) throw new Error("Failed to fetch clinical metric detail");
    return result;
}

export async function createClinicalMetric(data: CreateClinicalMetricRequest): Promise<unknown> {
    return await apiFetch<unknown>(`${API_BASE_SERVER}${API_BASE}/clinical-metrics`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateClinicalMetric(id: string, data: UpdateClinicalMetricRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteClinicalMetric(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${id}`, {
        method: "DELETE",
    });
}

export async function getMetricRuleDetail(ruleId: string): Promise<MetricRuleDetail> {
    const result = await apiFetch<MetricRuleDetail>(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/rules/${ruleId}`);
    if (!result) throw new Error("Failed to fetch metric rule detail");
    return result;
}

export async function createMetricRule(metricId: string, data: CreateMetricRuleRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${metricId}/rules`, {
        method: "POST",
        body: JSON.stringify(data, (key, value) => (value === null ? undefined : value)),
    });
}

export async function updateMetricRule(metricId: string, ruleId: string, data: UpdateMetricRuleRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${metricId}/rules/${ruleId}`, {
        method: "PUT",
        body: JSON.stringify(data, (key, value) => (value === null ? undefined : value)),
    });
}

export async function deleteMetricRule(ruleId: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/rules/${ruleId}`, {
        method: "DELETE",
    });
}