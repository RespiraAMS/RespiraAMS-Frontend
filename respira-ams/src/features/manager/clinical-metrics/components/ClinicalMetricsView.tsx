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

import { ClinicalMetricsTable } from "./ClinicalMetricsTable";
import { ClinicalMetricForm } from "./ClinicalMetricForm";
import { useClinicalMetricMutations } from "../queries";
import {
	type ClinicalMetricItem,
	type CreateClinicalMetricRequest,
	type UpdateClinicalMetricRequest,
} from "../types";

export function ClinicalMetricsView() {
	const t = useTranslations("manager.clinicalMetrics");
	const tCommon = useTranslations("common");
	const router = useRouter();

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selectedItem, setSelectedItem] = useState<ClinicalMetricItem | null>(null);
	const [itemToDelete, setItemToDelete] = useState<ClinicalMetricItem | null>(null);

	const { createMutation, updateMutation, deleteMutation } = useClinicalMetricMutations();

	const openDetail = (id: string) => {
		router.push(`/manage/clinical-metrics/${id}`);
	};

	const openCreate = () => {
		setSelectedItem(null);
		setModalMode("create");
	};

	const openUpdate = (item: ClinicalMetricItem) => {
		setSelectedItem(item);
		setModalMode("update");
	};

	const closeModal = () => {
		setModalMode(null);
		setSelectedItem(null);
	};

	const handleFormSubmit = (data: CreateClinicalMetricRequest | UpdateClinicalMetricRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreateClinicalMetricRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (error) => toast.error(t("toast.createError", { error: error.message })),
			});
		} else if (modalMode === "update" && selectedItem) {
			updateMutation.mutate(
				{ id: selectedItem.id, data: data as UpdateClinicalMetricRequest },
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
					const deletedName = itemToDelete.name;
					setItemToDelete(null);
					toast.success(t("toast.deleteSuccess", { name: deletedName }));
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
				<ClinicalMetricsTable onViewDetail={openDetail} onEdit={openUpdate} onDelete={setItemToDelete} />
			</div>

			{/* Create/Update Modal */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="sm:max-w-xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-foreground">
							{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
						</DialogTitle>
					</DialogHeader>
					{modalMode && (
						<ClinicalMetricForm
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
								name: itemToDelete?.name || "",
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
							{deleteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}{" "}
							{tCommon("delete")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}