import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getCriteriaList, 
    getCriteriaDetail, 
    createCriteria, 
    updateCriteria, 
    deleteCriteria, 
    getMetricRuleDetail,
    getRiskFactorDetail,
    getCriteriaReferencedEntities
} from "./api";

export const criteriaKeys = {
    all: ["criteria"] as const,
    lists: () => [...criteriaKeys.all, "list"] as const,
    list: (params: { page: number; pageSize: number }) => [...criteriaKeys.lists(), params] as const,
    details: () => [...criteriaKeys.all, "detail"] as const,
    detail: (id: string) => [...criteriaKeys.details(), id] as const,
};

// export function useCriteriaList(page: number, pageSize: number, searchTerm?: string) {
//     return useQuery({
//         queryKey: criteriaKeys.list({ page, pageSize, searchTerm }),
//         queryFn: () => getCriteriaList(page, pageSize, searchTerm),
//     });
// }

export function useCriteriaList(page: number, pageSize: number) {
    return useQuery({
        queryKey: criteriaKeys.list({ page, pageSize }),
        queryFn: () => getCriteriaList(page, pageSize),
    });
}

export function useCriteriaDetail(id: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: criteriaKeys.detail(id),
        queryFn: () => getCriteriaDetail(id),
        enabled: options?.enabled ?? true,
    });
}

export function useCriteriaMutations() {
    const queryClient = useQueryClient();

    const invalidateList = () => {
        queryClient.invalidateQueries({ queryKey: criteriaKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: createCriteria,
        onSuccess: invalidateList,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateCriteria>[1] }) => updateCriteria(id, data),
        onSuccess: (_, { id }) => {
            invalidateList();
            queryClient.invalidateQueries({ queryKey: criteriaKeys.detail(id) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCriteria,
        onSuccess: invalidateList,
    });

    return { createMutation, updateMutation, deleteMutation };
}

export const criteriaRefKeys = {
    all: ["criteria-refs"] as const,
    detail: (id: string) => [...criteriaRefKeys.all, id] as const,
};

export function useCriteriaReferencedEntities(id: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: criteriaRefKeys.detail(id),
        queryFn: () => getCriteriaReferencedEntities(id),
        enabled: options?.enabled ?? true,
    });
}

export function useRiskFactorsDetails(ids: string[]) {
    return useQueries({
        queries: ids.map((id) => ({
            queryKey: ["risk-factor", id],
            queryFn: () => getRiskFactorDetail(id),
            enabled: !!id,
        })),
    });
}

export function useMetricRulesDetails(ids: string[]) {
    return useQueries({
        queries: ids.map((id) => ({
            queryKey: ["metric-rule", id],
            queryFn: () => getMetricRuleDetail(id),
            enabled: !!id,
        })),
    });
}