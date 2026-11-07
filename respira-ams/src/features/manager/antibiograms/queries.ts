import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getAntibiogramsList, 
    createAntibiogram, 
    updateAntibiogram, 
    deleteAntibiogram,
    getAntibioticsList,
    getPathogensList
} from "./api";
import { CreateAntibiogramRequest, UpdateAntibiogramRequest } from "./types";

export const antibiogramKeys = {
    all: ["antibiograms"] as const,
    lists: () => [...antibiogramKeys.all, "list"] as const,
    list: (page: number, pageSize: number) => [...antibiogramKeys.lists(), { page, pageSize }] as const,
    dropdowns: () => [...antibiogramKeys.all, "dropdowns"] as const,
    antibiotics: () => [...antibiogramKeys.dropdowns(), "antibiotics"] as const,
    pathogens: () => [...antibiogramKeys.dropdowns(), "pathogens"] as const,
};

export function useAntibiogramsList(page: number, pageSize: number) {
    return useQuery({
        queryKey: antibiogramKeys.list(page, pageSize),
        queryFn: () => getAntibiogramsList(page, pageSize),
    });
}

export function useAntibioticsDropdown() {
    return useQuery({
        queryKey: antibiogramKeys.antibiotics(),
        queryFn: getAntibioticsList,
    });
}

export function usePathogensDropdown() {
    return useQuery({
        queryKey: antibiogramKeys.pathogens(),
        queryFn: getPathogensList,
    });
}

export function useAntibiogramMutations() {
    const queryClient = useQueryClient();

    const invalidateList = () => {
        queryClient.invalidateQueries({ queryKey: antibiogramKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: createAntibiogram,
        onSuccess: invalidateList,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAntibiogramRequest }) => updateAntibiogram(id, data),
        onSuccess: invalidateList,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAntibiogram,
        onSuccess: invalidateList,
    });

    return { createMutation, updateMutation, deleteMutation };
}