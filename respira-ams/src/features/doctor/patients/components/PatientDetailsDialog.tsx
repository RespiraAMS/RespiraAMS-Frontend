"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Patient } from "../types";
import { PatientStatusBadge } from "./PatientStatusBadge";

interface PatientDetailsDialogProps {
	patient: Patient | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PatientDetailsDialog({
	patient,
	open,
	onOpenChange,
}: PatientDetailsDialogProps) {
	if (!patient) return null;

	const getRiskBadge = (risk: Patient["risk"]) => {
		if (risk === "high") {
			return (
				<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
					Nguy cơ cao
				</span>
			);
		}
		if (risk === "attention") {
			return (
				<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
					Cần chú ý
				</span>
			);
		}
		return (
			<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
				Bình thường
			</span>
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md rounded-[16px] bg-white p-6">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-slate-900">
						Hồ sơ chi tiết bệnh nhân
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2 text-sm">
					<div className="flex items-center justify-between pb-3 border-b border-slate-100">
						<div>
							<h3 className="font-bold text-base text-slate-900">{patient.name}</h3>
							<p className="text-xs text-slate-400 mt-0.5">{patient.code}</p>
						</div>
						<PatientStatusBadge status={patient.status} />
					</div>

					<div className="grid grid-cols-2 gap-4 text-xs">
						<div className="bg-slate-50 p-3 rounded-[10px]">
							<span className="text-slate-400 block mb-1">Tuổi & Giới tính</span>
							<span className="font-bold text-slate-800">
								{patient.age} tuổi · {patient.gender}
							</span>
						</div>

						<div className="bg-slate-50 p-3 rounded-[10px]">
							<span className="text-slate-400 block mb-1">Phòng bệnh</span>
							<span className="font-bold text-slate-800">{patient.room ?? "P.302"}</span>
						</div>

						<div className="bg-slate-50 p-3 rounded-[10px]">
							<span className="text-slate-400 block mb-1">Ngày tiếp nhận</span>
							<span className="font-bold text-slate-800">
								{patient.admissionDate ?? "10/10/2026"}
							</span>
						</div>

						<div className="bg-slate-50 p-3 rounded-[10px]">
							<span className="text-slate-400 block mb-1">Mức độ phân loại</span>
							{getRiskBadge(patient.risk)}
						</div>
					</div>

					<div className="bg-slate-50 p-3 rounded-[10px] text-xs">
						<span className="text-slate-400 block mb-1">Chẩn đoán lâm sàng</span>
						<span className="font-medium text-slate-800">
							{patient.diagnosis ?? "Viêm phổi mắc phải cộng đồng (CAP)"}
						</span>
					</div>
				</div>

				<DialogFooter className="pt-2">
					<Button
						type="button"
						onClick={() => onOpenChange(false)}
						className="w-full rounded-[10px] bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold"
					>
						Đóng
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
