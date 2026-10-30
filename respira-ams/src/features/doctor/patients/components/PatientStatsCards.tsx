"use client";

import { StatFilter } from "../types";
import { cn } from "@/lib/utils";

interface PatientStatsCardsProps {
	total: number;
	attention: number;
	highRisk: number;
	activeFilter: StatFilter;
	onFilterChange: (filter: StatFilter) => void;
}

export function PatientStatsCards({
	total,
	attention,
	highRisk,
	activeFilter,
	onFilterChange,
}: PatientStatsCardsProps) {
	const formatCount = (num: number) => (num < 10 ? `0${num}` : `${num}`);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
			{/* Card 1: Tất cả ca bệnh */}
			<button
				type="button"
				onClick={() => onFilterChange("all")}
				className={cn(
					"bg-white rounded-[12px] px-5 py-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs",
					activeFilter === "all"
						? "border-2 border-sky-400 ring-1 ring-sky-200/50"
						: "border border-slate-100 hover:border-slate-200"
				)}
			>
				<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
					Tất cả ca bệnh
				</p>
				<p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
					{total}
				</p>
				<div className="h-1 w-32 bg-[#0EA5E9] rounded-full mt-2.5" />
			</button>

			{/* Card 2: Cần chú ý */}
			<button
				type="button"
				onClick={() => onFilterChange("attention")}
				className={cn(
					"bg-white rounded-[12px] px-5 py-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs",
					activeFilter === "attention"
						? "border-2 border-amber-400 ring-1 ring-amber-200/50"
						: "border border-slate-100 hover:border-slate-200"
				)}
			>
				<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
					Cần chú ý
				</p>
				<p className="text-2xl font-bold text-[#F59E0B] mt-1.5 tracking-tight">
					{formatCount(attention)}
				</p>
				<div className="h-1 w-8 bg-[#F59E0B] rounded-full mt-2.5" />
			</button>

			{/* Card 3: Nguy cơ cao */}
			<button
				type="button"
				onClick={() => onFilterChange("high")}
				className={cn(
					"bg-white rounded-[12px] px-5 py-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs",
					activeFilter === "high"
						? "border-2 border-red-500 ring-1 ring-red-200/50"
						: "border border-slate-100 hover:border-slate-200"
				)}
			>
				<p className="text-[10.5px] font-bold text-[#DC2626] uppercase tracking-wider">
					Nguy cơ cao
				</p>
				<p className="text-2xl font-bold text-[#DC2626] mt-1.5 tracking-tight">
					{formatCount(highRisk)}
				</p>
				<div className="h-1 w-3 bg-[#DC2626] rounded-full mt-2.5" />
			</button>
		</div>
	);
}
