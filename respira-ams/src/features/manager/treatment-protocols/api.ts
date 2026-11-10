import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedTreatmentProtocols, 
    FilterTreatmentProtocolsRequest,
    TreatmentProtocolRequest,
    PathogenItem,
    CriterionItem,
    AntibioticItem
} from "./types";

export async function getTreatmentProtocolsList(filters: FilterTreatmentProtocolsRequest): Promise<PaginatedTreatmentProtocols> {
    const params = new URLSearchParams({
        Page: filters.page.toString(),
        Size: filters.pageSize.toString(),
    });

    if (filters.severity) params.append("Severity", filters.severity);
    if (filters.treatmentSite) params.append("TreatmentSite", filters.treatmentSite);
    
    if (filters.pathogenIds?.length) {
        filters.pathogenIds.forEach(id => params.append("PathogenIds", id));
    }
    if (filters.criteriaIds?.length) {
        filters.criteriaIds.forEach(id => params.append("CriteriaIds", id));
    }

    const result = await apiFetch<PaginatedTreatmentProtocols>(`${API_BASE_SERVER}${API_BASE}/treatment-protocols?${params.toString()}`);
    if (!result) throw new Error("Failed to fetch treatment protocols list");
    return result;
}

export async function createTreatmentProtocol(data: TreatmentProtocolRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/treatment-protocols`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateTreatmentProtocol(id: string, data: TreatmentProtocolRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/treatment-protocols/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteTreatmentProtocol(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/treatment-protocols/${id}`, {
        method: "DELETE",
    });
}

export async function getPathogensList(): Promise<{ pathogens: PathogenItem[] }> {
    const result = await apiFetch<{ pathogens: PathogenItem[] }>(`${API_BASE_SERVER}${API_BASE}/pathogens/list`);
    if (!result) throw new Error("Failed to fetch pathogens list");
    return result;
}

export async function getCriteriaList(): Promise<{ criteria: CriterionItem[] }> {
    const result = await apiFetch<{ criteria: CriterionItem[] }>(`${API_BASE_SERVER}${API_BASE}/criteria/list`);
    if (!result) throw new Error("Failed to fetch criteria list");
    return result;
}

export async function getAntibioticsList(): Promise<{ antibiotics: AntibioticItem[] }> {
    const result = await apiFetch<{ antibiotics: AntibioticItem[] }>(`${API_BASE_SERVER}${API_BASE}/antibiotics/list`);
    if (!result) throw new Error("Failed to fetch antibiotics list");
    return result;
}