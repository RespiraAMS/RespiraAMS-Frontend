import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getClinicalMetricsList, 
    getClinicalMetricDetail, 
    createClinicalMetric, 
    updateClinicalMetric, 
    deleteClinicalMetric, 
    getMetricRuleDetail,
    createMetricRule,
    updateMetricRule,
    deleteMetricRule
} from "./api";
import { CreateMetricRuleRequest, UpdateMetricRuleRequest } from "./types";

export const clinicalMetricKeys = {
    all: ["clinical-metrics"] as const,
    lists: () => [...clinicalMetricKeys.all, "list"] as const,
    list: (params: { page: number; pageSize: number; searchTerm?: string; isApplied?: boolean | null }) => [...clinicalMetricKeys.lists(), params] as const,
    details: () => [...clinicalMetricKeys.all, "detail"] as const,
    detail: (id: string) => [...clinicalMetricKeys.details(), id] as const,
};

export function useClinicalMetricsList(page: number, pageSize: number, searchTerm?: string, isApplied?: boolean | null) {
    return useQuery({
        queryKey: clinicalMetricKeys.list({ page, pageSize, searchTerm, isApplied }),
        queryFn: () => getClinicalMetricsList(page, pageSize, searchTerm, isApplied),
    });
}

export function useClinicalMetricDetail(id: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: clinicalMetricKeys.detail(id),
        queryFn: () => getClinicalMetricDetail(id),
        enabled: options?.enabled ?? true,
    });
}

export function useClinicalMetricMutations() {
    const queryClient = useQueryClient();

    const invalidateList = () => {
        queryClient.invalidateQueries({ queryKey: clinicalMetricKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: createClinicalMetric,
        onSuccess: invalidateList,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateClinicalMetric>[1] }) => updateClinicalMetric(id, data),
        onSuccess: (_, { id }) => {
            invalidateList();
            queryClient.invalidateQueries({ queryKey: clinicalMetricKeys.detail(id) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteClinicalMetric,
        onSuccess: invalidateList,
    });

    return { createMutation, updateMutation, deleteMutation };
}

export const metricRuleKeys = {
    detail: (id: string) => ["metric-rule", id] as const,
};

export function useMetricRuleDetail(ruleId: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: metricRuleKeys.detail(ruleId),
        queryFn: () => getMetricRuleDetail(ruleId),
        enabled: options?.enabled ?? true,
    });
}

export function useMetricRuleMutations(metricId: string) {
    const queryClient = useQueryClient();

    const invalidateMetricDetail = () => {
        queryClient.invalidateQueries({ queryKey: clinicalMetricKeys.detail(metricId) });
    };

    const createMutation = useMutation({
        mutationFn: (data: CreateMetricRuleRequest) => createMetricRule(metricId, data),
        onSuccess: invalidateMetricDetail,
    });

    const updateMutation = useMutation({
        mutationFn: ({ ruleId, data }: { ruleId: string; data: UpdateMetricRuleRequest }) => updateMetricRule(metricId, ruleId, data),
        onSuccess: (_, { ruleId }) => {
            invalidateMetricDetail();
            queryClient.invalidateQueries({ queryKey: metricRuleKeys.detail(ruleId) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (ruleId: string) => deleteMetricRule(ruleId),
        onSuccess: invalidateMetricDetail,
    });

    return { createMutation, updateMutation, deleteMutation };
}