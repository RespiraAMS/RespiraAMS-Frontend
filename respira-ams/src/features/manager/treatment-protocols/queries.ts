import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getTreatmentProtocolsList, 
    createTreatmentProtocol, 
    updateTreatmentProtocol, 
    deleteTreatmentProtocol,
    getPathogensList,
    getCriteriaList,
    getAntibioticsList
} from "./api";
import { FilterTreatmentProtocolsRequest, TreatmentProtocolRequest } from "./types";

export const treatmentProtocolKeys = {
    all: ["treatment-protocols"] as const,
    lists: () => [...treatmentProtocolKeys.all, "list"] as const,
    list: (filters: FilterTreatmentProtocolsRequest) => [...treatmentProtocolKeys.lists(), filters] as const,
    dropdowns: () => [...treatmentProtocolKeys.all, "dropdowns"] as const,
    pathogens: () => [...treatmentProtocolKeys.dropdowns(), "pathogens"] as const,
    criteria: () => [...treatmentProtocolKeys.dropdowns(), "criteria"] as const,
    antibiotics: () => [...treatmentProtocolKeys.dropdowns(), "antibiotics"] as const,
};

export function useTreatmentProtocolsList(filters: FilterTreatmentProtocolsRequest) {
    return useQuery({
        queryKey: treatmentProtocolKeys.list(filters),
        queryFn: () => getTreatmentProtocolsList(filters),
    });
}

export function useDropdownData() {
    const pathogensQuery = useQuery({ queryKey: treatmentProtocolKeys.pathogens(), queryFn: getPathogensList });
    const criteriaQuery = useQuery({ queryKey: treatmentProtocolKeys.criteria(), queryFn: getCriteriaList });
    const antibioticsQuery = useQuery({ queryKey: treatmentProtocolKeys.antibiotics(), queryFn: getAntibioticsList });

    return {
        pathogens: pathogensQuery.data?.pathogens || [],
        criteria: criteriaQuery.data?.criteria || [],
        antibiotics: antibioticsQuery.data?.antibiotics || [],
        isLoading: pathogensQuery.isLoading || criteriaQuery.isLoading || antibioticsQuery.isLoading,
    };
}

export function useTreatmentProtocolMutations() {
    const queryClient = useQueryClient();

    const invalidateList = () => queryClient.invalidateQueries({ queryKey: treatmentProtocolKeys.lists() });

    const createMutation = useMutation({
        mutationFn: createTreatmentProtocol,
        onSuccess: invalidateList,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: TreatmentProtocolRequest }) => updateTreatmentProtocol(id, data),
        onSuccess: invalidateList,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTreatmentProtocol,
        onSuccess: invalidateList,
    });

    return { createMutation, updateMutation, deleteMutation };
}