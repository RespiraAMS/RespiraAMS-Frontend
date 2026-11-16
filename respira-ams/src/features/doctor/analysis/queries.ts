import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createAnalysisReport,
    deleteAnalysisReport,
    downloadAnalysisReportExcel,
    getAnalysisReportDetail,
    getAnalysisReports,
    getDoctorById,
} from "./api";

export const analysisKeys = {
    all: ["analysis"] as const,
    lists: () => [...analysisKeys.all, "list"] as const,
    list: (params: { page: number; pageSize: number }) =>
        [...analysisKeys.lists(), params] as const,
    details: () => [...analysisKeys.all, "detail"] as const,
    detail: (analysisId: string) => [...analysisKeys.details(), analysisId] as const,
    doctors: () => ["doctors", "detail"] as const,
    doctor: (doctorId: string) => [...analysisKeys.doctors(), doctorId] as const,
};

export function useAnalysisReports(page: number, pageSize: number) {
    return useQuery({
        queryKey: analysisKeys.list({ page, pageSize }),
        queryFn: () => getAnalysisReports(page, pageSize),
    });
}

export function useAnalysisReportDetail(
    analysisId: string,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: analysisKeys.detail(analysisId),
        queryFn: () => getAnalysisReportDetail(analysisId),
        enabled: (options?.enabled ?? true) && !!analysisId,
    });
}

export function useDoctorDetail(doctorId: string | null | undefined) {
    return useQuery({
        queryKey: analysisKeys.doctor(doctorId || ""),
        queryFn: () => getDoctorById(doctorId as string),
        enabled: !!doctorId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export function useAnalysisMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createAnalysisReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
        },
    });

    const downloadExcelMutation = useMutation({
        mutationFn: downloadAnalysisReportExcel,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAnalysisReport,
        onSuccess: (_, analysisId) => {
            queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
            queryClient.removeQueries({ queryKey: analysisKeys.detail(analysisId) });
        },
    });

    return { createMutation, downloadExcelMutation, deleteMutation };
}