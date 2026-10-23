"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CriteriaTable } from "./CriteriaTable";
import { CriteriaForm } from "./CriteriaForm";
import { CriteriaDeleteAlert } from "./CriteriaDeleteAlert";
import { useCriteriaMutations, useCriteriaDetail } from "../queries";
import { type CriteriaItem, type CreateCriteriaRequest, type UpdateCriteriaRequest } from "../types";

export function CriteriaView() {
	const t = useTranslations("manager.criteria");
	const router = useRouter();

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [itemToDelete, setItemToDelete] = useState<CriteriaItem | null>(null);

	const { createMutation, updateMutation } = useCriteriaMutations();

	const { data: detailData, isFetching: isFetchingDetail } = useCriteriaDetail(selectedId as string, {
		enabled: modalMode === "update" && !!selectedId,
	});

	const openDetail = (id: string) => {
		router.push(`/manage/criteria/${id}`);
	};

	const openCreate = () => {
		setSelectedId(null);
		setModalMode("create");
	};

	const openUpdate = (item: CriteriaItem) => {
		setSelectedId(item.id);
		setModalMode("update");
	};

	const openDelete = (item: CriteriaItem) => {
		setItemToDelete(item);
	};

	const closeModal = () => {
		setModalMode(null);
		setSelectedId(null);
	};

	const handleFormSubmit = (data: CreateCriteriaRequest | UpdateCriteriaRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreateCriteriaRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (error) => toast.error(t("toast.createError") + " " + error.message),
			});
		} else if (modalMode === "update" && selectedId) {
			updateMutation.mutate(
				{ id: selectedId, data: data as UpdateCriteriaRequest },
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

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
					<p className="text-muted-foreground mt-1">{t("description")}</p>
				</div>
				<Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
					<Plus className="mr-2 h-4 w-4" />
					{t("addButton")}
				</Button>
			</div>

			{/* Table Card */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
				<CriteriaTable onViewDetail={openDetail} onEdit={openUpdate} onDelete={openDelete} />
			</div>

			{/* Form Dialog */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="w-[95vw] sm:max-w-5xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">
							{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
						</DialogTitle>
					</DialogHeader>

					{modalMode === "update" && isFetchingDetail ? (
						<div className="flex justify-center p-10">
							<Loader2 className="animate-spin text-primary w-8 h-8" />
						</div>
					) : (
						modalMode && (
							<CriteriaForm
								initialData={modalMode === "update" ? detailData : null}
								onSubmit={handleFormSubmit}
								onCancel={closeModal}
								isPending={createMutation.isPending || updateMutation.isPending}
							/>
						)
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Alert */}
			{itemToDelete && (
				<CriteriaDeleteAlert
					criteriaItem={itemToDelete}
					isOpen={!!itemToDelete}
					onClose={() => setItemToDelete(null)}
					onSuccess={() => setItemToDelete(null)}
				/>
			)}
		</div>
	);
}