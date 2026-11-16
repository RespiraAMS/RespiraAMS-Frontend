import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedAntibiograms, 
    CreateAntibiogramRequest, 
    UpdateAntibiogramRequest,
    AntibioticItem,
    PathogenItem,
    MicCategory
} from "./types";

export async function getAntibiogramsList(
    page: number, 
    pageSize: number,
    pathogenId?: string | null,
    micCategory?: MicCategory | null
): Promise<PaginatedAntibiograms> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (pathogenId) params.append("PathogenId", pathogenId);
    if (micCategory) params.append("MicCategory", micCategory);

    const result = await apiFetch<PaginatedAntibiograms>(`${API_BASE_SERVER}${API_BASE}/antibiograms?${params.toString()}`);
    if (!result) throw new Error("Failed to fetch antibiograms list");
    return result;
}

export async function createAntibiogram(data: CreateAntibiogramRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiograms`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateAntibiogram(id: string, data: UpdateAntibiogramRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiograms/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteAntibiogram(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/antibiograms/${id}`, {
        method: "DELETE",
    });
}

export async function getAntibioticsList(): Promise<{ antibiotics: AntibioticItem[] }> {
    const result = await apiFetch<{ antibiotics: AntibioticItem[] }>(`${API_BASE_SERVER}${API_BASE}/antibiotics/list`);
    if (!result) throw new Error("Failed to fetch antibiotics list");
    return result;
}

export async function getPathogensList(): Promise<{ pathogens: PathogenItem[] }> {
    const result = await apiFetch<{ pathogens: PathogenItem[] }>(`${API_BASE_SERVER}${API_BASE}/pathogens/list`);
    if (!result) throw new Error("Failed to fetch pathogens list");
    return result;
}