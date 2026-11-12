"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Bug, FileText, MapPin, ShieldAlert } from "lucide-react";
import {
	DoctorPathogenItem,
	RiskFactorDto,
	SuspectedCauseDto,
} from "../types";
import { fetchRiskFactors, fetchSuspectedCauses } from "../api";
import { PathogenClassificationBadge } from "./PathogenClassificationBadge";


const SEVERITY_STYLES: Record<string, { label: string; className: string }> = {
	mild: { label: "Nhẹ", className: "bg-sky-100 text-sky-800" },
	moderate: { label: "Trung bình", className: "bg-amber-100 text-amber-800" },
	severe: { label: "Nặng", className: "bg-red-100 text-red-800" },
};

const TREATMENT_SITE_LABELS: Record<string, string> = {
	outpatient: "Ngoại trú",
	inpatient: "Nội trú",
	intensivecareunit: "Khoa ICU",
};

function SeverityTag({ severity }: { severity: string }) {
	const style = SEVERITY_STYLES[severity?.toLowerCase()] ?? {
		label: severity,
		className: "bg-slate-100 text-slate-700",
	};
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.className}`}
		>
			{style.label}
		</span>
	);
}

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
	const pathogenId = pathogen?.id;

	const {
		data,
		isLoading,
		error: queryErr,
	} = useQuery({
		queryKey: ["pathogens", "detail", pathogenId],
		queryFn: async () => {
			const [c, r] = await Promise.all([
				fetchSuspectedCauses(pathogenId!),
				fetchRiskFactors(pathogenId!),
			]);
			return { causes: c, riskFactors: r };
		},
		enabled: open && !!pathogenId,
	});

	const causes = data?.causes ?? [];
	const riskFactors = data?.riskFactors ?? [];
	const loadError = queryErr
		? queryErr instanceof Error
			? queryErr.message
			: "Không thể tải thông tin chi tiết."
		: null;

	if (!pathogen) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				style={{ borderRadius: "18px" }}
				className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto rounded-[18px] bg-white p-6 shadow-2xl border-none outline-none"
			>
				{/* Header */}
				<DialogHeader className="border-b border-slate-100 pb-3">
					<div className="flex items-center gap-3 pr-6">
						<div
							style={{ borderRadius: "10px" }}
							className="h-10 w-10 rounded-[10px] bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0 shadow-2xs"
						>
							<Bug className="h-5 w-5" />
						</div>
						<div>
							<div className="flex items-center gap-2 flex-wrap">
								<DialogTitle className="text-base font-bold text-slate-900 tracking-tight italic">
									{pathogen.name}
								</DialogTitle>
								<PathogenClassificationBadge
									classification={pathogen.classification}
								/>
							</div>
							<p className="text-[11px] text-slate-400 mt-0.5">
								Chi tiết tác nhân vi sinh
							</p>
							<p className="text-[10.5px] text-slate-400 font-mono mt-0.5 break-all">
								Mã: {pathogen.id}
							</p>
						</div>
					</div>
				</DialogHeader>

				{/* Body Content */}
				<div className="space-y-5 pt-2 text-[13px]">
					{/* Description */}
					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Mô tả sinh học</span>
						</div>
						<p
							style={{ borderRadius: "10px" }}
							className="text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-[10px] border border-slate-100"
						>
							{pathogen.description || "Chưa có mô tả cho tác nhân này."}
						</p>
					</div>

					{loadError && (
						<p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-3.5 py-2.5">
							{loadError}
						</p>
					)}

					{/* Suspected causes: severity + treatment site */}
					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<MapPin className="h-3.5 w-3.5 text-amber-500" />
							<span>Bối cảnh nghi ngờ tác nhân</span>
						</div>
						{isLoading ? (
							<p className="text-xs text-slate-400 pl-5">Đang tải...</p>
						) : causes.length > 0 ? (
							<div className="flex flex-wrap gap-2 pl-5">
								{causes.map((cause) => (
									<span
										key={cause.id}
										className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200/70 bg-slate-50 text-xs font-medium text-slate-700"
									>
										<span>{TREATMENT_SITE_LABELS[cause.treatmentSite?.toLowerCase()] ?? cause.treatmentSite}</span>
										<SeverityTag severity={cause.severity} />
									</span>
								))}
							</div>
						) : (
							<p className="text-xs text-slate-400 pl-5">
								Chưa có dữ liệu về mức độ và nơi điều trị liên quan.
							</p>
						)}
					</div>

					{/* Risk factors */}
					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<ShieldAlert className="h-3.5 w-3.5 text-red-500" />
							<span>Yếu tố nguy cơ nhiễm tác nhân</span>
						</div>
						{isLoading ? (
							<p className="text-xs text-slate-400 pl-5">Đang tải...</p>
						) : riskFactors.length > 0 ? (
							<div className="space-y-2 pl-5">
								{riskFactors.map((factor) => (
									<div
										key={factor.id}
										style={{ borderRadius: "10px" }}
										className="border border-slate-100 bg-[#F8FAFC] rounded-[10px] px-3 py-2"
									>
										<div className="flex items-start justify-between gap-2">
											<p className="text-xs font-semibold text-slate-800">
												{factor.criterion.name}
											</p>
											{factor.isCriticalFactor && (
												<span className="shrink-0 inline-flex items-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[10.5px] font-semibold">
													Yếu tố quan trọng
												</span>
											)}
										</div>
										<p className="text-[11px] text-slate-500 font-mono mt-0.5 break-all">
											{factor.criterion.formula}
										</p>
									</div>
								))}
							</div>
						) : (
							<p className="text-xs text-slate-400 pl-5">
								Chưa có yếu tố nguy cơ nào được ghi nhận.
							</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
