"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { AntibioticsTable } from "./AntibioticsTable";
import { AntibioticForm } from "./AntibioticForm";
import { DeleteAntibioticSheet } from "./DeleteAntibioticSheet";
import { useAntibioticMutations } from "../queries";
import { type AntibioticItem, type CreateAntibioticRequest, type UpdateAntibioticRequest } from "../types";

export function AntibioticsView() {
	const t = useTranslations("manager.antibiotics");
	const router = useRouter();

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selected, setSelected] = useState<AntibioticItem | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { createMutation, updateMutation, deleteMutation } = useAntibioticMutations();

	const openCreate = () => {
		setSelected(null);
		setModalMode("create");
	};

	const openUpdate = (item: AntibioticItem) => {
		setSelected(item);
		setModalMode("update");
	};

	const openDetail = (id: string) => {
		router.push(`/manage/antibiotics/${id}`);
	};

	const openDelete = (item: AntibioticItem) => {
		setSelected(item);
		setIsDeleteOpen(true);
	};

	const closeModal = () => {
		setModalMode(null);
		setSelected(null);
	};

	const handleFormSubmit = (data: CreateAntibioticRequest | UpdateAntibioticRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreateAntibioticRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (error) => {
					toast.error(t("toast.createError") + " " + error.message);
				},
			});
		} else if (modalMode === "update" && selected) {
			updateMutation.mutate(
				{ id: selected.id, data: data as UpdateAntibioticRequest },
				{
					onSuccess: () => {
						closeModal();
						toast.success(t("toast.updateSuccess"));
					},
					onError: (error) => {
						toast.error(t("toast.updateError") + " " + error.message);
					},
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
				onError: (error) => {
					toast.error(t("toast.deleteError") + " " + error.message);
				},
			});
		}
	};

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Page Title & Main Action */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>
				<Button
					onClick={openCreate}
					className="bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<Plus className="mr-2 h-4 w-4" />
					{t("addButton")}
				</Button>
			</div>

			{/* Main Table Container */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
				<AntibioticsTable
					onViewDetail={openDetail}
					onEdit={openUpdate}
					onDelete={openDelete}
				/>
			</div>

			{/* Dialogs & Sheets */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="sm:max-w-[600px] border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">
							{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
						</DialogTitle>
					</DialogHeader>
					{modalMode && (
						<AntibioticForm
							initialData={selected}
							onSubmit={handleFormSubmit}
							onCancel={closeModal}
							isPending={createMutation.isPending || updateMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			<DeleteAntibioticSheet
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
				antibioticName={selected?.name || ""}
				isDeleting={deleteMutation.isPending}
			/>
		</div>
	);
}