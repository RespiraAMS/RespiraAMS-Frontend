"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle,
	FileText,
	Layers,
	Loader2,
	Pill,
	ShieldAlert,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AntibioticResult } from "../types";
import { AwareBadge } from "./AwareBadge";
import {
	fetchAntibioticById,
	formatCrclRange,
	translateRoute,
} from "../services/antibioticApi";

interface AntibioticDetailDialogProps {
	antibioticId: string | null;
	onOpenChange: (open: boolean) => void;
}

export function AntibioticDetailDialog({
	antibioticId,
	onOpenChange,
}: AntibioticDetailDialogProps) {
	const {
		data: antibiotic = null,
		isLoading: loading,
		error: queryErr,
	} = useQuery({
		queryKey: ["antibiotics", "detail", antibioticId],
		queryFn: () => fetchAntibioticById(antibioticId!),
		enabled: !!antibioticId,
	});

	const error = queryErr
		? queryErr instanceof Error
			? queryErr.message
			: "Không thể tải chi tiết kháng sinh."
		: null;

	const dosages = antibiotic?.dosages ?? [];
	const standardDosages = dosages.filter((d) => !d.crcl);
	const gfrDosages = dosages.filter((d) => !!d.crcl);
	const group = antibiotic?.antibioticGroup;

	return (
		<Dialog open={!!antibioticId} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex flex-wrap items-center gap-2.5 text-lg font-bold text-slate-900">
						<span className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center">
							<Pill className="h-4.5 w-4.5 text-[#0EA5E9] -rotate-45" />
						</span>
						<span>{antibiotic?.name ?? "Chi tiết kháng sinh"}</span>
						{antibiotic && <AwareBadge value={antibiotic.classification} />}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500">
						Thông tin nhóm thuốc, phân loại AWaRe và liều dùng
					</DialogDescription>
				</DialogHeader>

				{loading && (
					<div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
						<Loader2 className="h-6 w-6 animate-spin text-[#0EA5E9]" />
						<span className="text-xs">Đang tải chi tiết kháng sinh...</span>
					</div>
				)}

				{error && !loading && (
					<div className="flex items-center gap-2 rounded-[10px] bg-red-50 border border-red-100 p-3 text-xs text-red-700">
						<AlertCircle className="h-4 w-4 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{antibiotic && !loading && (
					<div className="space-y-5">
						{/* Nhóm kháng sinh */}
						<section className="rounded-[12px] border border-slate-100 bg-slate-50/70 p-4 space-y-2.5">
							<div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">
								<Layers className="h-3.5 w-3.5 text-[#0EA5E9]" />
								Nhóm kháng sinh
							</div>
							<p className="text-sm font-bold text-slate-800">
								{group?.name || "Chưa phân nhóm"}
							</p>
							{group?.parentName && (
								<p className="text-xs text-slate-500">
									Nhóm cha:{" "}
									<span className="font-semibold text-slate-700">
										{group.parentName}
									</span>
								</p>
							)}
							{group?.description && (
								<div className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed">
									<FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
									<span>{group.description}</span>
								</div>
							)}
						</section>

						{/* Liều chuẩn */}
						<section className="space-y-2.5">
							<div className="flex items-center gap-2">
								<CheckCircle className="h-4 w-4 text-[#0EA5E9]" />
								<h3 className="text-[14px] font-bold text-slate-900">
									Liều dùng chuẩn
								</h3>
								<span className="text-[11px] text-slate-400">
									{standardDosages.length} liều
								</span>
							</div>
							{standardDosages.length === 0 ? (
								<p className="rounded-[10px] border border-slate-100 p-4 text-center text-xs text-slate-400">
									Chưa có thông tin liều chuẩn.
								</p>
							) : (
								<div className="rounded-[12px] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
									{standardDosages.map((d, i) => (
										<div key={d.id || i} className="p-3.5 space-y-1">
											<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
												{translateRoute(d.routeOfAdministration)}
											</span>
											<p className="text-[13.5px] font-bold text-slate-800 leading-snug">
												{d.dose}
											</p>
										</div>
									))}
								</div>
							)}
						</section>

						{/* Chỉnh liều theo GFR */}
						<section className="space-y-2.5">
							<div className="flex items-center gap-2">
								<ShieldAlert className="h-4 w-4 text-amber-500" />
								<h3 className="text-[14px] font-bold text-slate-900">
									Điều chỉnh liều theo chức năng thận (GFR / CrCl)
								</h3>
								<span className="text-[11px] text-slate-400">
									{gfrDosages.length} mốc
								</span>
							</div>
							{gfrDosages.length === 0 ? (
								<p className="rounded-[10px] border border-slate-100 p-4 text-center text-xs text-slate-400">
									Chưa có dữ liệu chỉnh liều theo GFR.
								</p>
							) : (
								<div className="space-y-2">
									{gfrDosages.map((d, i) => (
										<div
											key={d.id || i}
											className="rounded-[12px] border border-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="text-[13.5px] font-bold text-slate-900">
														{formatCrclRange(d.crcl)}
													</span>
													<span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[4px]">
														{translateRoute(d.routeOfAdministration)}
													</span>
												</div>
												<p className="text-xs text-slate-600 font-medium leading-relaxed">
													{d.dose}
												</p>
											</div>
											<span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0EA5E9] text-xs font-semibold shrink-0">
												Chỉnh liều
											</span>
										</div>
									))}
								</div>
							)}
						</section>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default AntibioticDetailDialog;

