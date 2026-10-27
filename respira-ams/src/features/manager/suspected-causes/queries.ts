import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { 
    getSuspectedCauses, 
    createSuspectedCause, 
    updateSuspectedCause, 
    deleteSuspectedCause,
    getPathogensList
} from "./api";
import { UpdateSuspectedCauseRequest, Severity, TreatmentSite } from "./types";

export const suspectedCauseKeys = {
    all: ["suspectedCauses"] as const,
    lists: () => [...suspectedCauseKeys.all, "list"] as const,
    list: (page: number, size: number, pathogenId?: string, severity?: string, site?: string) => 
        [...suspectedCauseKeys.lists(), page, size, pathogenId, severity, site] as const,
    pathogens: () => ["pathogens", "list", "dropdown"] as const,
};

export function useSuspectedCauses(page: number, pageSize: number, pathogenId?: string, severity?: Severity | "", site?: TreatmentSite | "") {
    return useQuery({
        queryKey: suspectedCauseKeys.list(page, pageSize, pathogenId, severity, site),
        queryFn: () => getSuspectedCauses(page, pageSize, pathogenId, severity, site),
        placeholderData: keepPreviousData,
    });
}

export function usePathogensDropdown() {
    return useQuery({
        queryKey: suspectedCauseKeys.pathogens(),
        queryFn: getPathogensList,
        staleTime: 5 * 60 * 1000,
    });
}

export function useSuspectedCauseMutations() {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: suspectedCauseKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: createSuspectedCause,
        onSuccess: invalidateAll,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSuspectedCauseRequest }) => updateSuspectedCause(id, data),
        onSuccess: invalidateAll,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSuspectedCause,
        onSuccess: invalidateAll,
    });

    return { createMutation, updateMutation, deleteMutation };
}