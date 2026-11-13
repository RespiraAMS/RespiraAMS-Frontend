"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
	ArrowLeft,
	RefreshCw,
	TrendingUp,
	Check,
	Users,
	Plus,
	Pencil,
	Trash2,
	ClipboardList,
	Eye,
	CheckCircle2,
	AlertCircle,
	XCircle,
	Clock,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Patient, PatientStatus, NextOfKin, AdherenceState } from "../types";
import { dischargePatient, fetchPatientById, STATUS_TO_OUTCOME } from "@/features/doctor/patients/api";
import { PatientStatusBadge } from "./PatientStatusBadge";
import { NextOfKinDialog } from "./NextOfKinDialog";
import { DeleteNextOfKinDialog } from "./DeleteNextOfKinDialog";
import { TreatmentPlanDetailDialog } from "./TreatmentPlanDetailDialog";
import { CloseTreatmentPlanDialog } from "./CloseTreatmentPlanDialog";
import { ReviewTreatmentPlanDialog } from "./ReviewTreatmentPlanDialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PatientDetailsViewProps {
	patientId: string;
}

type DischargeStatus = Exclude<PatientStatus, "treating">;

const STATUS_LABEL: Record<PatientStatus, string> = {
	treating: "Đang điều trị",
	recovered: "Hồi phục",
	deceased: "Tử vong",
	outOfScope: "Ngoài phạm vi điều trị kháng sinh",
};

function formatDateTime(iso?: string | null): string {
	if (!iso) return "—";
	const date = new Date(iso);
	if (isNaN(date.getTime())) return "—";
	return date.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface Milestone {
	id: string;
	title: string;
	time: string;
	kind: "admitted" | "treating" | "completed";
	label: string;
}

function buildTimeline(patient: Patient): Milestone[] {
	const items: Milestone[] = [];
	if (patient.discharge) {
		items.push({
			id: "discharge",
			title: `Xuất viện · ${STATUS_LABEL[patient.status]}`,
			time: formatDateTime(patient.discharge),
			kind: "completed",
			label: "Đã hoàn thành",
		});
	} else {
		items.push({
			id: "treating",
			title: "Đang điều trị",
			time: `Số đợt điều trị đã ghi nhận: ${patient.treatmentCount ?? 0}`,
			kind: "treating",
			label: "Đang điều trị",
		});
	}
	items.push({
		id: "admission",
		title: "Tiếp nhận bệnh nhân",
		time: formatDateTime(patient.admission),
		kind: "admitted",
		label: "Tiếp nhận",
	});
	return items;
}

export function PatientDetailsView({ patientId }: PatientDetailsViewProps) {
	const t = useTranslations("doctor.patients");
	const queryClient = useQueryClient();

	// Quick modal for "Cập nhật trạng thái" (discharge)
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [statusValue, setStatusValue] = useState<DischargeStatus>("recovered");
	const [statusError, setStatusError] = useState<string | null>(null);
	const [isSavingStatus, setIsSavingStatus] = useState(false);

	// Next of kin dialogs
	const [isKinDialogOpen, setIsKinDialogOpen] = useState(false);
	const [selectedKin, setSelectedKin] = useState<NextOfKin | null>(null);
	const [isDeleteKinDialogOpen, setIsDeleteKinDialogOpen] = useState(false);
	const [selectedDeleteKin, setSelectedDeleteKin] = useState<NextOfKin | null>(null);

	// Treatment plan dialogs
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
	const [isPlanDetailOpen, setIsPlanDetailOpen] = useState(false);
	const [isClosePlanOpen, setIsClosePlanOpen] = useState(false);
	const [isReviewPlanOpen, setIsReviewPlanOpen] = useState(false);
	const [reviewAdherenceState, setReviewAdherenceState] = useState<AdherenceState | undefined>(undefined);

	const {
		data: patient,
		isLoading,
		error: queryErr,
	} = useQuery({
		queryKey: ["patients", "detail", patientId],
		queryFn: () => fetchPatientById(patientId),
	});

	const reloadPatient = () => {
		queryClient.invalidateQueries({ queryKey: ["patients", "detail", patientId] });
		queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
	};

	const loadError = queryErr
		? queryErr instanceof Error
			? queryErr.message
			: "Không thể tải hồ sơ bệnh nhân."
		: null;

	const handleUpdateStatus = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatusError(null);
		setIsSavingStatus(true);
		try {
			await dischargePatient(patientId, STATUS_TO_OUTCOME[statusValue]);
			setIsStatusDialogOpen(false);
			await queryClient.invalidateQueries({ queryKey: ["patients"] });
		} catch (err) {
			const rawMsg = err instanceof Error ? err.message : "";
			let friendly = "Không thể cập nhật trạng thái.";
			if (rawMsg.includes("already been discharged")) {
				friendly = "Bệnh nhân này đã hoàn tất thủ tục xuất viện trước đó.";
			} else if (rawMsg.includes("does not have any treatment")) {
				friendly = "Bệnh nhân chưa có phác đồ điều trị nào, không thể cập nhật xuất viện.";
			} else if (rawMsg) {
				friendly = rawMsg;
			}
			setStatusError(friendly);
		} finally {
			setIsSavingStatus(false);
		}
	};

	const renderPlanAdherence = (state: AdherenceState) => {
		switch (state) {
			case "Adhere":
				return (
					<Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-[10px] font-medium py-0.5 px-2">
						<CheckCircle2 className="w-3 h-3 mr-1" />
						{t("adherenceAdhereShort", { defaultMessage: "Tuân thủ" })}
					</Badge>
				);
			case "NotAdhereValid":
				return (
					<Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-[10px] font-medium py-0.5 px-2">
						<AlertCircle className="w-3 h-3 mr-1" />
						{t("adherenceValidShort", { defaultMessage: "Không tuân thủ (Hợp lệ)" })}
					</Badge>
				);
			case "NotAdhereInvalid":
				return (
					<Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-[10px] font-medium py-0.5 px-2">
						<XCircle className="w-3 h-3 mr-1" />
						{t("adherenceInvalidShort", { defaultMessage: "Không tuân thủ (Từ chối)" })}
					</Badge>
				);
			case "NotAdhere":
			default:
				return (
					<Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 text-[10px] font-medium py-0.5 px-2">
						<Clock className="w-3 h-3 mr-1" />
						{t("adherencePendingShort", { defaultMessage: "Chờ phê duyệt" })}
					</Badge>
				);
		}
	};

	const backLink = (
		<Link
			href="/doctor/patients"
			className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#0EA5E9] hover:text-[#38BDF8] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group py-1"
			id="back-to-patients-list"
		>
			<ArrowLeft className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-1" />
			<span>{t("title", { defaultMessage: "Danh sách bệnh nhân" })}</span>
		</Link>
	);

	if (!patient) {
		return (
			<div className="p-6 max-w-[1300px] mx-auto space-y-6">
				{backLink}
				<div className="bg-white rounded-[16px] p-10 border border-slate-100/90 shadow-2xs text-center text-sm text-slate-400">
					{isLoading ? "Đang tải hồ sơ bệnh nhân..." : loadError}
				</div>
			</div>
		);
	}

	const timeline = buildTimeline(patient);
	const canUpdateStatus = patient.status === "treating";

	return (
		<div className="p-6 max-w-[1300px] mx-auto space-y-6">
			{/* Top Bar: Back navigation & Action Buttons */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				{backLink}

				<div className="flex items-center gap-3">
					{/* Button Cap nhat trang thai */}
					<button
						type="button"
						onClick={() => {
							setStatusValue("recovered");
							setStatusError(null);
							setIsStatusDialogOpen(true);
						}}
						style={{ borderRadius: "12px" }}
						className="inline-flex items-center gap-2.5 bg-white border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/70 text-[#0EA5E9] px-5 py-2.5 rounded-[12px] text-[13px] font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer h-[42px]"
						id="btn-update-status"
					>
						<RefreshCw className="h-4 w-4 stroke-[2.2]" />
						<span>{t("updateStatus", { defaultMessage: "Cập nhật trạng thái" })}</span>
					</button>
				</div>
			</div>

			{/* Main Container: 2 Cards */}
			<div className="flex flex-col lg:flex-row gap-6 items-start">
				{/* Left Card: Patient Demographics Profile */}
				<div className="w-full lg:w-[410px] shrink-0 bg-white rounded-[16px] p-6 border border-slate-100/90 shadow-2xs">
					{/* Patient Header Details */}
					<div>
						<h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
							{patient.name}
						</h2>
						<p className="text-xs font-semibold text-slate-700 mt-1 font-mono">
							{patient.code}
						</p>
						<p className="text-xs text-slate-400 mt-1">
							{patient.gender === "Nữ" ? t("female", { defaultMessage: "Nữ" }) : t("male", { defaultMessage: "Nam" })} · {patient.age} {t("yearsOld", { defaultMessage: "tuổi" })}
						</p>
					</div>

					{/* Subtle Divider */}
					<div className="h-px bg-slate-100 my-5" />

					{/* Demographics Table */}
					<div className="space-y-4.5 text-xs">
						<DetailRow label={t("birthDate", { defaultMessage: "Ngày sinh" })} value={patient.birthDate} bold />
						<DetailRow label={t("phoneLabel", { defaultMessage: "Số điện thoại" })} value={patient.phone} />
						<DetailRow
							label={t("bhytLabel", { defaultMessage: "Số thẻ BHYT" })}
							value={patient.bhyt}
							bold
							mono
						/>
						<DetailRow
							label={t("addressLabel", { defaultMessage: "Địa chỉ" })}
							value={[patient.address, patient.city].filter(Boolean).join(", ")}
						/>
						<DetailRow
							label={t("physiqueLabel", { defaultMessage: "Thể trạng" })}
							value={`${patient.weight ?? "—"}kg - ${patient.height ?? "—"}cm`}
						/>
						<DetailRow
							label={t("admissionDate", { defaultMessage: "Ngày nhập viện" })}
							value={formatDateTime(patient.admission)}
						/>
						<div className="flex items-center justify-between">
							<span className="text-slate-400 font-normal">{t("colStatus", { defaultMessage: "Trạng thái" })}</span>
							<PatientStatusBadge status={patient.status} />
						</div>
					</div>

					{/* Next of kin (Tasks 72, 80, 74) */}
					<div className="h-px bg-slate-100 my-5" />
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-slate-400" />
							<h3 className="text-xs font-bold text-slate-900">{t("nextOfKin", { defaultMessage: "Người thân" })}</h3>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setSelectedKin(null);
								setIsKinDialogOpen(true);
							}}
							className="h-7 px-2 text-xs font-semibold text-[#0EA5E9] hover:text-[#0284C7] hover:bg-sky-50"
						>
							<Plus className="w-3.5 h-3.5 mr-1" />
							{t("btnAddKin", { defaultMessage: "Thêm" })}
						</Button>
					</div>

					{patient.nextOfKins && patient.nextOfKins.length > 0 ? (
						<div className="space-y-2.5 text-xs">
							{patient.nextOfKins.map((kin) => (
								<div
									key={kin.id}
									className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
								>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-slate-800 truncate">{kin.fullName}</p>
										<p className="text-[11px] text-slate-400 mt-0.5 truncate">
											{kin.relationship} · <span className="font-mono text-slate-600">{kin.phoneNumber}</span>
										</p>
									</div>
									<div className="flex items-center gap-1 shrink-0">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => {
												setSelectedKin(kin);
												setIsKinDialogOpen(true);
											}}
											className="h-7 w-7 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
											title={t("btnEdit", { defaultMessage: "Chỉnh sửa" })}
										>
											<Pencil className="w-3.5 h-3.5" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => {
												setSelectedDeleteKin(kin);
												setIsDeleteKinDialogOpen(true);
											}}
											className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
											title={t("btnDelete", { defaultMessage: "Xóa" })}
										>
											<Trash2 className="w-3.5 h-3.5" />
										</Button>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-xs text-slate-400">{t("noNextOfKin", { defaultMessage: "Chưa có thông tin người thân." })}</p>
					)}
				</div>

				{/* Right Card: Treatment Plans & Timeline */}
				<div className="w-full flex-1 bg-white rounded-[16px] p-6 border border-slate-100/90 shadow-2xs space-y-6">
					{/* Section 1: Treatment Plans (Tasks 82, 83, 84) */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-[10px] bg-sky-100/80 text-[#0EA5E9] flex items-center justify-center shrink-0">
									<ClipboardList className="h-4.5 w-4.5 stroke-[2.2]" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-slate-900">
										{t("treatmentPlansSection", { defaultMessage: "Phác đồ điều trị" })}
									</h3>
									<p className="text-[11.5px] text-slate-400 mt-0.5">
										{t("treatmentPlansSectionSubtitle", { defaultMessage: "Danh sách phác đồ kháng sinh của bệnh nhân" })}
									</p>
								</div>
							</div>

							<span className="text-[11.5px] font-medium text-slate-400">
								{patient.treatmentPlans?.length ?? 0} {t("plansRecorded", { defaultMessage: "phác đồ" })}
							</span>
						</div>

						{patient.treatmentPlans && patient.treatmentPlans.length > 0 ? (
							<div className="space-y-3">
								{patient.treatmentPlans.map((plan) => {
									const isClosed = plan.treatmentPlanStatus === "Closed" || (plan.treatmentPlanStatus as unknown) === 1;
									const isReviewed = plan.adherenceState !== "NotAdhere";
									const isInProgress = !isClosed;
									return (
										<div
											key={plan.id}
											className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
										>
											<div className="space-y-1.5">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="text-xs font-mono font-bold text-slate-800">
														#{plan.id.slice(0, 8)}
													</span>
													<Badge
														variant={isInProgress ? "default" : "secondary"}
														className={`text-[10px] py-0.5 px-2 ${
															isInProgress
																? "bg-[#0EA5E9] text-white"
																: "bg-slate-200 text-slate-600"
														}`}
													>
														{isInProgress
															? t("planStatusInProgress", { defaultMessage: "Đang thực hiện" })
															: t("planStatusClosed", { defaultMessage: "Đã đóng" })}
													</Badge>
													{renderPlanAdherence(plan.adherenceState)}
												</div>
												<p className="text-[11px] text-slate-400">
													{formatDateTime(plan.updatedAt)}
												</p>
											</div>

											<div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedPlanId(plan.id);
														setIsPlanDetailOpen(true);
													}}
													className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:text-[#0EA5E9]"
												>
													<Eye className="w-3.5 h-3.5 mr-1" />
													{t("btnDetail", { defaultMessage: "Chi tiết" })}
												</Button>

												<Button
													type="button"
													variant="outline"
													size="sm"
													disabled={isReviewed}
													title={isReviewed ? "Phác đồ này đã được duyệt" : "Duyệt phác đồ"}
													onClick={() => {
														setSelectedPlanId(plan.id);
														setReviewAdherenceState(plan.adherenceState);
														setIsReviewPlanOpen(true);
													}}
													className={`h-8 px-2.5 text-xs font-semibold transition-opacity ${
														isReviewed
															? "opacity-40 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-100"
															: "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
													}`}
												>
													{isReviewed ? "Đã duyệt" : t("btnReviewPlan", { defaultMessage: "Duyệt" })}
												</Button>

												<Button
													type="button"
													variant="outline"
													size="sm"
													disabled={isClosed}
													title={isClosed ? "Phác đồ này đã được đóng" : "Đóng phác đồ"}
													onClick={() => {
														setSelectedPlanId(plan.id);
														setIsClosePlanOpen(true);
													}}
													className={`h-8 px-2.5 text-xs font-semibold transition-opacity ${
														isClosed
															? "opacity-40 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-100"
															: "text-amber-600 border-amber-200 hover:bg-amber-50"
													}`}
												>
													{isClosed ? "Đã đóng" : t("btnClosePlan", { defaultMessage: "Đóng" })}
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<p className="text-xs text-slate-400 p-4 border border-dashed rounded-xl text-center">
								{t("noTreatmentPlans", { defaultMessage: "Chưa ghi nhận phác đồ điều trị nào." })}
							</p>
						)}
					</div>

					<div className="h-px bg-slate-100" />

					{/* Section 2: Treatment Timeline */}
					<div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-[10px] bg-[#E0F2FE] text-[#0EA5E9] flex items-center justify-center shrink-0">
									<TrendingUp className="h-4.5 w-4.5 stroke-[2.2]" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-slate-900">
										{t("treatmentTimeline", { defaultMessage: "Tiến trình điều trị" })}
									</h3>
									<p className="text-[11.5px] text-slate-400 mt-0.5">
										{t("timelineSubtitle", { defaultMessage: "Danh sách mốc thời gian và trạng thái" })}
									</p>
								</div>
							</div>

							<span className="text-[11.5px] font-medium text-slate-400">
								{timeline.length} {t("milestonesRecorded", { defaultMessage: "mốc ghi nhận" })}
							</span>
						</div>

						{/* Timeline Items */}
						<div className="mt-5 divide-y divide-slate-100">
							{timeline.map((item) => {
								const isGreen = item.kind === "treating";
								const isBlue = item.kind === "completed";

								return (
									<div
										key={item.id}
										className="py-4.5 first:pt-4 last:pb-1 flex items-center justify-between gap-4"
									>
										{/* Left: Dot & Title/Time */}
										<div className="flex items-start gap-3.5">
											<div className="pt-1 shrink-0">
												{isGreen ? (
													<div className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-[#DCFCE7]" />
												) : isBlue ? (
													<div className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
												) : (
													<div className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
												)}
											</div>

											<div>
												<p className="text-xs font-bold text-slate-900 leading-tight">
													{item.title}
												</p>
												<p
													className={`text-[11px] mt-1 leading-tight ${
														isGreen
															? "text-[#16A34A] font-semibold"
															: "text-slate-400 font-normal"
													}`}
												>
													{item.time}
												</p>
											</div>
										</div>

										{/* Right: Badge */}
										<span
											className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
												isGreen
													? "bg-[#DCFCE7] text-[#16A34A]"
													: isBlue
														? "bg-[#E2E8F0] text-[#475569]"
														: "bg-[#E0F2FE] text-[#0284C7]"
											}`}
										>
											{item.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Status Update Dialog */}
			<Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
				<DialogContent className="sm:max-w-[420px] rounded-[18px] bg-white p-6 shadow-2xl border-none">
					<DialogHeader className="pb-3 border-b border-slate-100">
						<DialogTitle className="text-base font-bold text-slate-900">
							{t("updateStatusModalTitle", { defaultMessage: "Cập nhật trạng thái bệnh nhân" })}
						</DialogTitle>
						<p className="text-xs text-slate-400 mt-0.5">
							{patient.name} ({patient.code})
						</p>
					</DialogHeader>

					<form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-700 block">
								{t("dischargeOutcome", { defaultMessage: "Kết quả điều trị (xuất viện)" })}
							</label>
							<select
								value={statusValue}
								onChange={(e) => setStatusValue(e.target.value as DischargeStatus)}
								className="w-full h-10 px-3 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] rounded-[10px] text-xs font-medium text-slate-800 outline-none"
							>
								<option value="recovered">{t("statusRecovered", { defaultMessage: "Hồi phục" })}</option>
								<option value="deceased">{t("statusDeceased", { defaultMessage: "Tử vong" })}</option>
								<option value="outOfScope">{t("statusOutOfScope", { defaultMessage: "Ngoài phạm vi điều trị kháng sinh" })}</option>
							</select>
							<p className="text-[11px] text-slate-400">
								{t("dischargeNotice", { defaultMessage: "Thao tác này sẽ ghi nhận xuất viện và không thể thay đổi sau đó." })}
							</p>
						</div>

						{statusError && (
							<p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-3.5 py-2.5">
								{statusError}
							</p>
						)}

						<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => setIsStatusDialogOpen(false)}
								disabled={isSavingStatus}
								className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-50"
							>
								{t("cancel", { defaultMessage: "Hủy bỏ" })}
							</button>
							<button
								type="submit"
								disabled={isSavingStatus}
								className="inline-flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-4 py-2 rounded-[10px] shadow-xs hover:shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
							>
								<Check className="h-4 w-4" />
								<span>{isSavingStatus ? t("saving", { defaultMessage: "Đang lưu..." }) : t("saveChanges", { defaultMessage: "Lưu thay đổi" })}</span>
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Next Of Kin Add / Edit Dialog (Tasks 72, 80) */}
			<NextOfKinDialog
				patientId={patient.id}
				patientGender={patient.gender}
				kin={selectedKin}
				open={isKinDialogOpen}
				onOpenChange={setIsKinDialogOpen}
				onSuccess={reloadPatient}
			/>

			{/* Next Of Kin Delete Dialog (Task 74) */}
			<DeleteNextOfKinDialog
				kin={selectedDeleteKin}
				open={isDeleteKinDialogOpen}
				onOpenChange={setIsDeleteKinDialogOpen}
				onSuccess={reloadPatient}
			/>

			{/* Treatment Plan Detail Dialog (Task 82) */}
			<TreatmentPlanDetailDialog
				planId={selectedPlanId}
				open={isPlanDetailOpen}
				onOpenChange={setIsPlanDetailOpen}
				onRequestClosePlan={(id) => {
					setSelectedPlanId(id);
					setIsClosePlanOpen(true);
				}}
				onRequestReviewPlan={(id, currentAdherence) => {
					setSelectedPlanId(id);
					setReviewAdherenceState(currentAdherence);
					setIsReviewPlanOpen(true);
				}}
			/>

			{/* Treatment Plan Close Dialog (Task 83) */}
			<CloseTreatmentPlanDialog
				planId={selectedPlanId}
				open={isClosePlanOpen}
				onOpenChange={setIsClosePlanOpen}
				onSuccess={reloadPatient}
			/>

			{/* Treatment Plan Review Dialog (Task 84) */}
			<ReviewTreatmentPlanDialog
				planId={selectedPlanId}
				currentAdherence={reviewAdherenceState}
				open={isReviewPlanOpen}
				onOpenChange={setIsReviewPlanOpen}
				onSuccess={reloadPatient}
			/>
		</div>
	);
}

function DetailRow({
	label,
	value,
	bold = false,
	mono = false,
}: {
	label: string;
	value?: string | null;
	bold?: boolean;
	mono?: boolean;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="text-slate-400 font-normal shrink-0">{label}</span>
			<span
				className={`text-right text-slate-800 ${bold ? "font-bold" : "font-medium"} ${
					mono ? "tracking-wider font-mono" : ""
				}`}
			>
				{value || "—"}
			</span>
		</div>
	);
}
