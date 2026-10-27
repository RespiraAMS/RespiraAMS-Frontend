
import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { PaginatedPathogens, CreatePathogenRequest, UpdatePathogenRequest } from "./types";


export async function getPathogens(
    page: number, 
    pageSize: number, 
    searchTerm?: string, 
    isAtypical?: boolean | null
): Promise<PaginatedPathogens> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (isAtypical !== undefined && isAtypical !== null) {
        params.append("IsAtypical", isAtypical.toString());
    }

    let endpoint = `${API_BASE_SERVER}${API_BASE}/pathogens`;

    if (searchTerm && searchTerm.trim().length >= 2) {
        endpoint = `${API_BASE_SERVER}${API_BASE}/pathogens/search`;
        params.append("SearchTerm", searchTerm.trim());
    } 

    const pathogens = await apiFetch<PaginatedPathogens>(`${endpoint}?${params.toString()}`);
    if (pathogens === null) {
        throw new Error("Failed to fetch pathogens.");
    }
    return pathogens;
}

export async function createPathogen(data: CreatePathogenRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/pathogens`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updatePathogen(id: string, data: UpdatePathogenRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/pathogens/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deletePathogen(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/pathogens/${id}`, {
        method: "DELETE",
    });
}