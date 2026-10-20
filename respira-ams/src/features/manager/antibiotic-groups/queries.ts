
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { 
    getAntibioticGroups, 
    getAntibioticGroupsList, 
    createAntibioticGroup, 
    updateAntibioticGroup, 
    deleteAntibioticGroup 
} from "./api";
import { UpdateAntibioticGroupRequest } from "./types";

export const groupKeys = {
    all: ["antibioticGroups"] as const,
    lists: () => [...groupKeys.all, "list"] as const,
    dropdown: () => [...groupKeys.all, "dropdown"] as const,
    list: (page: number, size: number, search?: string, parentId?: string) => 
        [...groupKeys.lists(), page, size, search, parentId] as const,
};

export function useAntibioticGroups(page: number, pageSize: number, search?: string, parentId?: string) {
    return useQuery({
        queryKey: groupKeys.list(page, pageSize, search, parentId),
        queryFn: () => getAntibioticGroups(page, pageSize, search, parentId),
        placeholderData: keepPreviousData,
    });
}

export function useAntibioticGroupsDropdown() {
    return useQuery({
        queryKey: groupKeys.dropdown(),
        queryFn: getAntibioticGroupsList,
        staleTime: 5 * 60 * 1000,
    });
}

export function useAntibioticGroupMutations() {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
        queryClient.invalidateQueries({ queryKey: groupKeys.dropdown() });
    };

    const createMutation = useMutation({
        mutationFn: createAntibioticGroup,
        onSuccess: invalidateAll,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAntibioticGroupRequest }) => 
            updateAntibioticGroup(id, data),
        onSuccess: invalidateAll,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAntibioticGroup,
        onSuccess: invalidateAll,
    });

    return { createMutation, updateMutation, deleteMutation };
}