import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import {
    DoctorDetail,
    DoctorSubordinatesParams,
    PaginatedDoctors,
} from "./types";

export async function getSubordinateDoctors(
    params: DoctorSubordinatesParams
): Promise<PaginatedDoctors> {
    const searchParams = new URLSearchParams({
        Page: params.page.toString(),
        Size: params.pageSize.toString(),
    });

    if (params.searchTerm?.trim()) {
        searchParams.append("SearchTerm", params.searchTerm.trim());
    }
    if (params.gender) {
        searchParams.append("Gender", params.gender);
    }
    if (params.academicTitle) {
        searchParams.append("AcademicTitle", params.academicTitle);
    }
    if (params.position) {
        searchParams.append("Position", params.position);
    }

    const result = await apiFetch<PaginatedDoctors>(
        `${API_BASE_SERVER}${API_BASE}/doctors/subordinates?${searchParams.toString()}`
    );
    if (!result) throw new Error("Failed to fetch subordinate doctors");
    return result;
}

export async function getDoctorDetail(doctorId: string): Promise<DoctorDetail> {
    const result = await apiFetch<DoctorDetail>(
        `${API_BASE_SERVER}${API_BASE}/doctors/${doctorId}`
    );
    if (!result) throw new Error("Failed to fetch doctor detail");
    return result;
}