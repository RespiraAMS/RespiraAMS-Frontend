"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

import { TreatmentProtocolsTable } from "./TreatmentProtocolsTable";
import { TreatmentProtocolForm } from "./TreatmentProtocolForm";
import { useTreatmentProtocolMutations } from "../queries";
import { type TreatmentProtocolItem, type TreatmentProtocolRequest } from "../types";

interface TreatmentProtocolsViewProps {
	readOnly?: boolean;
}

export function TreatmentProtocolsView({ readOnly = false }: TreatmentProtocolsViewProps) {
	const t = useTranslations("manager.treatmentProtocols");
	const tCommon = useTranslations("common");

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selectedItem, setSelectedItem] = useState<TreatmentProtocolItem | null>(null);
	const [itemToDelete, setItemToDelete] = useState<TreatmentProtocolItem | null>(null);

	const { createMutation, updateMutation, deleteMutation } = useTreatmentProtocolMutations();

	const openCreate = () => {
		setSelectedItem(null);
		setModalMode("create");
	};

	const openUpdate = (item: TreatmentProtocolItem) => {
		setSelectedItem(item);
		setModalMode("update");
	};

	const closeModal = () => {
		setModalMode(null);
		setSelectedItem(null);
	};

	const handleFormSubmit = (data: TreatmentProtocolRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (err) => toast.error(t("toast.createError", { error: err.message })),
			});
		} else if (modalMode === "update" && selectedItem) {
			updateMutation.mutate(
				{ id: selectedItem.id, data },
				{
					onSuccess: () => {
						closeModal();
						toast.success(t("toast.updateSuccess"));
					},
					onError: (err) => toast.error(t("toast.updateError", { error: err.message })),
				}
			);
		}
	};

	const handleDelete = () => {
		if (itemToDelete) {
			deleteMutation.mutate(itemToDelete.id, {
				onSuccess: () => {
					setItemToDelete(null);
					toast.success(t("toast.deleteSuccess"));
				},
				onError: (err) => toast.error(t("toast.deleteError", { error: err.message })),
			});
		}
	};

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
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

			{/* Main Table Container */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
				<TreatmentProtocolsTable
					readOnly={readOnly}
					onEdit={readOnly ? undefined : openUpdate}
					onDelete={readOnly ? undefined : setItemToDelete}
				/>
			</div>

			{!readOnly && (
				<>
					{/* Form Modal */}
					<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
						<DialogContent className="sm:max-w-xl border-border bg-popover text-popover-foreground max-h-[95vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle className="text-xl text-foreground">
									{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
								</DialogTitle>
							</DialogHeader>
							{modalMode && (
								<TreatmentProtocolForm
									initialData={selectedItem}
									onSubmit={handleFormSubmit}
									onCancel={closeModal}
									isPending={createMutation.isPending || updateMutation.isPending}
								/>
							)}
						</DialogContent>
					</Dialog>

					{/* Delete Alert Dialog */}
					<AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
						<AlertDialogContent className="border-border bg-popover text-popover-foreground">
							<AlertDialogHeader>
								<AlertDialogTitle className="text-destructive font-semibold">
									{t("dialog.deleteTitle")}
								</AlertDialogTitle>
								<AlertDialogDescription className="text-muted-foreground">
									{t("dialog.deleteDescription")}
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
									{deleteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}{" "}
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