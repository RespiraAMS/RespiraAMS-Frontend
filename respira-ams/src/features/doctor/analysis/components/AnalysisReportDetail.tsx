"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	FileSpreadsheet,
	Loader2,
	CheckCircle2,
	XCircle,
	Clock,
	Users,
	FileText,
	Activity,
	Stethoscope,
	Trash,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAnalysisMutations, useAnalysisReportDetail } from "../queries";
import { DoctorBadge } from "./DoctorBadge";

function formatDateTimeLocalized(isoString: string | undefined, locale: string): string {
	if (!isoString) return "—";
	const d = new Date(isoString);
	if (Number.isNaN(d.getTime())) return isoString;
	const dateLocale = locale === "en" ? "en-GB" : "vi-VN";
	return d.toLocaleString(dateLocale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function AwareClassificationBadge({ classification }: { classification: string }) {
	const normalized = classification?.toLowerCase();

	if (normalized === "access") {
		return (
			<span className="inline-flex items-center rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
				Access
			</span>
		);
	}
	if (normalized === "watch") {
		return (
			<span className="inline-flex items-center rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
				Watch
			</span>
		);
	}
	if (normalized === "reserve") {
		return (
			<span className="inline-flex items-center rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
				Reserve
			</span>
		);
	}

	return (
		<span className="inline-flex items-center rounded-md bg-muted border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
			{classification || "N/A"}
		</span>
	);
}

export function AnalysisReportDetail({ analysisId }: { analysisId: string }) {
	const locale = useLocale();
	const t = useTranslations("doctor.analysis");
	const tCommon = useTranslations("common");
	const router = useRouter();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { data: report, isLoading } = useAnalysisReportDetail(analysisId);
	const { downloadExcelMutation, deleteMutation } = useAnalysisMutations();

	const handleDownloadExcel = () => {
		downloadExcelMutation.mutate(analysisId, {
			onSuccess: () => toast.success(t("toast.downloadExcelSuccess")),
			onError: (err) =>
				toast.error(t("toast.downloadExcelError", { error: err.message })),
		});
	};

	const handleDelete = () => {
		deleteMutation.mutate(analysisId, {
			onSuccess: () => {
				setIsDeleteOpen(false);
				toast.success(t("toast.deleteSuccess"));
				router.push("/doctor/analysis");
			},
			onError: (err) => {
				toast.error(t("toast.deleteError", { error: err.message }));
			},
		});
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-16">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!report) {
		return (
			<div className="text-center py-16 text-destructive font-medium">
				{t("detail.notFound")}
			</div>
		);
	}

	const adherenceRate =
		report.totalTreatmentPlans > 0
			? Math.round((report.totalAdherentPlans / report.totalTreatmentPlans) * 100)
			: 0;

	return (
		<div className="max-w-6xl mx-auto space-y-6 text-foreground">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-start gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="hover:bg-accent text-foreground rounded-full mt-0.5 shrink-0"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<div className="flex flex-wrap items-center gap-2.5">
							<h2 className="text-2xl font-bold tracking-tight text-foreground">
								{t("detail.title")}
							</h2>
							<DoctorBadge doctorId={report.doctorId} />
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{t.rich("detail.periodRange", {
								start: formatDateTimeLocalized(report.start, locale),
								end: formatDateTimeLocalized(report.end, locale),
								bold: (chunks) => (
									<span className="font-medium text-foreground">{chunks}</span>
								),
							})}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
					<Button
						onClick={handleDownloadExcel}
						disabled={downloadExcelMutation.isPending}
						className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
					>
						{downloadExcelMutation.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<FileSpreadsheet className="h-4 w-4" />
						)}
						{t("detail.exportExcel")}
					</Button>
					<Button
						variant="destructive"
						onClick={() => setIsDeleteOpen(true)}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
					>
						<Trash className="h-4 w-4" />
						{t("detail.deleteReport")}
					</Button>
				</div>
			</div>

			{/* KPI Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-2">
					<div className="flex items-center justify-between text-muted-foreground">
						<span className="text-xs font-semibold uppercase tracking-wider">
							{t("detail.cards.treatmentScale.title")}
						</span>
						<FileText className="h-4 w-4 text-primary" />
					</div>
					<div className="text-2xl font-bold text-foreground">
						{t.rich("detail.cards.treatmentScale.plans", {
							count: report.totalTreatmentPlans,
							unit: (chunks) => (
								<span className="text-sm font-normal text-muted-foreground">
									{chunks}
								</span>
							),
						})}
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Users className="h-3.5 w-3.5 shrink-0" />
						<span>
							{t.rich("detail.cards.treatmentScale.patients", {
								count: report.totalPatients,
								bold: (chunks) => (
									<strong className="text-foreground">{chunks}</strong>
								),
							})}
						</span>
					</div>
				</div>

				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-2">
					<div className="flex items-center justify-between text-muted-foreground">
						<span className="text-xs font-semibold uppercase tracking-wider">
							{t("detail.cards.adherence.title")}
						</span>
						<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
					</div>
					<div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
						{report.totalAdherentPlans}{" "}
						<span className="text-sm font-semibold">({adherenceRate}%)</span>
					</div>
					<div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-emerald-500 rounded-full transition-all"
							style={{ width: `${adherenceRate}%` }}
						/>
					</div>
				</div>

				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-2">
					<div className="flex items-center justify-between text-muted-foreground">
						<span className="text-xs font-semibold uppercase tracking-wider">
							{t("detail.cards.attention.title")}
						</span>
						<XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
					</div>
					<div className="flex items-baseline gap-4">
						<div>
							<div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
								{report.totalNonAdherentPlans}
							</div>
							<div className="text-xs text-muted-foreground">
								{t("detail.cards.attention.nonAdherent")}
							</div>
						</div>
						<div className="border-l border-border pl-4">
							<div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
								{report.totalPendingReviewPlans}
								<Clock className="h-4 w-4" />
							</div>
							<div className="text-xs text-muted-foreground">
								{t("detail.cards.attention.pendingReview")}
							</div>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-2">
					<div className="flex items-center justify-between text-muted-foreground">
						<span className="text-xs font-semibold uppercase tracking-wider">
							{t("detail.cards.outcomes.title")}
						</span>
						<Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
					</div>
					<div className="grid grid-cols-3 gap-2 pt-1 text-center">
						<div className="rounded-lg bg-emerald-500/10 p-1.5">
							<div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
								{report.totalRecoveredPatients}
							</div>
							<div className="text-[11px] text-muted-foreground">
								{t("detail.cards.outcomes.recovered")}
							</div>
						</div>
						<div className="rounded-lg bg-rose-500/10 p-1.5">
							<div className="text-base font-bold text-rose-700 dark:text-rose-400">
								{report.totalDeceasedPatients}
							</div>
							<div className="text-[11px] text-muted-foreground">
								{t("detail.cards.outcomes.deceased")}
							</div>
						</div>
						<div className="rounded-lg bg-muted p-1.5">
							<div className="text-base font-bold text-foreground">
								{report.totalOtherOutcomePatients}
							</div>
							<div className="text-[11px] text-muted-foreground">
								{t("detail.cards.outcomes.other")}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground shadow-lg">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">
							{t("deleteDialog.title")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{t("detail.deleteConfirmDescription")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteOpen(false)}
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

			{/* Per-Doctor Detailed Statistics */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Stethoscope className="h-5 w-5 text-primary" />
					<h3 className="text-lg font-bold text-foreground">
						{t("detail.doctorsSection.title", {
							count: report.doctors?.length || 0,
						})}
					</h3>
				</div>

				{!report.doctors || report.doctors.length === 0 ? (
					<div className="rounded-xl border border-border bg-card text-card-foreground p-8 text-center text-sm text-muted-foreground">
						{t("detail.doctorsSection.empty")}
					</div>
				) : (
					report.doctors.map((doc) => {
						const docAdherenceRate =
							doc.totalTreatmentPlans > 0
								? Math.round(
										(doc.totalAdherentPlans / doc.totalTreatmentPlans) * 100
								  )
								: 0;

						return (
							<div
								key={doc.doctorId}
								className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden"
							>
								<div className="bg-muted/40 dark:bg-muted/20 border-b border-border px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
									<div className="space-y-1">
										<DoctorBadge doctorId={doc.doctorId} variant="inline" />
										<p className="text-xs text-muted-foreground">
											{t.rich("detail.doctorsSection.doctorSummary", {
												patients: doc.totalPatients,
												plans: doc.totalTreatmentPlans,
												bold: (chunks) => (
													<strong className="text-foreground">
														{chunks}
													</strong>
												),
											})}
										</p>
									</div>

									<div className="flex flex-wrap items-center gap-2 text-xs">
										<span className="inline-flex items-center rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 font-semibold text-emerald-700 dark:text-emerald-400">
											{t("table.adherentCount", {
												count: doc.totalAdherentPlans,
												rate: docAdherenceRate,
											})}
										</span>
										<span className="inline-flex items-center rounded-md bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 font-semibold text-rose-700 dark:text-rose-400">
											{t("table.nonAdherentCount", {
												count: doc.totalNonAdherentPlans,
											})}
										</span>
										<span className="inline-flex items-center rounded-md bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 font-medium text-amber-700 dark:text-amber-400">
											{t("table.pendingReviewCount", {
												count: doc.totalPendingReviewPlans,
											})}
										</span>
									</div>
								</div>

								<div className="p-4 overflow-x-auto">
									<Table className="border-border">
										<TableHeader>
											<TableRow className="border-border hover:bg-transparent">
												<TableHead className="font-semibold text-muted-foreground">
													{t("detail.doctorsSection.table.antibioticName")}
												</TableHead>
												<TableHead className="font-semibold text-muted-foreground w-[140px]">
													{t(
														"detail.doctorsSection.table.awareClassification"
													)}
												</TableHead>
												<TableHead className="font-semibold text-muted-foreground text-center w-[130px]">
													{t(
														"detail.doctorsSection.table.totalPrescriptions"
													)}
												</TableHead>
												<TableHead className="font-semibold text-muted-foreground text-center w-[130px]">
													{t("detail.doctorsSection.table.adherent")}
												</TableHead>
												<TableHead className="font-semibold text-muted-foreground text-center w-[140px]">
													{t("detail.doctorsSection.table.nonAdherent")}
												</TableHead>
												<TableHead className="font-semibold text-muted-foreground text-center w-[130px]">
													{t("detail.doctorsSection.table.pendingReview")}
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{!doc.medicines || doc.medicines.length === 0 ? (
												<TableRow className="border-border">
													<TableCell
														colSpan={6}
														className="text-center text-sm text-muted-foreground py-6"
													>
														{t("detail.doctorsSection.table.empty")}
													</TableCell>
												</TableRow>
											) : (
												doc.medicines.map((med) => (
													<TableRow
														key={med.medicineId}
														className="border-border hover:bg-accent/40 transition-colors"
													>
														<TableCell className="font-semibold text-foreground">
															{med.name}
														</TableCell>
														<TableCell>
															<AwareClassificationBadge
																classification={med.classification}
															/>
														</TableCell>
														<TableCell className="text-center font-semibold text-foreground">
															{med.totalTreatmentPlans}
														</TableCell>
														<TableCell className="text-center font-medium text-emerald-600 dark:text-emerald-400">
															{med.totalAdherentPlans}
														</TableCell>
														<TableCell className="text-center font-medium text-rose-600 dark:text-rose-400">
															{med.totalNonAdherentPlans}
														</TableCell>
														<TableCell className="text-center font-medium text-amber-600 dark:text-amber-400">
															{med.totalPendingReviewPlans}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}