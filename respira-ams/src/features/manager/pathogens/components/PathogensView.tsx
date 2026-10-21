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

import { PathogensTable } from "./PathogensTable";
import { PathogenForm } from "./PathogenForm";
import { usePathogenMutations } from "../queries";
import { type PathogenItem, type CreatePathogenRequest, type UpdatePathogenRequest } from "../types";

export function PathogensView() {
	const t = useTranslations("manager.pathogens");
	const tCommon = useTranslations("common");

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selected, setSelected] = useState<PathogenItem | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { createMutation, updateMutation, deleteMutation } = usePathogenMutations();

	const openCreate = () => {
		setSelected(null);
		setModalMode("create");
	};

	const openUpdate = (item: PathogenItem) => {
		setSelected(item);
		setModalMode("update");
	};

	const openDelete = (item: PathogenItem) => {
		setSelected(item);
		setIsDeleteOpen(true);
	};

	const closeModal = () => {
		setModalMode(null);
		setSelected(null);
	};

	const handleFormSubmit = (data: CreatePathogenRequest | UpdatePathogenRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreatePathogenRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (error) => toast.error(t("toast.createError") + " " + error.message),
			});
		} else if (modalMode === "update" && selected) {
			updateMutation.mutate(
				{ id: selected.id, data: data as UpdatePathogenRequest },
				{
					onSuccess: () => {
						closeModal();
						toast.success(t("toast.updateSuccess"));
					},
					onError: (error) => toast.error(t("toast.updateError") + " " + error.message),
				}
			);
		}
	};

	const handleDelete = () => {
		if (selected) {
			deleteMutation.mutate(selected.id, {
				onSuccess: () => {
					setIsDeleteOpen(false);
					toast.success(t("toast.deleteSuccess", { name: selected.name }));
				},
				onError: (error) => toast.error(t("toast.deleteError") + " " + error.message),
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

			{/* Table Container */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
				<PathogensTable onEdit={openUpdate} onDelete={openDelete} />
			</div>

			{/* Form Modal */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="sm:max-w-[500px] border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">
							{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
						</DialogTitle>
					</DialogHeader>
					{modalMode && (
						<PathogenForm
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
							{t("alert.deleteConfirmMsg", { name: selected?.name ?? "" })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-border text-foreground hover:bg-accent">
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