import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import {
    AnalysisReportDetail,
    CreateAnalysisReportRequest,
    DoctorProfile,
    PaginatedAnalysisReports,
} from "./types";

export async function getAnalysisReports(
    page: number,
    pageSize: number
): Promise<PaginatedAnalysisReports> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    const result = await apiFetch<PaginatedAnalysisReports>(
        `${API_BASE_SERVER}${API_BASE}/analysis/reports?${params.toString()}`
    );
    if (!result) throw new Error("Failed to fetch analysis reports");
    return result;
}

export async function getAnalysisReportDetail(
    analysisId: string
): Promise<AnalysisReportDetail> {
    const result = await apiFetch<AnalysisReportDetail>(
        `${API_BASE_SERVER}${API_BASE}/analysis/reports/${analysisId}`
    );
    if (!result) throw new Error("Failed to fetch analysis report detail");
    return result;
}

export async function createAnalysisReport(
    data: CreateAnalysisReportRequest
): Promise<AnalysisReportDetail | null> {
    return await apiFetch<AnalysisReportDetail>(
        `${API_BASE_SERVER}${API_BASE}/analysis/reports`,
        {
            method: "POST",
            body: JSON.stringify({
                doctorId: data.doctorId ?? null,
                start: data.start,
                end: data.end,
            }),
        }
    );
}

export async function downloadAnalysisReportExcel(analysisId: string): Promise<void> {
    const response = await fetch(
        `${API_BASE_SERVER}${API_BASE}/analysis/reports/${analysisId}/excel`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
            const errorBody = await response.json();
            if (errorBody?.error?.description) {
                errorMessage = errorBody.error.description;
            }
        } catch {
        }
        throw new Error(errorMessage);
    }

    const blob = await response.blob();

    const disposition = response.headers.get("Content-Disposition");
    let fileName = `analysis-report-${analysisId.slice(0, 8)}.xlsx`;
    if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
        if (utf8Match?.[1]) {
            fileName = decodeURIComponent(utf8Match[1]);
        } else if (asciiMatch?.[1]) {
            fileName = asciiMatch[1];
        }
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export async function getDoctorById(doctorId: string): Promise<DoctorProfile> {
    const result = await apiFetch<DoctorProfile>(
        `${API_BASE_SERVER}${API_BASE}/doctors/${doctorId}`
    );
    if (!result) throw new Error("Failed to fetch doctor profile");
    return result;
}

export async function deleteAnalysisReport(analysisId: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/analysis/reports/${analysisId}`, {
        method: "DELETE",
    });
}