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
	const t = useTranslations("doctor.patients");
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
					toast.success(t("toast.createSuccess"));
				},
				onError: (error) => toast.error(t("toast.createError", { error: error.message })),
			});
		} else if (modalMode === "update" && selectedItem) {
			updateMutation.mutate(
				{ id: selectedItem.id, data: data as UpdatePatientRequest },
				{
					onSuccess: () => {
						closeModal();
						toast.success(t("toast.updateSuccess"));
					},
					onError: (error) => toast.error(t("toast.updateError", { error: error.message })),
				}
			);
		}
	};

	const handleDelete = () => {
		if (itemToDelete) {
			const deletedName = itemToDelete.fullName;
			deleteMutation.mutate(itemToDelete.id, {
				onSuccess: () => {
					setItemToDelete(null);
					toast.success(t("toast.deleteSuccess", { name: deletedName }));
				},
				onError: (error) => toast.error(t("toast.deleteError", { error: error.message })),
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
						toast.success(t("toast.dischargeSuccess"));
					},
					onError: (error) =>
						toast.error(t("toast.dischargeError", { error: error.message })),
				}
			);
		}
	};

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">
						{t("title")}
					</h2>
					<p className="text-muted-foreground mt-1">{t("description")}</p>
				</div>
				{!readOnly && (
					<Button
						onClick={openCreate}
						className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
					>
						<Plus className="mr-2 h-4 w-4" /> {t("addButton")}
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
										? t("dialog.createTitle")
										: t("dialog.updateTitle")}
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
									{t("dialog.deleteTitle")}
								</AlertDialogTitle>
								<AlertDialogDescription className="text-muted-foreground">
									{t.rich("dialog.deleteDescription", {
										name: itemToDelete?.fullName ?? "",
										bold: (chunks) => (
											<span className="font-bold text-foreground">
												{chunks}
											</span>
										),
									})}
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
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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