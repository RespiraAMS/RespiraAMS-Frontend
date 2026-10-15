"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatisticsHeaderProps {
	onExport?: () => void;
}

export function StatisticsHeader({ onExport }: StatisticsHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
					Thống kê &amp; Giám sát Vi sinh Lâm sàng
				</h1>
			</div>

			<Button
				onClick={onExport}
				className="bg-[#0EA5E9] hover:bg-[#25B4F8] hover:scale-[1.02] text-white font-medium shadow-[0_2px_8px_rgba(14,165,233,0.25)] transition-all duration-200 flex items-center gap-2 h-10 px-4 text-sm shrink-0"
				style={{ borderRadius: "12px" }}
			>
				<Download className="h-4 w-4" />
				<span>Xuất báo cáo Vi sinh</span>
			</Button>
		</div>
	);
}
