"use client";

import { StatFilter } from "../types";
import { cn } from "@/lib/utils";

interface PatientStatsCardsProps {
	total: number;
	male: number;
	female: number;
	activeFilter: StatFilter;
	onFilterChange: (filter: StatFilter) => void;
}

export function PatientStatsCards({
	total,
	male,
	female,
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
					{formatCount(total)}
				</p>
				<div className="h-1 w-32 bg-[#0EA5E9] rounded-full mt-2.5" />
			</button>

			{/* Card 2: Nam */}
			<button
				type="button"
				onClick={() => onFilterChange("Male")}
				className={cn(
					"bg-white rounded-[12px] px-5 py-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs",
					activeFilter === "Male"
						? "border-2 border-blue-500 ring-1 ring-blue-200/50"
						: "border border-slate-100 hover:border-slate-200"
				)}
			>
				<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
					Bệnh nhân nam
				</p>
				<p className="text-2xl font-bold text-[#2563EB] mt-1.5 tracking-tight">
					{formatCount(male)}
				</p>
				<div className="h-1 w-8 bg-[#2563EB] rounded-full mt-2.5" />
			</button>

			{/* Card 3: Nữ */}
			<button
				type="button"
				onClick={() => onFilterChange("Female")}
				className={cn(
					"bg-white rounded-[12px] px-5 py-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs",
					activeFilter === "Female"
						? "border-2 border-pink-400 ring-1 ring-pink-200/50"
						: "border border-slate-100 hover:border-slate-200"
				)}
			>
				<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
					Bệnh nhân nữ
				</p>
				<p className="text-2xl font-bold text-[#DB2777] mt-1.5 tracking-tight">
					{formatCount(female)}
				</p>
				<div className="h-1 w-3 bg-[#DB2777] rounded-full mt-2.5" />
			</button>
		</div>
	);
}
