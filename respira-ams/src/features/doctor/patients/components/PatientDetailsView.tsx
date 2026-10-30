"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, TrendingUp, Check, Users } from "lucide-react";
import { Patient, PatientStatus } from "../types";
import { dischargePatient, fetchPatientById, STATUS_TO_OUTCOME } from "../api";
import { PatientStatusBadge } from "./PatientStatusBadge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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
	const [patient, setPatient] = useState<Patient | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	// Quick modal for "Cập nhật trạng thái" (discharge)
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [statusValue, setStatusValue] = useState<DischargeStatus>("recovered");
	const [statusError, setStatusError] = useState<string | null>(null);
	const [isSavingStatus, setIsSavingStatus] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			setPatient(await fetchPatientById(patientId));
		} catch (err) {
			setLoadError(
				err instanceof Error ? err.message : "Không thể tải hồ sơ bệnh nhân."
			);
		} finally {
			setIsLoading(false);
		}
	}, [patientId]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void load();
	}, [load]);

	const handleUpdateStatus = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatusError(null);
		setIsSavingStatus(true);
		try {
			await dischargePatient(patientId, STATUS_TO_OUTCOME[statusValue]);
			setIsStatusDialogOpen(false);
			await load();
		} catch (err) {
			setStatusError(
				err instanceof Error ? err.message : "Không thể cập nhật trạng thái."
			);
		} finally {
			setIsSavingStatus(false);
		}
	};

	const backLink = (
		<Link
			href="/doctor/patients"
			className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#0EA5E9] hover:text-[#38BDF8] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group py-1"
			id="back-to-patients-list"
		>
			<ArrowLeft className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-1" />
			<span>Danh sách bệnh nhân</span>
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
						disabled={!canUpdateStatus}
						title={
							canUpdateStatus
								? undefined
								: "Bệnh nhân đã xuất viện, không thể cập nhật trạng thái"
						}
						style={{ borderRadius: "12px" }}
						className="inline-flex items-center gap-2.5 bg-white border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/70 text-[#0EA5E9] px-5 py-2.5 rounded-[12px] text-[13px] font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer h-[42px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:border-slate-200/90"
						id="btn-update-status"
					>
						<RefreshCw className="h-4 w-4 stroke-[2.2]" />
						<span>Cập nhật trạng thái</span>
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
							{patient.gender} · {patient.age} tuổi
						</p>
					</div>

					{/* Subtle Divider */}
					<div className="h-px bg-slate-100 my-5" />

					{/* Demographics Table */}
					<div className="space-y-4.5 text-xs">
						<DetailRow label="Ngày sinh" value={patient.birthDate} bold />
						<DetailRow label="Số điện thoại" value={patient.phone} />
						<DetailRow
							label="Số thẻ BHYT"
							value={patient.bhyt}
							bold
							mono
						/>
						<DetailRow
							label="Địa chỉ"
							value={[patient.address, patient.city].filter(Boolean).join(", ")}
						/>
						<DetailRow
							label="Thể trạng"
							value={`${patient.weight ?? "—"}kg - ${patient.height ?? "—"}cm`}
						/>
						<DetailRow
							label="Ngày nhập viện"
							value={formatDateTime(patient.admission)}
						/>
						<div className="flex items-center justify-between">
							<span className="text-slate-400 font-normal">Trạng thái</span>
							<PatientStatusBadge status={patient.status} />
						</div>
					</div>

					{/* Next of kin */}
					<div className="h-px bg-slate-100 my-5" />
					<div className="flex items-center gap-2 mb-3">
						<Users className="h-4 w-4 text-slate-400" />
						<h3 className="text-xs font-bold text-slate-900">Người thân</h3>
					</div>
					{patient.nextOfKins && patient.nextOfKins.length > 0 ? (
						<div className="space-y-3 text-xs">
							{patient.nextOfKins.map((kin) => (
								<div
									key={kin.id}
									className="flex items-center justify-between gap-3"
								>
									<div>
										<p className="font-semibold text-slate-800">{kin.fullName}</p>
										<p className="text-[11px] text-slate-400 mt-0.5">
											{kin.relationship}
										</p>
									</div>
									<span className="font-mono text-slate-600">
										{kin.phoneNumber}
									</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-xs text-slate-400">Chưa có thông tin người thân.</p>
					)}
				</div>

				{/* Right Card: Treatment Timeline */}
				<div className="w-full flex-1 bg-white rounded-[16px] p-6 border border-slate-100/90 shadow-2xs">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-[10px] bg-[#E0F2FE] text-[#0EA5E9] flex items-center justify-center shrink-0">
								<TrendingUp className="h-4.5 w-4.5 stroke-[2.2]" />
							</div>
							<div>
								<h3 className="text-sm font-bold text-slate-900">
									Tiến trình điều trị
								</h3>
								<p className="text-[11.5px] text-slate-400 mt-0.5">
									Danh sách mốc thời gian và trạng thái
								</p>
							</div>
						</div>

						<span className="text-[11.5px] font-medium text-slate-400">
							{timeline.length} mốc ghi nhận
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

			{/* Status Update Dialog */}
			<Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
				<DialogContent className="sm:max-w-[420px] rounded-[18px] bg-white p-6 shadow-2xl border-none">
					<DialogHeader className="pb-3 border-b border-slate-100">
						<DialogTitle className="text-base font-bold text-slate-900">
							Cập nhật trạng thái bệnh nhân
						</DialogTitle>
						<p className="text-xs text-slate-400 mt-0.5">
							{patient.name} ({patient.code})
						</p>
					</DialogHeader>

					<form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-700 block">
								Kết quả điều trị (xuất viện)
							</label>
							<select
								value={statusValue}
								onChange={(e) => setStatusValue(e.target.value as DischargeStatus)}
								className="w-full h-10 px-3 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] rounded-[10px] text-xs font-medium text-slate-800 outline-none"
							>
								<option value="recovered">Hồi phục</option>
								<option value="deceased">Tử vong</option>
								<option value="outOfScope">Ngoài phạm vi điều trị kháng sinh</option>
							</select>
							<p className="text-[11px] text-slate-400">
								Thao tác này sẽ ghi nhận xuất viện và không thể thay đổi sau đó.
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
								Hủy bỏ
							</button>
							<button
								type="submit"
								disabled={isSavingStatus}
								className="inline-flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-4 py-2 rounded-[10px] shadow-xs hover:shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
							>
								<Check className="h-4 w-4" />
								<span>{isSavingStatus ? "Đang lưu..." : "Lưu thay đổi"}</span>
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
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
