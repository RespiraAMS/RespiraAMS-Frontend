import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getRiskFactorsList, 
    createRiskFactor, 
    updateRiskFactor, 
    deleteRiskFactor,
    getPathogensDropdown,
    getCriteriaDropdown
} from "./api";

export const riskFactorKeys = {
    all: ["risk-factors"] as const,
    lists: () => [...riskFactorKeys.all, "list"] as const,
    list: (params: { page: number; pageSize: number; pathogenId?: string | null }) => [...riskFactorKeys.lists(), params] as const,
    dropdownPathogens: ["dropdown", "pathogens"] as const,
    dropdownCriteria: ["dropdown", "criteria"] as const,
};

export function useRiskFactorsList(page: number, pageSize: number, pathogenId?: string | null) {
    return useQuery({
        queryKey: riskFactorKeys.list({ page, pageSize, pathogenId }),
        queryFn: () => getRiskFactorsList(page, pageSize, pathogenId),
    });
}

export function useRiskFactorMutations() {
    const queryClient = useQueryClient();

    const invalidateList = () => {
        queryClient.invalidateQueries({ queryKey: riskFactorKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: createRiskFactor,
        onSuccess: invalidateList,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateRiskFactor>[1] }) => updateRiskFactor(id, data),
        onSuccess: invalidateList,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRiskFactor,
        onSuccess: invalidateList,
    });

    return { createMutation, updateMutation, deleteMutation };
}

export function usePathogensDropdown() {
    return useQuery({
        queryKey: riskFactorKeys.dropdownPathogens,
        queryFn: getPathogensDropdown,
    });
}

export function useCriteriaDropdown() {
    return useQuery({
        queryKey: riskFactorKeys.dropdownCriteria,
        queryFn: getCriteriaDropdown,
    });
}