import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAntibiotics,
    searchAntibiotics,
    getAntibioticGroups,
    createAntibiotic,
    updateAntibiotic,
    deleteAntibiotic
} from "./api";
import { CreateAntibioticRequest, UpdateAntibioticRequest } from "./types";

export const antibioticKeys = {
    all: ["antibiotics"] as const,
    lists: () => [...antibioticKeys.all, "list"] as const,
    list: (page: number, size: number, searchTerm: string, classification: string, groupId: string) => 
        [...antibioticKeys.lists(), page, size, searchTerm, classification, groupId] as const,
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
        onSuccess: invalidateList,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAntibiotic,
        onSuccess: invalidateList,
    });

    return { createMutation, updateMutation, deleteMutation };
}