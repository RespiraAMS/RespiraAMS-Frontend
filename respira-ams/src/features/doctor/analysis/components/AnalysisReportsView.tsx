"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AnalysisReportsTable } from "./AnalysisReportsTable";
import { CreateAnalysisReportForm } from "./CreateAnalysisReportForm";
import { useAnalysisMutations } from "../queries";
import { AnalysisReportItem, CreateAnalysisReportRequest } from "../types";

export function AnalysisReportsView() {
	const locale = useLocale();
	const t = useTranslations("doctor.analysis");
	const tCommon = useTranslations("common");
	const router = useRouter();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [reportToDelete, setReportToDelete] = useState<AnalysisReportItem | null>(null);

	const { createMutation, deleteMutation } = useAnalysisMutations();

	const handleViewDetail = (analysisId: string) => {
		router.push(`/doctor/analysis/${analysisId}`);
	};

	const handleCreateSubmit = (payload: CreateAnalysisReportRequest) => {
		createMutation.mutate(payload, {
			onSuccess: (createdReport) => {
				toast.success(t("toast.createSuccess"));
				setIsCreateOpen(false);
				if (createdReport?.analysisId) {
					router.push(`/doctor/analysis/${createdReport.analysisId}`);
				}
			},
			onError: (error) => {
				toast.error(t("toast.createError", { error: error.message }));
			},
		});
	};

	const handleDelete = () => {
		if (!reportToDelete) return;
		deleteMutation.mutate(reportToDelete.analysisId, {
			onSuccess: () => {
				setReportToDelete(null);
				toast.success(t("toast.deleteSuccess"));
			},
			onError: (error) => {
				toast.error(t("toast.deleteError", { error: error.message }));
			},
		});
	};

	const formatDateRange = (item: AnalysisReportItem | null) => {
		if (!item) return "";
		const dateLocale = locale === "en" ? "en-GB" : "vi-VN";
		const start = new Date(item.start).toLocaleDateString(dateLocale, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
		const end = new Date(item.end).toLocaleDateString(dateLocale, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
		return `${start} — ${end}`;
	};

	return (
		<div className="space-y-6 text-foreground">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">
						{t("title")}
					</h2>
					<p className="text-muted-foreground mt-1">{t("subtitle")}</p>
				</div>
				<Button
					onClick={() => setIsCreateOpen(true)}
					className="bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto"
				>
					<Plus className="mr-2 h-4 w-4" />
					{t("createButton")}
				</Button>
			</div>

			<div className="rounded-xl border border-border bg-card text-card-foreground p-4 shadow-sm overflow-x-auto">
				<AnalysisReportsTable
					onViewDetail={handleViewDetail}
					onDelete={setReportToDelete}
				/>
			</div>

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="sm:max-w-lg border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">
							{t("createDialog.title")}
						</DialogTitle>
					</DialogHeader>
					{isCreateOpen && (
						<CreateAnalysisReportForm
							onSubmit={handleCreateSubmit}
							onCancel={() => setIsCreateOpen(false)}
							isPending={createMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!reportToDelete}
				onOpenChange={(open) => !open && setReportToDelete(null)}
			>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground shadow-lg">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">
							{t("deleteDialog.title")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{t.rich("deleteDialog.description", {
								period: formatDateRange(reportToDelete),
								bold: (chunks) => (
									<span className="font-bold text-foreground">{chunks}</span>
								),
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setReportToDelete(null)}
							disabled={deleteMutation.isPending}
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
		</div>
	);
}