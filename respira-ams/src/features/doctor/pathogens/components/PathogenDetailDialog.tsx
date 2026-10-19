"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DoctorPathogenItem } from "../types";
import { PathogenClassificationBadge } from "./PathogenClassificationBadge";
import { Bug, Activity, Pill, FileText } from "lucide-react";

interface PathogenDetailDialogProps {
	pathogen: DoctorPathogenItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PathogenDetailDialog({
	pathogen,
	open,
	onOpenChange,
}: PathogenDetailDialogProps) {
	if (!pathogen) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				style={{ borderRadius: "18px" }}
				className="sm:max-w-[540px] rounded-[18px] bg-white p-6 shadow-2xl border-none outline-none"
			>
				<DialogHeader className="border-b border-slate-100 pb-3">
					<div className="flex items-center justify-between gap-3 pr-6">
						<div className="flex items-center gap-3">
							<div
								style={{ borderRadius: "10px" }}
								className="h-10 w-10 rounded-[10px] bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0 shadow-2xs"
							>
								<Bug className="h-5 w-5" />
							</div>
							<div>
								<DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
									{pathogen.name}
								</DialogTitle>
								<p className="text-[11px] text-slate-400 mt-0.5">
									Chi tiết tác nhân gây bệnh
								</p>
							</div>
						</div>
						<PathogenClassificationBadge classification={pathogen.classification} />
					</div>
				</DialogHeader>

				<div className="space-y-4 pt-2 text-[13px]">
					{/* Description */}
					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Mô tả sinh học</span>
						</div>
						<p className="text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-[10px] border border-slate-100">
							{pathogen.description}
						</p>
					</div>

					{/* Characteristics */}
					{pathogen.characteristics && (
						<div>
							<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
								<Activity className="h-3.5 w-3.5 text-emerald-500" />
								<span>Đặc điểm vi sinh</span>
							</div>
							<p className="text-slate-600 text-xs pl-5">
								{pathogen.characteristics}
							</p>
						</div>
					)}

					{/* Common Diseases */}
					{pathogen.commonDiseases && pathogen.commonDiseases.length > 0 && (
						<div>
							<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
								<Activity className="h-3.5 w-3.5 text-amber-500" />
								<span>Bệnh lý thường gặp</span>
							</div>
							<div className="flex flex-wrap gap-1.5 pl-5">
								{pathogen.commonDiseases.map((disease) => (
									<span
										key={disease}
										className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
									>
										{disease}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Recommended Antibiotics */}
					{pathogen.recommendedAntibiotics && pathogen.recommendedAntibiotics.length > 0 && (
						<div>
							<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
								<Pill className="h-3.5 w-3.5 text-[#0EA5E9]" />
								<span>Kháng sinh khuyến nghị ban đầu</span>
							</div>
							<div className="flex flex-wrap gap-1.5 pl-5">
								{pathogen.recommendedAntibiotics.map((abx) => (
									<span
										key={abx}
										className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-[#0EA5E9] border border-sky-100"
									>
										{abx}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
