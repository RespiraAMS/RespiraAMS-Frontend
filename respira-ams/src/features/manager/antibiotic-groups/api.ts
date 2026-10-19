// src/features/manager/antibiotic-groups/api.ts

import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedAntibioticGroups, 
    AntibioticGroupListResponse, 
    CreateAntibioticGroupRequest, 
    UpdateAntibioticGroupRequest 
} from "./types";


export async function getAntibioticGroups(
    page: number, 
    pageSize: number, 
    searchTerm?: string, 
    parentId?: string
): Promise<PaginatedAntibioticGroups> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    let endpoint = `${API_BASE_SERVER}${API_BASE}/antibiotic-groups`;

    if (searchTerm) {
        endpoint = `${API_BASE_SERVER}${API_BASE}/antibiotic-groups/search`;
        params.append("SearchTerm", searchTerm);
    } 
    
    if (parentId) {
        params.append("ParentId", parentId);
    }

    const response = await apiFetch<PaginatedAntibioticGroups>(`${endpoint}?${params.toString()}`);
    if (response === null) {
        throw new Error("Failed to fetch antibiotic groups");
    }
    return response;
}


export async function getAntibioticGroupsList(): Promise<AntibioticGroupListResponse> {
    const response = await apiFetch<AntibioticGroupListResponse>(`${API_BASE_SERVER}${API_BASE}/antibiotic-groups/list`);
    if (response === null) {
        throw new Error("Failed to fetch antibiotic groups list");
    }
    return response;
}

export async function createAntibioticGroup(data: CreateAntibioticGroupRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiotic-groups`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateAntibioticGroup(id: string, data: UpdateAntibioticGroupRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiotic-groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteAntibioticGroup(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiotic-groups/${id}`, {
        method: "DELETE",
    });
}