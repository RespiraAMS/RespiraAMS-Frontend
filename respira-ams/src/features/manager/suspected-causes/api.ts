import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedSuspectedCauses, 
    CreateSuspectedCauseRequest, 
    UpdateSuspectedCauseRequest, 
    PathogenListResponse,
    Severity,
    TreatmentSite
} from "./types";

export async function getSuspectedCauses(
    page: number, 
    pageSize: number, 
    pathogenId?: string,
    severity?: Severity | "",
    treatmentSite?: TreatmentSite | ""
): Promise<PaginatedSuspectedCauses> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (pathogenId) params.append("PathogenId", pathogenId);
    if (severity) params.append("Severity", severity);
    if (treatmentSite) params.append("TreatmentSite", treatmentSite);

    const result = await apiFetch<PaginatedSuspectedCauses>(`${API_BASE_SERVER}${API_BASE}/suspected-causes?${params.toString()}`);
    if (result === null) {
        throw new Error("Failed to fetch suspected causes.");
    }
    return result;
}

export async function getPathogensList(): Promise<PathogenListResponse> {
    const result = await apiFetch<PathogenListResponse>(`${API_BASE_SERVER}${API_BASE}/pathogens/list`);
    if (result === null) {
        throw new Error("Failed to fetch pathogens.");
    }
    return result;
}

export async function createSuspectedCause(data: CreateSuspectedCauseRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/suspected-causes`, {
        method: "POST", // Sửa thành POST theo chuẩn REST
        body: JSON.stringify(data),
    });
}

export async function updateSuspectedCause(id: string, data: UpdateSuspectedCauseRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/suspected-causes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSuspectedCause(id: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/suspected-causes/${id}`, {
        method: "DELETE",
    });
}