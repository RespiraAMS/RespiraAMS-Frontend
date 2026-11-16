"use client";

import { useState } from "react";
import { Eye, FileSpreadsheet, Loader2, Trash } from "lucide-react";
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
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

import { useAnalysisMutations, useAnalysisReports } from "../queries";
import { AnalysisReportItem } from "../types";
import { DoctorBadge } from "./DoctorBadge";

const PAGE_SIZE = 10;

interface AnalysisReportsTableProps {
	onViewDetail: (analysisId: string) => void;
	onDelete: (item: AnalysisReportItem) => void;
}

function formatDateLocalized(isoString: string, locale: string): string {
	if (!isoString) return "—";
	const d = new Date(isoString);
	if (Number.isNaN(d.getTime())) return isoString;
	const dateLocale = locale === "en" ? "en-GB" : "vi-VN";
	return d.toLocaleDateString(dateLocale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function formatDateTimeLocalized(isoString: string, locale: string): string {
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

export function AnalysisReportsTable({ onViewDetail, onDelete }: AnalysisReportsTableProps) {
	const locale = useLocale();
	const t = useTranslations("doctor.analysis");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

	const { data: listData, isLoading, isFetching } = useAnalysisReports(page, PAGE_SIZE);
	const { downloadExcelMutation } = useAnalysisMutations();

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

	const handleDownloadExcel = (analysisId: string) => {
		setDownloadingId(analysisId);
		downloadExcelMutation.mutate(analysisId, {
			onSuccess: () => {
				toast.success(t("toast.downloadExcelSuccess"));
			},
			onError: (err) => {
				toast.error(t("toast.downloadExcelError", { error: err.message }));
			},
			onSettled: () => {
				setDownloadingId(null);
			},
		});
	};

	return (
		<div className="relative">
			{isFetching && (
				<div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md z-10">
					<div className="h-full bg-primary animate-pulse w-1/2 translate-x-1/2" />
				</div>
			)}

			<Table className="border-border">
				<TableHeader>
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="text-muted-foreground font-semibold">
							{t("table.doctor")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold">
							{t("table.period")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold">
							{t("table.total")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold">
							{t("table.adherence")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold">
							{t("table.outcomes")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold">
							{t("table.createdAt")}
						</TableHead>
						<TableHead className="text-muted-foreground text-right font-semibold w-[135px]">
							{tCommon("actions")}
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow className="border-border">
							<TableCell
								colSpan={7}
								className="h-32 text-center text-muted-foreground"
							>
								<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
							</TableCell>
						</TableRow>
					) : items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell
								colSpan={7}
								className="text-center text-muted-foreground py-10"
							>
								{t("table.empty")}
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => {
							const adherenceRate =
								item.totalTreatmentPlans > 0
									? Math.round(
											(item.totalAdherentPlans /
												item.totalTreatmentPlans) *
												100
									  )
									: 0;

							return (
								<TableRow
									key={item.analysisId}
									className="border-border hover:bg-accent/50 cursor-pointer transition-colors"
									onClick={() => onViewDetail(item.analysisId)}
								>
									<TableCell className="align-top">
										<DoctorBadge doctorId={item.doctorId} />
									</TableCell>

									<TableCell className="align-top text-sm font-medium text-foreground whitespace-nowrap">
										{formatDateLocalized(item.start, locale)} —{" "}
										{formatDateLocalized(item.end, locale)}
									</TableCell>

									<TableCell className="align-top">
										<div className="text-sm font-semibold text-foreground">
											{t("table.plansCount", {
												count: item.totalTreatmentPlans,
											})}
										</div>
										<div className="text-xs text-muted-foreground">
											{t("table.patientsCount", {
												count: item.totalPatients,
											})}
										</div>
									</TableCell>

									<TableCell className="align-top">
										<div className="flex flex-wrap gap-1.5 text-xs">
											<span className="inline-flex items-center rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
												{t("table.adherentCount", {
													count: item.totalAdherentPlans,
													rate: adherenceRate,
												})}
											</span>
											<span className="inline-flex items-center rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 font-semibold text-rose-700 dark:text-rose-400">
												{t("table.nonAdherentCount", {
													count: item.totalNonAdherentPlans,
												})}
											</span>
											{item.totalPendingReviewPlans > 0 && (
												<span className="inline-flex items-center rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 font-medium text-amber-700 dark:text-amber-400">
													{t("table.pendingReviewCount", {
														count: item.totalPendingReviewPlans,
													})}
												</span>
											)}
										</div>
									</TableCell>

									<TableCell className="align-top">
										<div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
											<span className="text-emerald-700 dark:text-emerald-400 font-medium">
												{t("table.recoveredCount", {
													count: item.totalRecoveredPatients,
												})}
											</span>
											<span>•</span>
											<span className="text-destructive font-medium">
												{t("table.deceasedCount", {
													count: item.totalDeceasedPatients,
												})}
											</span>
											<span>•</span>
											<span>
												{t("table.otherOutcomeCount", {
													count: item.totalOtherOutcomePatients,
												})}
											</span>
										</div>
									</TableCell>

									<TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
										{formatDateTimeLocalized(item.createdAt, locale)}
									</TableCell>

									<TableCell
										className="align-top"
										onClick={(e) => e.stopPropagation()}
									>
										<div className="flex justify-end gap-1">
											<Button
												variant="ghost"
												size="icon"
												title={t("actions.viewDetailTitle")}
												onClick={() => onViewDetail(item.analysisId)}
												className="hover:bg-accent text-foreground h-8 w-8"
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												title={t("actions.downloadExcelTitle")}
												disabled={downloadingId === item.analysisId}
												onClick={() =>
													handleDownloadExcel(item.analysisId)
												}
												className="hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 h-8 w-8"
											>
												{downloadingId === item.analysisId ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<FileSpreadsheet className="h-4 w-4" />
												)}
											</Button>
											<Button
												variant="ghost"
												size="icon"
												title={t("actions.deleteTitle")}
												onClick={() => onDelete(item)}
												className="hover:bg-destructive/10 h-8 w-8"
											>
												<Trash className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>

			{totalPages > 1 && (
				<Pagination className="mt-4">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								className={
									page > 1
										? "cursor-pointer text-foreground hover:bg-accent"
										: "pointer-events-none opacity-50"
								}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							/>
						</PaginationItem>
						<span className="text-sm text-muted-foreground px-2">
							{tCommon("pageOf", { page, totalPages })}
						</span>
						<PaginationItem>
							<PaginationNext
								className={
									page < totalPages
										? "cursor-pointer text-foreground hover:bg-accent"
										: "pointer-events-none opacity-50"
								}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}