"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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

import { SuspectedCausesTable } from "./SuspectedCausesTable";
import { SuspectedCauseForm } from "./SuspectedCauseForm";
import { useSuspectedCauseMutations } from "../queries";
import {
	type SuspectedCauseItem,
	type CreateSuspectedCauseRequest,
	type UpdateSuspectedCauseRequest,
} from "../types";

export function SuspectedCausesView() {
	const t = useTranslations("manager.suspectedCauses");
	const tCommon = useTranslations("common");

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selected, setSelected] = useState<SuspectedCauseItem | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { createMutation, updateMutation, deleteMutation } = useSuspectedCauseMutations();

	const openCreate = () => {
		setSelected(null);
		setModalMode("create");
	};

	const openUpdate = (item: SuspectedCauseItem) => {
		setSelected(item);
		setModalMode("update");
	};

	const openDelete = (item: SuspectedCauseItem) => {
		setSelected(item);
		setIsDeleteOpen(true);
	};

	const closeModal = () => {
		setModalMode(null);
		setSelected(null);
	};

	const handleFormSubmit = (data: CreateSuspectedCauseRequest | UpdateSuspectedCauseRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreateSuspectedCauseRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (error) => toast.error(t("toast.createError: " + error.message)),
			});
		} else if (modalMode === "update" && selected) {
			updateMutation.mutate(
				{ id: selected.id, data: data as UpdateSuspectedCauseRequest },
				{
					onSuccess: () => {
						closeModal();
						toast.success(t("toast.updateSuccess"));
					},
					onError: (error) => toast.error(t("toast.updateError: " + error.message)),
				}
			);
		}
	};

	const handleDelete = () => {
		if (selected) {
			deleteMutation.mutate(selected.id, {
				onSuccess: () => {
					setIsDeleteOpen(false);
					toast.success(t("toast.deleteSuccess"));
				},
				onError: (error) => toast.error(t("toast.deleteError: " + error.message)),
			});
		}
	};

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
					<Plus className="mr-2 h-4 w-4" />
					{t("addButton")}
				</Button>
			</div>

			{/* Table Card */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
				<SuspectedCausesTable onEdit={openUpdate} onDelete={openDelete} />
			</div>

			{/* Form Dialog */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="sm:max-w-[500px] border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">
							{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
						</DialogTitle>
					</DialogHeader>
					{modalMode && (
						<SuspectedCauseForm
							initialData={selected}
							onSubmit={handleFormSubmit}
							onCancel={closeModal}
							isPending={createMutation.isPending || updateMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Alert */}
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground shadow-lg">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">{t("alert.deleteTitle")}</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{t("alert.deleteConfirmMsg", { name: selected?.pathogenName ?? "" })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteOpen(false)}
							className="border-border text-foreground hover:bg-accent"
						>
							{tCommon("cancel")}
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
							{deleteMutation.isPending ? t("alert.deleting") : tCommon("delete")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}