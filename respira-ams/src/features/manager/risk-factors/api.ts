// src/features/manager/risk-factors/api.ts

import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedRiskFactors, 
    CreateRiskFactorRequest, 
    UpdateRiskFactorRequest, 
    SimpleDropdownItem 
} from "./types";

export async function getRiskFactorsList(
    page: number, 
    pageSize: number,
    pathogenId?: string | null
): Promise<PaginatedRiskFactors> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (pathogenId) {
        params.append("PathogenId", pathogenId);
    }

    const result = await apiFetch<PaginatedRiskFactors>(`${API_BASE_SERVER}${API_BASE}/risk-factors?${params.toString()}`);
    if (!result) throw new Error("Failed to fetch risk factors list");
    return result;
}

export async function createRiskFactor(data: CreateRiskFactorRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/risk-factors`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateRiskFactor(id: string, data: UpdateRiskFactorRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/risk-factors/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteRiskFactor(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/risk-factors/${id}`, {
        method: "DELETE",
    });
}

export async function getPathogensDropdown(): Promise<{ pathogens: SimpleDropdownItem[] }> {
    const result = await apiFetch<{ pathogens: SimpleDropdownItem[] }>(`${API_BASE_SERVER}${API_BASE}/pathogens/list`);
    if (!result) return { pathogens: [] };
    return result;
}

export async function getCriteriaDropdown(): Promise<{ criteria: SimpleDropdownItem[] }> {
    const result = await apiFetch<{ criteria: SimpleDropdownItem[] }>(`${API_BASE_SERVER}${API_BASE}/criteria/list`);
    if (!result) return { criteria: [] };
    return result;
}