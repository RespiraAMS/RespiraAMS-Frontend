"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Layers, FileText, Activity, Pill } from "lucide-react";
import { AntibioticGroupItem } from "../types";

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
					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Mô tả</span>
						</div>
						<p
							style={{ borderRadius: "10px" }}
							className="text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-[10px] border border-slate-100"
						>
							{group.description}
						</p>
					</div>

					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
							<Activity className="h-3.5 w-3.5 text-emerald-500" />
							<span>Cơ chế tác dụng</span>
						</div>
						<p className="text-slate-600 text-xs pl-5">{group.mechanism}</p>
					</div>

					<div>
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
							<Pill className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Kháng sinh thuộc nhóm</span>
						</div>
						<div className="flex flex-wrap gap-1.5 pl-5">
							{group.antibiotics.map((abx) => (
								<span
									key={abx}
									className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-[#0EA5E9] border border-sky-100"
								>
									{abx}
								</span>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
