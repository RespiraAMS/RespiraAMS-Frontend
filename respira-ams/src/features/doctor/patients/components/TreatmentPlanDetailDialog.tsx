"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Activity,
	Pill,
	FileText,
	CheckCircle2,
	AlertCircle,
	XCircle,
	Clock,
	Loader2,
	ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchTreatmentPlanById } from "@/features/doctor/patients/api";
import { AdherenceState } from "../types";

interface TreatmentPlanDetailDialogProps {
	planId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onRequestClosePlan?: (planId: string) => void;
	onRequestReviewPlan?: (planId: string, currentAdherence: AdherenceState) => void;
}

export function TreatmentPlanDetailDialog({
	planId,
	open,
	onOpenChange,
	onRequestClosePlan,
	onRequestReviewPlan,
}: TreatmentPlanDetailDialogProps) {
	const t = useTranslations("doctor.patients");

	const {
		data: plan,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["treatment-plans", planId],
		queryFn: () => fetchTreatmentPlanById(planId!),
		enabled: open && Boolean(planId),
	});

	if (!planId) return null;

	const renderAdherenceBadge = (state: AdherenceState) => {
		switch (state) {
			case "Adhere":
				return (
					<Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1 border-emerald-200 dark:border-emerald-800">
						<CheckCircle2 className="w-3 h-3" />
						{t("adherenceAdhereShort", { defaultMessage: "Tuân thủ" })}
					</Badge>
				);
			case "NotAdhereValid":
				return (
					<Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1 border-amber-200 dark:border-amber-800">
						<AlertCircle className="w-3 h-3" />
						{t("adherenceValidShort", { defaultMessage: "Không tuân thủ (Hợp lệ)" })}
					</Badge>
				);
			case "NotAdhereInvalid":
				return (
					<Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 flex items-center gap-1 border-rose-200 dark:border-rose-800">
						<XCircle className="w-3 h-3" />
						{t("adherenceInvalidShort", { defaultMessage: "Không tuân thủ (Từ chối)" })}
					</Badge>
				);
			case "NotAdhere":
			default:
				return (
					<Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 hover:bg-orange-100 flex items-center gap-1 border-orange-200 dark:border-orange-800">
						<Clock className="w-3 h-3" />
						{t("adherencePendingShort", { defaultMessage: "Chờ phê duyệt" })}
					</Badge>
				);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col rounded-[20px] bg-white dark:bg-slate-900 p-0 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
				{/* Header */}
				<div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
					<DialogHeader>
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
									<Activity className="w-5 h-5" />
								</div>
								<div>
									<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
										{t("planDetailTitle", { defaultMessage: "Chi tiết phác đồ điều trị" })}
									</DialogTitle>
									<p className="text-[11px] font-mono text-slate-400 mt-0.5">
										ID: {planId}
									</p>
								</div>
							</div>

							{plan && (
								<div className="flex items-center gap-2 shrink-0">
									<Badge
										variant={plan.status === "InProgress" ? "default" : "secondary"}
										className={
											plan.status === "InProgress"
												? "bg-[#0EA5E9] text-white"
												: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
										}
									>
										{plan.status === "InProgress"
											? t("planStatusInProgress", { defaultMessage: "Đang thực hiện" })
											: t("planStatusClosed", { defaultMessage: "Đã đóng" })}
									</Badge>
									{renderAdherenceBadge(plan.adherenceState)}
								</div>
							)}
						</div>
					</DialogHeader>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
					{isLoading ? (
						<div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
							<Loader2 className="w-6 h-6 animate-spin text-sky-500" />
							<p className="text-xs">{t("loadingPlanDetail", { defaultMessage: "Đang tải thông tin phác đồ..." })}</p>
						</div>
					) : error ? (
						<div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 flex flex-col items-center gap-3 py-8">
							<ShieldAlert className="w-8 h-8" />
							<p className="font-medium text-center">
								{(error as Error).message || t("loadPlanError", { defaultMessage: "Không thể tải chi tiết phác đồ." })}
							</p>
							<Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
								{t("btnRetry", { defaultMessage: "Thử lại" })}
							</Button>
						</div>
					) : plan ? (
						<>
							{/* Patient & Doctor info */}
							<div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
								<div>
									<span className="text-[11px] text-slate-400 block font-normal">
										{t("colPatient", { defaultMessage: "Bệnh nhân" })}
									</span>
									<span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
										{plan.patient?.name || "—"}
									</span>
								</div>
								<div>
									<span className="text-[11px] text-slate-400 block font-normal">
										{t("colDoctor", { defaultMessage: "Bác sĩ chỉ định" })}
									</span>
									<span className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 block truncate">
										{plan.doctorId || "—"}
									</span>
								</div>
							</div>

							{/* Diagnosis */}
							<div className="space-y-1.5">
								<div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
									<FileText className="w-4 h-4 text-sky-500" />
									<span>{t("diagnosisLabel", { defaultMessage: "Chẩn đoán bệnh" })}</span>
								</div>
								<div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50 rounded-xl text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
									{plan.diagnosis || t("noDiagnosis", { defaultMessage: "Chưa ghi nhận chẩn đoán." })}
								</div>
							</div>

							{/* Medicines list */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
										<Pill className="w-4 h-4 text-emerald-500" />
										<span>{t("prescribedMedicines", { defaultMessage: "Kháng sinh chỉ định" })}</span>
									</div>
									<span className="text-[11px] text-slate-400">
										{plan.medicines?.length ?? 0} {t("itemsUnit", { defaultMessage: "loại thuốc" })}
									</span>
								</div>

								{plan.medicines && plan.medicines.length > 0 ? (
									<div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
										{plan.medicines.map((med, idx) => (
											<div key={med.id || idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
												<div>
													<p className="font-bold text-slate-900 dark:text-white">
														{med.name}
													</p>
													<p className="text-[11px] text-slate-400 mt-0.5">
														{t("classificationLabel", { defaultMessage: "Phân loại" })}: {med.classification}
													</p>
												</div>
												<Badge variant="outline" className="text-[10px] font-mono">
													Rx #{idx + 1}
												</Badge>
											</div>
										))}
									</div>
								) : (
									<p className="text-slate-400 italic p-3 text-center border border-dashed rounded-xl">
										{t("noMedicinesInPlan", { defaultMessage: "Chưa có thuốc kháng sinh nào được kê trong phác đồ." })}
									</p>
								)}
							</div>

							{/* Rationale if not adhering */}
							{plan.reasonForMedicineChoice && (
								<div className="space-y-1.5">
									<span className="font-bold text-slate-900 dark:text-white block">
										{t("medicineChoiceReason", { defaultMessage: "Lý do lựa chọn thuốc / Giải trình lâm sàng" })}
									</span>
									<div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">
										{plan.reasonForMedicineChoice}
									</div>
								</div>
							)}

							{/* Close Reason if closed */}
							{plan.status === "Closed" && (
								<div className="space-y-1.5">
									<span className="font-bold text-slate-900 dark:text-white block">
										{t("closedReasonTitle", { defaultMessage: "Lý do đóng phác đồ" })}
									</span>
									<div className="p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
										{plan.closeReason || t("noCloseReason", { defaultMessage: "Không có ghi chú lý do." })}
									</div>
								</div>
							)}
						</>
					) : null}
				</div>

				{/* Footer */}
				<div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between flex-wrap gap-2">
					<div className="flex items-center gap-2">
						{plan && (() => {
							const isClosed = plan.status === "Closed" || (plan.status as unknown) === 1;
							const isReviewed = plan.adherenceState !== "NotAdhere";
							return (
								<>
									{onRequestReviewPlan && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={isReviewed}
											title={isReviewed ? "Phác đồ này đã được duyệt" : "Duyệt phác đồ"}
											onClick={() => {
												onOpenChange(false);
												onRequestReviewPlan(plan.id, plan.adherenceState);
											}}
											className={`h-8 text-xs font-semibold transition-opacity ${
												isReviewed
													? "opacity-40 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-100"
													: "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
											}`}
										>
											{isReviewed ? "Đã duyệt" : t("btnReviewPlan", { defaultMessage: "Duyệt phác đồ" })}
										</Button>
									)}
									{onRequestClosePlan && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={isClosed}
											title={isClosed ? "Phác đồ này đã được đóng" : "Đóng phác đồ"}
											onClick={() => {
												onOpenChange(false);
												onRequestClosePlan(plan.id);
											}}
											className={`h-8 text-xs font-semibold transition-opacity ${
												isClosed
													? "opacity-40 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-100"
													: "text-amber-600 border-amber-200 hover:bg-amber-50"
											}`}
										>
											{isClosed ? "Đã đóng" : t("btnClosePlan", { defaultMessage: "Đóng phác đồ" })}
										</Button>
									)}
								</>
							);
						})()}
					</div>

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onOpenChange(false)}
						className="h-8 text-xs font-semibold"
					>
						{t("btnCloseModal", { defaultMessage: "Đóng" })}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

