"use client";

import { TimeRange } from "../types";
import { cn } from "@/lib/utils";

interface StatisticsTimeFilterProps {
	selectedRange: TimeRange;
	onRangeChange: (range: TimeRange) => void;
}

const FILTER_OPTIONS: { id: TimeRange; label: string }[] = [
	{ id: "30d", label: "30 ngày" },
	{ id: "quarter", label: "Quý này" },
	{ id: "year", label: "Năm nay" },
];

export function StatisticsTimeFilter({
	selectedRange,
	onRangeChange,
}: StatisticsTimeFilterProps) {
	return (
		<div
			style={{ borderRadius: "14px" }}
			className="bg-white rounded-[14px] border border-slate-100/90 p-3 sm:p-3.5 shadow-2xs"
		>
			<div
				style={{ borderRadius: "10px" }}
				className="inline-flex items-center gap-1 p-1 bg-slate-100/70 rounded-[10px]"
			>
				{FILTER_OPTIONS.map((option) => {
					const isActive = selectedRange === option.id;
					return (
						<button
							key={option.id}
							type="button"
							onClick={() => onRangeChange(option.id)}
							style={{ borderRadius: "8px" }}
							className={cn(
								"px-4 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-150 cursor-pointer select-none",
								isActive
									? "bg-white text-[#0EA5E9] shadow-xs border border-slate-200/60"
									: "text-slate-500 hover:text-slate-900 border border-transparent"
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
