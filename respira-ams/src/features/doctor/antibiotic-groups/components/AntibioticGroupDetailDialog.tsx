"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Layers, FileText, Pill, Network } from "lucide-react";
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
	const [antibiotics, setAntibiotics] = useState<AntibioticSummaryDto[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (open && group?.id) {
			let isMounted = true;
			setIsLoading(true);
			fetchAntibioticsInGroup(group.id)
				.then((items) => {
					if (isMounted) {
						setAntibiotics(items);
					}
				})
				.catch(() => {
					if (isMounted) {
						setAntibiotics([]);
					}
				})
				.finally(() => {
					if (isMounted) {
						setIsLoading(false);
					}
				});
			return () => {
				isMounted = false;
			};
		} else {
			setAntibiotics([]);
		}
	}, [open, group?.id]);

	if (!group) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				style={{ borderRadius: "18px" }}
				className="sm:max-w-[540px] rounded-[18px] bg-white p-6 shadow-2xl border-none outline-none"
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
							<p className="text-slate-800 text-xs font-medium pl-5">
								{group.parentName}
							</p>
						</div>
					)}

					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Mô tả</span>
						</div>
						<p
							style={{ borderRadius: "10px" }}
							className="text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-[10px] border border-slate-100"
						>
							{group.description || "Chưa có mô tả."}
						</p>
					</div>

					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<Pill className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Kháng sinh thuộc nhóm</span>
						</div>
						{isLoading ? (
							<p className="text-xs text-slate-400 pl-5">Đang tải danh sách kháng sinh...</p>
						) : antibiotics.length > 0 ? (
							<div className="flex flex-wrap gap-2 pl-5">
								{antibiotics.map((abx) => (
									<span
										key={abx.id}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-[#0EA5E9] border border-sky-100"
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
