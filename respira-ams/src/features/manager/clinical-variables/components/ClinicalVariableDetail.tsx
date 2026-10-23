"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Loader2, Trash } from "lucide-react";
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

import { useClinicalVariableDetail, useClinicalVariableMutations } from "../queries";
import { type CreateClinicalVariableRequest, type UpdateClinicalVariableRequest } from "../types";
import { PrerequisiteFormatter } from "../../components/PrerequisiteFormatter";
import { ClinicalVariableForm } from "./ClinicalVariableForm";
import { formatRangeDisplay } from "../utils";

export function ClinicalVariableDetail({ id }: { id: string }) {
	const t = useTranslations("manager.clinicalVariables");
	const tCommon = useTranslations("common");
	const router = useRouter();

	const { data, isLoading } = useClinicalVariableDetail(id);
	const { updateMutation, deleteMutation } = useClinicalVariableMutations();

	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!data) {
		return <div className="text-center py-10 text-muted-foreground">{t("notFound")}</div>;
	}

	const handleUpdateSubmit = (payload: CreateClinicalVariableRequest) => {
		const updateData: UpdateClinicalVariableRequest = { ...payload, id };
		updateMutation.mutate(
			{ id, data: updateData },
			{
				onSuccess: () => {
					setIsUpdateOpen(false);
					toast.success(t("toast.updateSuccess"));
				},
				onError: (error) => toast.error(t("toast.updateError") + " " + error.message),
			}
		);
	};

	const handleDelete = () => {
		deleteMutation.mutate(id, {
			onSuccess: () => {
				toast.success(t("toast.deleteSuccess"));
				router.push("/manage/clinical-variables");
			},
			onError: (error) => toast.error(t("toast.deleteError") + " " + error.message),
		});
	};

	const formatCategory = (category: string) => {
		switch (category) {
			case "Clinical":
				return t("categories.clinical");
			case "Paraclinical":
				return t("categories.paraclinical");
			case "PersonalInformation":
				return t("categories.personal");
			default:
				return category;
		}
	};

	return (
		<div className="flex flex-col gap-6 text-foreground bg-background mx-auto">
			{/* Top Bar */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="hover:bg-accent text-foreground"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">{data.name}</h2>
						<p className="font-mono text-sm text-muted-foreground mt-1">
							{t("detail.codeLabel")}: {data.code}
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setIsUpdateOpen(true)}
						className="border-border text-foreground hover:bg-accent"
					>
						<Edit className="h-4 w-4 mr-2" /> {tCommon("update")}
					</Button>
					<Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
						<Trash className="h-4 w-4 mr-2" /> {tCommon("delete")}
					</Button>
				</div>
			</div>

			{/* Info Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* GENERAL INFORMATION */}
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground">
					<h3 className="font-semibold text-lg mb-4 text-foreground">{t("detail.generalInfo")}</h3>
					<div className="space-y-4 text-sm">
						<div className="grid grid-cols-3 gap-2">
							<span className="text-muted-foreground">{t("detail.descriptionLabel")}:</span>
							<span className="col-span-2 text-foreground font-medium">{data.description || "-"}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="text-muted-foreground">{t("detail.categoryLabel")}:</span>
							<span className="col-span-2 font-medium text-foreground">{formatCategory(data.category)}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="text-muted-foreground">{t("detail.valueTypeLabel")}:</span>
							<span className="col-span-2 font-medium bg-accent text-accent-foreground w-fit px-2 py-0.5 rounded border border-border">
								{data.valueType}
							</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="text-muted-foreground">{t("detail.requiredLabel")}:</span>
							<span className="col-span-2 font-medium">
								{data.isRequired ? (
									<span className="text-destructive font-bold">{t("table.yes")}</span>
								) : (
									<span className="text-muted-foreground">{t("table.requiredFalse")}</span>
								)}
							</span>
						</div>
						{data.canonicalUnit && (
							<div className="grid grid-cols-3 gap-2">
								<span className="text-muted-foreground">{t("detail.unitLabel")}:</span>
								<span className="col-span-2 font-medium text-foreground">{data.canonicalUnit}</span>
							</div>
						)}
					</div>
				</div>

				{/* DATA RULES */}
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground">
					<h3 className="font-semibold text-lg mb-4 text-foreground">
						{t("detail.dataRules", { type: data.valueType })}
					</h3>

					{data.valueType === "Numeric" && (
						<div className="space-y-2 text-sm">
							<div className="flex justify-between items-center py-2 border-b border-border last:border-0">
								<span className="text-muted-foreground">{t("detail.acceptedRange")}</span>
								<span className="font-mono font-medium bg-accent text-accent-foreground px-2 py-1 rounded border border-border">
									{formatRangeDisplay(data.acceptedRange) || "-"}
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-border last:border-0">
								<span className="text-muted-foreground">{t("detail.normalRange")}</span>
								<span className="font-mono font-medium bg-accent text-accent-foreground px-2 py-1 rounded border border-border">
									{formatRangeDisplay(data.normalRange) || "-"}
								</span>
							</div>
						</div>
					)}

					{data.valueType === "Categorical" && data.acceptedValues && (
						<div className="space-y-2">
							<span className="text-muted-foreground text-sm">{t("detail.acceptedValues")}:</span>
							<div className="flex flex-wrap gap-2 mt-2">
								{data.acceptedValues.map((val, idx) => (
									<span
										key={idx}
										className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium"
									>
										{val}
									</span>
								))}
							</div>
						</div>
					)}

					{data.valueType === "Boolean" && (
						<div className="flex items-center justify-center h-full pb-8">
							<span className="text-muted-foreground italic text-sm">{t("detail.booleanNotice")}</span>
						</div>
					)}
				</div>
			</div>

			{/* PREREQUISITE CONDITION */}
			<div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground">
				<h3 className="font-semibold text-lg mb-4 text-foreground">{t("detail.prerequisiteTitle")}</h3>
				<div className="bg-muted/50 p-4 rounded-lg border border-border text-foreground">
					<PrerequisiteFormatter formula={data.prerequisite} />
				</div>
			</div>

			{/* UPDATE DIALOG */}
			<Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
				<DialogContent className="w-[95vw] sm:max-w-6xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">{t("dialog.updateTitle")}</DialogTitle>
					</DialogHeader>
					{isUpdateOpen && (
						<ClinicalVariableForm
							initialData={data}
							onSubmit={handleUpdateSubmit}
							onCancel={() => setIsUpdateOpen(false)}
							isPending={updateMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* DELETE ALERT */}
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground shadow-lg">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">{t("alert.deleteTitle")}</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{t("alert.deleteConfirmMsg", { name: data.name })}
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