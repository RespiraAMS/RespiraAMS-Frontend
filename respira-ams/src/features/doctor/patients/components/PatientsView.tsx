"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PatientsTable } from "./PatientsTable";
import { PatientForm } from "./PatientForm";
import { DischargePatientDialog } from "./DischargePatientDialog";
import { usePatientDetail, usePatientMutations } from "../queries";
import {
    type PatientItem,
    type CreatePatientRequest,
    type UpdatePatientRequest,
    type TreatmentOutcome,
} from "../types";
import { TableSearchInput } from "@/features/manager/components/TableSearchInput";

interface PatientsViewProps {
    readOnly?: boolean;
}

export function PatientsView({ readOnly = false }: PatientsViewProps) {
    const tCommon = useTranslations("common");
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
    const [selectedItem, setSelectedItem] = useState<PatientItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<PatientItem | null>(null);
    const [itemToDischarge, setItemToDischarge] = useState<PatientItem | null>(null);

    const { createMutation, updateMutation, deleteMutation, dischargeMutation } =
        usePatientMutations();

    const { data: detailData, isFetching: isFetchingDetail } = usePatientDetail(
        selectedItem?.id ?? "",
        { enabled: modalMode === "update" && !!selectedItem?.id }
    );

    const openDetail = (id: string) => {
        router.push(`patients/${id}`);
    };

    const openCreate = () => {
        setSelectedItem(null);
        setModalMode("create");
    };

    const openUpdate = (item: PatientItem) => {
        setSelectedItem(item);
        setModalMode("update");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedItem(null);
    };

    const handleFormSubmit = (data: CreatePatientRequest | UpdatePatientRequest) => {
        if (modalMode === "create") {
            createMutation.mutate(data as CreatePatientRequest, {
                onSuccess: () => {
                    closeModal();
                    toast.success("Thêm bệnh nhân thành công!");
                },
                onError: (error) => toast.error("Lỗi thêm mới: " + error.message),
            });
        } else if (modalMode === "update" && selectedItem) {
            updateMutation.mutate(
                { id: selectedItem.id, data: data as UpdatePatientRequest },
                {
                    onSuccess: () => {
                        closeModal();
                        toast.success("Cập nhật thông tin bệnh nhân thành công!");
                    },
                    onError: (error) => toast.error("Lỗi cập nhật: " + error.message),
                }
            );
        }
    };

    const handleDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id, {
                onSuccess: () => {
                    setItemToDelete(null);
                    toast.success(`Đã xóa bệnh nhân "${itemToDelete.fullName}" thành công!`);
                },
                onError: (error) => toast.error("Không thể xóa: " + error.message),
            });
        }
    };

    const handleDischargeConfirm = (outcome: TreatmentOutcome) => {
        if (itemToDischarge) {
            dischargeMutation.mutate(
                { id: itemToDischarge.id, outcome },
                {
                    onSuccess: () => {
                        setItemToDischarge(null);
                        toast.success("Cập nhật trạng thái xuất viện thành công!");
                    },
                    onError: (error) => toast.error("Lỗi cập nhật xuất viện: " + error.message),
                }
            );
        }
    };

    return (
        <div className="space-y-6 text-foreground bg-background">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Quản lý Bệnh nhân
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Danh sách hồ sơ bệnh nhân, theo dõi điều trị và xuất viện
                    </p>
                </div>
                {!readOnly && (
                    <Button
                        onClick={openCreate}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm bệnh nhân
                    </Button>
                )}
            </div>

            {/* Search Input */}
            <TableSearchInput onSearchChange={setSearchTerm} />

            {/* Table Card */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
                <PatientsTable
                    readOnly={readOnly}
                    searchTerm={searchTerm}
                    onViewDetail={openDetail}
                    onEdit={readOnly ? undefined : openUpdate}
                    onDelete={readOnly ? undefined : setItemToDelete}
                    onDischarge={readOnly ? undefined : setItemToDischarge}
                />
            </div>

            {!readOnly && (
                <>
                    {/* Create / Update Modal */}
                    <Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
                        <DialogContent className="sm:max-w-xl border-border bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl text-foreground">
                                    {modalMode === "create"
                                        ? "Thêm Hồ Sơ Bệnh Nhân"
                                        : "Cập Nhật Hồ Sơ Bệnh Nhân"}
                                </DialogTitle>
                            </DialogHeader>
                            {modalMode === "update" && isFetchingDetail ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                modalMode && (
                                    <PatientForm
                                        initialData={modalMode === "update" ? detailData : null}
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeModal}
                                        isPending={
                                            createMutation.isPending || updateMutation.isPending
                                        }
                                    />
                                )
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Discharge Modal */}
                    <DischargePatientDialog
                        open={!!itemToDischarge}
                        onOpenChange={(open) => !open && setItemToDischarge(null)}
                        patientName={itemToDischarge?.fullName ?? ""}
                        currentOutcome={itemToDischarge?.treatmentOutcome}
                        onConfirm={handleDischargeConfirm}
                        isPending={dischargeMutation.isPending}
                    />

                    {/* Delete Confirmation Alert */}
                    <AlertDialog
                        open={!!itemToDelete}
                        onOpenChange={(open) => !open && setItemToDelete(null)}
                    >
                        <AlertDialogContent className="border-border bg-popover text-popover-foreground shadow-lg">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive font-semibold">
                                    Xác nhận xóa bệnh nhân
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân{" "}
                                    <span className="font-bold text-foreground">
                                        &quot;{itemToDelete?.fullName}&quot;
                                    </span>{" "}
                                    không? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setItemToDelete(null)}
                                    className="border-border text-foreground hover:bg-accent"
                                >
                                    {tCommon("cancel")}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {tCommon("delete")}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );
}