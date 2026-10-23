"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ClinicalVariablesTable } from "./ClinicalVariablesTable";
import { ClinicalVariableForm } from "./ClinicalVariableForm";
import { useSearchStore } from "@/features/manager/stores/searchStore";
import { useClinicalVariableMutations } from "../queries";
import { type ClinicalVariableItem, type CreateClinicalVariableRequest } from "../types";

export function ClinicalVariablesView() {
	const t = useTranslations("manager.clinicalVariables");
	const tCommon = useTranslations("common");
	const router = useRouter();

	const clearSearch = useSearchStore((s) => s.clear);
	const { createMutation, deleteMutation } = useClinicalVariableMutations();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ClinicalVariableItem | null>(null);

	useEffect(() => {
		clearSearch();
	}, [clearSearch]);

	const openDetail = (id: string) => {
		router.push(`/manage/clinical-variables/${id}`);
	};

	const handleCreateSubmit = (data: CreateClinicalVariableRequest) => {
		createMutation.mutate(data, {
			onSuccess: () => {
				setIsCreateOpen(false);
				toast.success(t("toast.createSuccess"));
			},
			onError: () => toast.error(t("toast.createError")),
		});
	};

	const openDelete = (item: ClinicalVariableItem) => {
		setSelectedItem(item);
		setIsDeleteDialogOpen(true);
	};

	const handleDelete = () => {
		if (!selectedItem) return;

		deleteMutation.mutate(selectedItem.id, {
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				setSelectedItem(null);
				toast.success(t("toast.deleteSuccess"));
			},
			onError: () => {
				toast.error(t("toast.deleteError"));
			},
		});
	};

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<Button
					onClick={() => setIsCreateOpen(true)}
					className="bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<Plus className="mr-2 h-4 w-4" />
					{t("addButton")}
				</Button>
			</div>

			{/* Table Card */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
				<ClinicalVariablesTable onViewDetail={openDetail} onDelete={openDelete} />
			</div>

			{/* Create Modal */}
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="w-[95vw] sm:max-w-6xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">{t("dialog.createTitle")}</DialogTitle>
					</DialogHeader>
					{isCreateOpen && (
						<ClinicalVariableForm
							onSubmit={handleCreateSubmit}
							onCancel={() => setIsCreateOpen(false)}
							isPending={createMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Alert */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground shadow-lg">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">{t("alert.deleteTitle")}</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{t("alert.deleteConfirmMsg", { name: selectedItem?.name ?? "" })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
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