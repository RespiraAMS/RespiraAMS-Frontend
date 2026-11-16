import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getPatientsList,
    getPatientDetail,
    createPatient,
    updatePatient,
    deletePatient,
    dischargePatient,
    addNextOfKin,
    updateNextOfKin,
    deleteNextOfKin,
    getTreatmentPlanDetail,
    closeTreatmentPlan,
    reviewTreatmentPlan,
} from "./api";
import {
    type PatientFilters,
    type CreatePatientRequest,
    type UpdatePatientRequest,
    type TreatmentOutcome,
    type NextOfKinRequest,
    type CloseTreatmentPlanRequest,
    type ReviewTreatmentPlanRequest,
} from "./types";

export const patientKeys = {
    all: ["patients"] as const,
    lists: () => [...patientKeys.all, "list"] as const,
    list: (page: number, pageSize: number, searchTerm?: string, filters?: PatientFilters) =>
        [...patientKeys.lists(), { page, pageSize, searchTerm, filters }] as const,
    details: () => [...patientKeys.all, "detail"] as const,
    detail: (id: string) => [...patientKeys.details(), id] as const,
};

export const treatmentPlanKeys = {
    all: ["treatment-plans"] as const,
    details: () => [...treatmentPlanKeys.all, "detail"] as const,
    detail: (id: string) => [...treatmentPlanKeys.details(), id] as const,
};

export function usePatientsList(
    page: number,
    pageSize: number,
    searchTerm?: string,
    filters?: PatientFilters
) {
    return useQuery({
        queryKey: patientKeys.list(page, pageSize, searchTerm, filters),
        queryFn: () => getPatientsList(page, pageSize, searchTerm, filters),
    });
}

export function usePatientDetail(id: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: patientKeys.detail(id),
        queryFn: () => getPatientDetail(id),
        enabled: options?.enabled ?? !!id,
    });
}

export function useTreatmentPlanDetail(id: string | null) {
    return useQuery({
        queryKey: treatmentPlanKeys.detail(id ?? ""),
        queryFn: () => getTreatmentPlanDetail(id!),
        enabled: !!id,
    });
}

export function usePatientMutations() {
    const queryClient = useQueryClient();

    const invalidateList = () => {
        queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: (data: CreatePatientRequest) => createPatient(data),
        onSuccess: invalidateList,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePatientRequest }) =>
            updatePatient(id, data),
        onSuccess: (_, { id }) => {
            invalidateList();
            queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePatient(id),
        onSuccess: invalidateList,
    });

    const dischargeMutation = useMutation({
        mutationFn: ({ id, outcome }: { id: string; outcome: TreatmentOutcome }) =>
            dischargePatient(id, outcome),
        onSuccess: (_, { id }) => {
            invalidateList();
            queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
        dischargeMutation,
    };
}

export function useNextOfKinMutations(patientId: string) {
    const queryClient = useQueryClient();

    const invalidatePatient = () => {
        queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    };

    const addKinMutation = useMutation({
        mutationFn: (data: NextOfKinRequest) => addNextOfKin(patientId, data),
        onSuccess: invalidatePatient,
    });

    const updateKinMutation = useMutation({
        mutationFn: ({ nextOfKinId, data }: { nextOfKinId: string; data: NextOfKinRequest }) =>
            updateNextOfKin(nextOfKinId, data),
        onSuccess: invalidatePatient,
    });

    const deleteKinMutation = useMutation({
        mutationFn: (nextOfKinId: string) => deleteNextOfKin(nextOfKinId),
        onSuccess: invalidatePatient,
    });

    return {
        addKinMutation,
        updateKinMutation,
        deleteKinMutation,
    };
}

export function useTreatmentPlanMutations(patientId: string) {
    const queryClient = useQueryClient();

    const closePlanMutation = useMutation({
        mutationFn: ({ planId, data }: { planId: string; data: CloseTreatmentPlanRequest }) =>
            closeTreatmentPlan(planId, data),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
            queryClient.invalidateQueries({ queryKey: treatmentPlanKeys.detail(planId) });
        },
    });

    const reviewPlanMutation = useMutation({
        mutationFn: ({ planId, data }: { planId: string; data: ReviewTreatmentPlanRequest }) =>
            reviewTreatmentPlan(planId, data),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
            queryClient.invalidateQueries({ queryKey: treatmentPlanKeys.detail(planId) });
        },
    });

    return {
        closePlanMutation,
        reviewPlanMutation,
    };
}