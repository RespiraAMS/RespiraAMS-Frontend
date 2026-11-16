import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientKeys } from "@/features/doctor/patients/queries";
import { confirmTreatment } from "./api";
import type { ConfirmTreatmentRequest } from "./types";

export function useConfirmTreatmentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ConfirmTreatmentRequest) => confirmTreatment(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: patientKeys.detail(variables.patientId),
            });
        },
    });
}