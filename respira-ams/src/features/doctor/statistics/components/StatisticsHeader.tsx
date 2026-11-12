"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatisticsHeaderProps {
	onExport?: () => void;
	isExporting?: boolean;
}

export function StatisticsHeader({
	onExport,
	isExporting = false,
}: StatisticsHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
					Thống kê &amp; Giám sát Vi sinh Lâm sàng
				</h1>
				<p className="text-xs sm:text-sm text-slate-500 mt-1">
					Dữ liệu giám sát sử dụng kháng sinh, vi sinh lâm sàng và tình hình kháng thuốc AMR
				</p>
			</div>

			<Button
				onClick={onExport}
				disabled={isExporting}
				className="bg-[#0EA5E9] hover:bg-[#25B4F8] hover:scale-[1.02] text-white font-medium shadow-[0_2px_8px_rgba(14,165,233,0.25)] transition-all duration-200 flex items-center gap-2 h-10 px-4 text-sm shrink-0 cursor-pointer disabled:opacity-50"
				style={{ borderRadius: "12px" }}
			>
				{isExporting ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Đang xuất Excel...</span>
					</>
				) : (
					<>
						<Download className="h-4 w-4" />
						<span>Xuất báo cáo Vi sinh</span>
					</>
				)}
			</Button>
		</div>
	);
}
