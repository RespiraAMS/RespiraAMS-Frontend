"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PatientForm } from "@/features/doctor/patients/components/PatientForm";
import type {
    CreatePatientRequest,
    PatientDetail,
    UpdatePatientRequest,
} from "@/features/doctor/patients/types";
import { usePatientMutations } from "../../patients/queries";

interface CreatePatientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (patient: PatientDetail) => void;
}

export function CreatePatientModal({
    open,
    onOpenChange,
    onCreated,
}: CreatePatientModalProps) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { createMutation } = usePatientMutations();

    const handleSubmit = async (raw: CreatePatientRequest | UpdatePatientRequest) => {
        const data = raw as CreatePatientRequest;
        setSubmitError(null);
        try {
            const response = await createMutation.mutateAsync(data);
            const createdId =
                typeof response === "string"
                    ? response
                    : (response as { id?: string })?.id || "";

            const patientDetail: PatientDetail = {
                ...(typeof response === "object" && response !== null ? response : {}),
                id: createdId,
                fullName: `${data.lastName} ${data.firstName}`.trim(),
                phoneNumber: data.phoneNumber,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                height: data.height,
                weight: data.weight,
                medicalRecordCode: data.medicalRecordCode,
                healthInsuranceCard: data.healthInsuranceCard,
                address: data.address,
                city: data.city,
            } as PatientDetail;

            onCreated(patientDetail);
            onOpenChange(false);
        } catch (err) {
            setSubmitError(
                err instanceof Error ? err.message : "Không thể tạo hồ sơ bệnh nhân mới."
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Thêm hồ sơ bệnh nhân mới</DialogTitle>
                    <DialogDescription>
                        Tạo hồ sơ bệnh nhân mới để gắn vào phiên chẩn đoán và lưu phác đồ điều trị.
                    </DialogDescription>
                </DialogHeader>

                {submitError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                        {submitError}
                    </div>
                )}

                <PatientForm
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                    isPending={createMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
}