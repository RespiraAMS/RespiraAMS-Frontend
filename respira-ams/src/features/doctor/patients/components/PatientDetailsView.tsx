"use client";

import { useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	RefreshCw,
	PlusCircle,
	TrendingUp,
	Check,
} from "lucide-react";
import { Patient, TreatmentMilestone } from "../types";
import { DEFAULT_TREATMENT_TIMELINE, INITIAL_PATIENTS } from "../mockData";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface PatientDetailsViewProps {
	patientId?: string;
	initialPatient?: Patient;
}

export function PatientDetailsView({
	patientId = "1",
	initialPatient,
}: PatientDetailsViewProps) {
	// Look up patient or fallback to first patient (Nguyen Minh Khoi)
	const basePatient =
		initialPatient ??
		INITIAL_PATIENTS.find((p) => p.id === patientId) ??
		INITIAL_PATIENTS[0];

	const [patient, setPatient] = useState<Patient>(basePatient);
	const [timeline, setTimeline] = useState<TreatmentMilestone[]>(
		basePatient.timeline ?? DEFAULT_TREATMENT_TIMELINE
	);

	// Quick modal for "Cập nhật trạng thái"
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [statusValue, setStatusValue] = useState(patient.status);

	// Quick modal for "Thêm điều trị"
	const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
	const [newTreatmentTitle, setNewTreatmentTitle] = useState("");
	const [newTreatmentType, setNewTreatmentType] = useState<
		"treating" | "completed" | "admitted"
	>("treating");

	const handleUpdateStatus = (e: React.FormEvent) => {
		e.preventDefault();
		setPatient((prev) => ({ ...prev, status: statusValue }));
		setIsStatusDialogOpen(false);
	};

	const handleAddTreatment = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTreatmentTitle.trim()) return;

		const labels = {
			treating: "Đang điều trị",
			completed: "Đã hoàn thành",
			admitted: "Tiếp nhận",
		};

		const newMilestone: TreatmentMilestone = {
			id: `tl-${Date.now()}`,
			title: newTreatmentTitle.trim(),
			time: `Bắt đầu: Hôm nay · ${new Date().toLocaleTimeString("vi-VN", {
				hour: "2-digit",
				minute: "2-digit",
			})}`,
			status: newTreatmentType,
			statusLabel: labels[newTreatmentType],
			type:
				newTreatmentType === "treating"
					? "active"
					: newTreatmentType === "completed"
						? "completed"
						: "admitted",
		};

		setTimeline((prev) => [newMilestone, ...prev]);
		setNewTreatmentTitle("");
		setIsAddTreatmentOpen(false);
	};

	return (
		<div className="p-6 max-w-[1300px] mx-auto space-y-6">
			{/* Top Bar: Back navigation & Action Buttons */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<Link
					href="/doctor/patients"
					className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#0EA5E9] hover:text-[#38BDF8] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group py-1"
					id="back-to-patients-list"
				>
					<ArrowLeft className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-1" />
					<span>Danh sách bệnh nhân</span>
				</Link>

				<div className="flex items-center gap-3">
					{/* Button Cap nhat trang thai */}
					<button
						type="button"
						onClick={() => setIsStatusDialogOpen(true)}
						style={{ borderRadius: "12px" }}
						className="inline-flex items-center gap-2.5 bg-white border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/70 text-[#0EA5E9] px-5 py-2.5 rounded-[12px] text-[13px] font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer h-[42px]"
						id="btn-update-status"
					>
						<RefreshCw className="h-4 w-4 stroke-[2.2]" />
						<span>Cập nhật trạng thái</span>
					</button>

					{/* Button Them dieu tri */}
					<button
						type="button"
						onClick={() => setIsAddTreatmentOpen(true)}
						style={{ borderRadius: "12px" }}
						className="inline-flex items-center gap-2.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white px-5 py-2.5 rounded-[12px] text-[13px] font-semibold shadow-xs hover:shadow-md hover:shadow-sky-500/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer h-[42px]"
						id="btn-add-treatment"
					>
						<PlusCircle className="h-4 w-4 stroke-[2.2]" />
						<span>Thêm điều trị</span>
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
						<div className="flex items-center justify-between">
							<span className="text-slate-400 font-normal">Ngày sinh</span>
							<span className="font-bold text-slate-800">
								{patient.birthDate ?? "12/08/1970"}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-slate-400 font-normal">Số thẻ BHYT</span>
							<span className="font-bold text-slate-900 tracking-wider font-mono">
								{patient.bhyt ?? "DN  4  01  0012345678"}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-slate-400 font-normal">Địa chỉ</span>
							<span className="font-medium text-slate-800">
								{patient.address ?? "Ninh Kiều, Cần Thơ"}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-slate-400 font-normal">Thể trạng</span>
							<span className="font-medium text-slate-800">
								{patient.weightHeight ?? "62kg - 182cm"}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-slate-400 font-normal">Trạng thái</span>
							<span className="font-medium text-slate-800">
								{patient.status === "treating"
									? "Đang điều trị"
									: patient.status === "recovered"
										? "Hồi phục"
										: "Tử vong"}
							</span>
						</div>
					</div>
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
									Danh sách mốc thời gian, loại điều trị và trạng thái
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
							const isGreen = item.status === "treating";
							const isBlue = item.status === "completed";
							const isAdmitted = item.status === "admitted";

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
									<div>
										{isGreen && (
											<span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A]">
												Đang điều trị
											</span>
										)}
										{isBlue && (
											<span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E2E8F0] text-[#475569]">
												Đã hoàn thành
											</span>
										)}
										{isAdmitted && (
											<span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E0F2FE] text-[#0284C7]">
												Tiếp nhận
											</span>
										)}
									</div>
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
								Trạng thái điều trị
							</label>
							<select
								value={statusValue}
								onChange={(e) =>
									setStatusValue(e.target.value as Patient["status"])
								}
								className="w-full h-10 px-3 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] rounded-[10px] text-xs font-medium text-slate-800 outline-none"
							>
								<option value="treating">Đang điều trị</option>
								<option value="recovered">Hồi phục</option>
								<option value="deceased">Tử vong</option>
							</select>
						</div>

						<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => setIsStatusDialogOpen(false)}
								className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
							>
								Hủy bỏ
							</button>
							<button
								type="submit"
								className="inline-flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-4 py-2 rounded-[10px] shadow-xs hover:shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
							>
								<Check className="h-4 w-4" />
								<span>Lưu thay đổi</span>
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Add Treatment Dialog */}
			<Dialog open={isAddTreatmentOpen} onOpenChange={setIsAddTreatmentOpen}>
				<DialogContent className="sm:max-w-[460px] rounded-[18px] bg-white p-6 shadow-2xl border-none">
					<DialogHeader className="pb-3 border-b border-slate-100">
						<DialogTitle className="text-base font-bold text-slate-900">
							Thêm mốc điều trị mới
						</DialogTitle>
						<p className="text-xs text-slate-400 mt-0.5">
							Ghi nhận chỉ định hoặc phác đồ điều trị mới cho bệnh nhân
						</p>
					</DialogHeader>

					<form onSubmit={handleAddTreatment} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-700 block">
								Tên mốc / Phác đồ điều trị <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								value={newTreatmentTitle}
								onChange={(e) => setNewTreatmentTitle(e.target.value)}
								placeholder="VD: Kháng sinh xuống thang (Vancomycin)"
								required
								className="w-full h-10 px-3.5 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 outline-none"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-700 block">
								Trạng thái ghi nhận
							</label>
							<select
								value={newTreatmentType}
								onChange={(e) =>
									setNewTreatmentType(
										e.target.value as "treating" | "completed" | "admitted"
									)
								}
								className="w-full h-10 px-3 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] rounded-[10px] text-xs font-medium text-slate-800 outline-none"
							>
								<option value="treating">Đang điều trị</option>
								<option value="completed">Đã hoàn thành</option>
								<option value="admitted">Tiếp nhận</option>
							</select>
						</div>

						<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => setIsAddTreatmentOpen(false)}
								className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
							>
								Hủy bỏ
							</button>
							<button
								type="submit"
								className="inline-flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-4 py-2 rounded-[10px] shadow-xs hover:shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
							>
								<Check className="h-4 w-4" />
								<span>Ghi nhận</span>
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
