"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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

import { RiskFactorsTable } from "./RiskFactorsTable";
import { RiskFactorForm } from "./RiskFactorForm";
import { useRiskFactorMutations } from "../queries";
import { type RiskFactorItem, type CreateRiskFactorRequest, type UpdateRiskFactorRequest } from "../types";

export function RiskFactorsView() {
	const t = useTranslations("manager.riskFactors");
	const tCommon = useTranslations("common");

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selectedItem, setSelectedItem] = useState<RiskFactorItem | null>(null);
	const [itemToDelete, setItemToDelete] = useState<RiskFactorItem | null>(null);

	const { createMutation, updateMutation, deleteMutation } = useRiskFactorMutations();

	const openCreate = () => {
		setSelectedItem(null);
		setModalMode("create");
	};

	const openUpdate = (item: RiskFactorItem) => {
		setSelectedItem(item);
		setModalMode("update");
	};

	const closeModal = () => {
		setModalMode(null);
		setSelectedItem(null);
	};

	const handleFormSubmit = (data: CreateRiskFactorRequest | UpdateRiskFactorRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreateRiskFactorRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (error) => toast.error(t("toast.createError", { error: error.message })),
			});
		} else if (modalMode === "update" && selectedItem) {
			updateMutation.mutate(
				{ id: selectedItem.id, data: data as UpdateRiskFactorRequest },
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
			deleteMutation.mutate(itemToDelete.id, {
				onSuccess: () => {
					setItemToDelete(null);
					toast.success(t("toast.deleteSuccess"));
				},
				onError: (error) => toast.error(t("toast.deleteError", { error: error.message })),
			});
		}
	};

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
					<p className="text-muted-foreground mt-1">{t("description")}</p>
				</div>
				<Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
					<Plus className="mr-2 h-4 w-4" /> {t("addButton")}
				</Button>
			</div>

			{/* Table Card */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
				<RiskFactorsTable onEdit={openUpdate} onDelete={setItemToDelete} />
			</div>

			{/* Form Dialog */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-foreground">
							{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
						</DialogTitle>
					</DialogHeader>
					{modalMode && (
						<RiskFactorForm
							initialData={selectedItem}
							onSubmit={handleFormSubmit}
							onCancel={closeModal}
							isPending={createMutation.isPending || updateMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Alert */}
			<AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">
							{t("dialog.deleteTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{t.rich("dialog.deleteDescription", {
								pathogen: itemToDelete?.pathogen.name || "",
								criterion: itemToDelete?.criterion.name || "",
								b: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
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
							{deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}{" "}
							{tCommon("delete")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}