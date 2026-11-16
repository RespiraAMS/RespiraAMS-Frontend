// src/features/manager/clinical-variables/queries.ts

import { useQuery, keepPreviousData, useQueryClient, useMutation } from "@tanstack/react-query";
import { getClinicalVariables, getClinicalVariableDetail, createClinicalVariable, updateClinicalVariable, deleteClinicalVariable, getClinicalVariablesList } from "./api";
import { UpdateClinicalVariableRequest, VariableCategory, VariableValueType } from "./types";

export const variableKeys = {
    all: ["clinicalVariables"] as const,
    lists: () => [...variableKeys.all, "list"] as const,
    list: (page: number, size: number, search?: string, req?: boolean | null, type?: string, cat?: string) => 
        [...variableKeys.lists(), page, size, search, req, type, cat] as const,
    details: () => [...variableKeys.all, "detail"] as const,
    detail: (id: string) => [...variableKeys.details(), id] as const,
    dropdown: () => [...variableKeys.all, "dropdown"] as const,
};

export function useClinicalVariables(
    page: number, 
    pageSize: number, 
    search?: string, 
    isRequired?: boolean | null, 
    valueType?: VariableValueType | "", 
    category?: VariableCategory | ""
) {
    return useQuery({
        queryKey: variableKeys.list(page, pageSize, search, isRequired, valueType, category),
        queryFn: () => getClinicalVariables(page, pageSize, search, isRequired, valueType, category),
        placeholderData: keepPreviousData,
    });
}

export function useClinicalVariableDetail(id: string) {
    return useQuery({
        queryKey: variableKeys.detail(id),
        queryFn: () => getClinicalVariableDetail(id),
        enabled: !!id,
    });
}

export function useClinicalVariableMutations() {
    const queryClient = useQueryClient();

    const invalidateLists = () => {
        queryClient.invalidateQueries({ queryKey: variableKeys.lists() });
    };

    const invalidateDetail = (id: string) => {
        queryClient.invalidateQueries({ queryKey: variableKeys.detail(id) });
    };

    const createMutation = useMutation({
        mutationFn: createClinicalVariable,
        onSuccess: invalidateLists,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateClinicalVariableRequest }) => updateClinicalVariable(id, data),
        onSuccess: (_, variables) => {
            invalidateLists();
            invalidateDetail(variables.id);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteClinicalVariable,
        onSuccess: invalidateLists,
    });

    return { createMutation, updateMutation, deleteMutation };
}

export function useClinicalVariablesDropdown() {
    return useQuery({
        queryKey: variableKeys.dropdown(),
        queryFn: getClinicalVariablesList,
        staleTime: 5 * 60 * 1000,
    });
}