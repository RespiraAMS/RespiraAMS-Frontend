import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { Pagination } from "@/lib/models";
import { AntibioticItem, AntibioticGroupsResponse, CreateAntibioticRequest, UpdateAntibioticRequest, AntibioticDetailResponse } from "./types";

export async function getAntibiotics(
    page: number, 
    size: number,
    Classification?: string,
    groupId?: string
): Promise<Pagination<AntibioticItem>> {
    let url = `${API_BASE_SERVER}${API_BASE}/antibiotics?page=${page}&pageSize=${size}`;
    if (Classification) url += `&classification=${encodeURIComponent(Classification)}`;
    if (groupId) url += `&antibioticGroupId=${encodeURIComponent(groupId)}`;

    const result = await apiFetch<Pagination<AntibioticItem>>(url);
    return result!;
}

export async function searchAntibiotics(
    searchTerm: string, 
    page: number, 
    size: number,
    classification?: string,
    groupId?: string
): Promise<Pagination<AntibioticItem>> {
    let url = `${API_BASE_SERVER}${API_BASE}/antibiotics/search?SearchTerm=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${size}`;
    if (classification) url += `&classification=${encodeURIComponent(classification)}`;
    if (groupId) url += `&antibioticGroupId=${encodeURIComponent(groupId)}`;
    
    const result = await apiFetch<Pagination<AntibioticItem>>(url);
    return result!;
}

export async function getAntibioticGroups(): Promise<AntibioticGroupsResponse> {
    const result = await apiFetch<AntibioticGroupsResponse>(`${API_BASE_SERVER}${API_BASE}/antibiotic-groups/list`);
    return result!;
}

export async function createAntibiotic(data: CreateAntibioticRequest): Promise<{ id: string }> {
    const result = await apiFetch<{ id: string }>(`${API_BASE_SERVER}${API_BASE}/antibiotics`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return result!;
}

export async function updateAntibiotic(id: string, data: UpdateAntibioticRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiotics/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteAntibiotic(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiotics/${id}`, {
        method: "DELETE",
    });
}

export async function getAntibioticDetail(id: string): Promise<AntibioticDetailResponse> {
    const result = await apiFetch<AntibioticDetailResponse>(`${API_BASE_SERVER}${API_BASE}/antibiotics/${id}`);
    return result!;
}