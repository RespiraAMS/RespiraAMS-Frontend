import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAntibiotics,
    searchAntibiotics,
    getAntibioticGroups,
    createAntibiotic,
    updateAntibiotic,
    deleteAntibiotic,
    getAntibioticDetail,
    updateDosage,
    deleteDosage,
    createDosage,
} from "./api";
import { DosageRequest, UpdateAntibioticRequest } from "./types";

export const antibioticKeys = {
    all: ["antibiotics"] as const,
    lists: () => [...antibioticKeys.all, "list"] as const,
    list: (page: number, size: number, searchTerm: string, category: string, groupId: string) => 
        [...antibioticKeys.lists(), page, size, searchTerm, category, groupId] as const,
    details: () => [...antibioticKeys.all, "detail"] as const,
    detail: (id: string) => [...antibioticKeys.details(), id] as const,
    groups: () => ["antibiotic-groups"] as const,
};

export function useAntibiotics(page: number, size: number, searchTerm: string, classification: string, groupId: string) {
    return useQuery({
        queryKey: antibioticKeys.list(page, size, searchTerm, classification, groupId),
        queryFn: () => {
            const cleanSearch = searchTerm.trim();
            if (cleanSearch.length >= 2) {
                return searchAntibiotics(cleanSearch, page, size, classification, groupId);
            }
            return getAntibiotics(page, size, classification, groupId);
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useAntibioticGroups() {
    return useQuery({
        queryKey: antibioticKeys.groups(),
        queryFn: getAntibioticGroups,
        staleTime: 1000 * 60 * 60,
    });
}

export function useAntibioticMutations() {
    const queryClient = useQueryClient();

    const invalidateList = () => queryClient.invalidateQueries({ queryKey: antibioticKeys.lists() });

    const createMutation = useMutation({
        mutationFn: createAntibiotic,
        onSuccess: invalidateList,
    });

    const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAntibioticRequest }) => updateAntibiotic(id, data),
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: antibioticKeys.lists() });
        queryClient.invalidateQueries({ queryKey: antibioticKeys.detail(variables.id) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAntibiotic,
        onSuccess: invalidateList,
    });

    return { createMutation, updateMutation, deleteMutation };
}

export function useAntibioticDetail(id: string | null) {
    return useQuery({
        queryKey: antibioticKeys.detail(id!),
        queryFn: () => getAntibioticDetail(id!),
        enabled: !!id,
    });
}

export function useDosageMutations(antibioticId: string) {
    const queryClient = useQueryClient();

    const invalidateDetail = () => {
        queryClient.invalidateQueries({ queryKey: antibioticKeys.detail(antibioticId) });
    };

    const createDosageMutation = useMutation({
        mutationFn: (data: DosageRequest) => createDosage(antibioticId, data),
        onSuccess: invalidateDetail,
    });

    const updateDosageMutation = useMutation({
        mutationFn: ({ dosageId, data }: { dosageId: string; data: DosageRequest }) =>
            updateDosage(antibioticId, dosageId, data),
        onSuccess: invalidateDetail,
    });

    const deleteDosageMutation = useMutation({
        mutationFn: (dosageId: string) => deleteDosage(antibioticId, dosageId),
        onSuccess: invalidateDetail,
    });

    return { createDosageMutation, updateDosageMutation, deleteDosageMutation };
}