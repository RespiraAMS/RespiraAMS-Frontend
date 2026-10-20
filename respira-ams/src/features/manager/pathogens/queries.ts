
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getPathogens, createPathogen, updatePathogen, deletePathogen } from "./api";
import { UpdatePathogenRequest } from "./types";

export const pathogenKeys = {
    all: ["pathogens"] as const,
    lists: () => [...pathogenKeys.all, "list"] as const,
    list: (page: number, size: number, search?: string, isAtypical?: boolean | null) => 
        [...pathogenKeys.lists(), page, size, search, isAtypical] as const,
};

export function usePathogens(page: number, pageSize: number, search?: string, isAtypical?: boolean | null) {
    return useQuery({
        queryKey: pathogenKeys.list(page, pageSize, search, isAtypical),
        queryFn: () => getPathogens(page, pageSize, search, isAtypical),
        placeholderData: keepPreviousData, 
    });
}

export function usePathogenMutations() {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: pathogenKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: createPathogen,
        onSuccess: invalidateAll,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePathogenRequest }) => updatePathogen(id, data),
        onSuccess: invalidateAll,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePathogen,
        onSuccess: invalidateAll,
    });

    return { createMutation, updateMutation, deleteMutation };
}