"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Layers, FileText, Pill, Network, Loader2, AlertCircle } from "lucide-react";
import { AntibioticGroupItem, AntibioticSummaryDto } from "../types";
import { fetchAntibioticsInGroup } from "../api";
import { AwareBadge } from "@/features/doctor/components/badges";

interface AntibioticGroupDetailDialogProps {
	group: AntibioticGroupItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AntibioticGroupDetailDialog({
	group,
	open,
	onOpenChange,
}: AntibioticGroupDetailDialogProps) {
	const groupId = group?.id;

	const {
		data: antibiotics = [],
		isLoading,
		error: queryErr,
	} = useQuery({
		queryKey: ["antibioticGroups", "detail", groupId],
		queryFn: () => fetchAntibioticsInGroup(groupId!),
		enabled: open && !!groupId,
	});

	const loadError = queryErr
		? queryErr instanceof Error
			? queryErr.message
			: "Không thể tải danh sách kháng sinh thuộc nhóm."
		: null;

	if (!group) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				style={{ borderRadius: "18px" }}
				className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[18px] bg-white p-6 shadow-2xl border-none outline-none"
			>
				<DialogHeader className="border-b border-slate-100 pb-3">
					<div className="flex items-center gap-3 pr-6">
						<div
							style={{ borderRadius: "10px" }}
							className="h-10 w-10 rounded-[10px] bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0 shadow-2xs"
						>
							<Layers className="h-5 w-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
								{group.name}
							</DialogTitle>
							<p className="text-[11px] text-slate-400 mt-0.5">
								Chi tiết nhóm kháng sinh
							</p>
							<p className="text-[10.5px] text-slate-400 font-mono mt-0.5 break-all">
								Mã: {group.id}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 pt-2 text-[13px]">
					{group.parentName && (
						<div>
							<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
								<Network className="h-3.5 w-3.5 text-sky-500" />
								<span>Thuộc nhóm cha</span>
							</div>
							<p className="text-slate-800 text-xs font-semibold pl-5">
								{group.parentName}
								{group.parentId && (
									<span className="block text-[11px] text-slate-400 font-mono font-normal mt-0.5">
										Mã nhóm cha: {group.parentId}
									</span>
								)}
							</p>
						</div>
					)}

					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Mô tả dược lý</span>
						</div>
						<p
							style={{ borderRadius: "10px" }}
							className="text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-[10px] border border-slate-100"
						>
							{group.description || "Chưa có mô tả cho nhóm kháng sinh này."}
						</p>
					</div>

					<div>
						<div className="flex items-center justify-between mb-1.5">
							<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
								<Pill className="h-3.5 w-3.5 text-[#0EA5E9]" />
								<span>Kháng sinh thuộc nhóm</span>
							</div>
							<span className="text-[11px] text-slate-400">
								{antibiotics.length} kháng sinh
							</span>
						</div>

						{isLoading ? (
							<div className="flex items-center gap-2 text-xs text-slate-400 py-3 pl-5">
								<Loader2 className="h-4 w-4 animate-spin text-[#0EA5E9]" />
								<span>Đang tải danh sách kháng sinh...</span>
							</div>
						) : loadError ? (
							<div className="flex items-center gap-2 rounded-[10px] bg-red-50 border border-red-100 p-3 text-xs text-red-700">
								<AlertCircle className="h-4 w-4 shrink-0" />
								<span>{loadError}</span>
							</div>
						) : antibiotics.length > 0 ? (
							<div className="flex flex-wrap gap-2 pl-5 pt-1">
								{antibiotics.map((abx) => (
									<span
										key={abx.id}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-[#0EA5E9] border border-sky-100 shadow-2xs"
									>
										<span>{abx.name}</span>
										{abx.classification && (
											<AwareBadge category={abx.classification} />
										)}
									</span>
								))}
							</div>
						) : (
							<p className="text-xs text-slate-400 pl-5">Chưa có kháng sinh nào thuộc nhóm này.</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
