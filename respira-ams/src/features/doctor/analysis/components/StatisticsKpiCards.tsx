"use client";

import { FileText, CheckCircle2, FlaskConical } from "lucide-react";
import { KpiMetric } from "../types";

interface StatisticsKpiCardsProps {
	metrics: KpiMetric[];
}

export function StatisticsKpiCards({ metrics }: StatisticsKpiCardsProps) {
	const getIcon = (type: KpiMetric["type"]) => {
		switch (type) {
			case "diagnosis":
				return (
					<div
						style={{ borderRadius: "10px" }}
						className="h-8 w-8 rounded-[10px] bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0"
					>
						<FileText className="h-4 w-4" />
					</div>
				);
			case "treatment":
				return (
					<div
						style={{ borderRadius: "10px" }}
						className="h-8 w-8 rounded-[10px] bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"
					>
						<CheckCircle2 className="h-4 w-4" />
					</div>
				);
			case "microbiology":
				return (
					<div
						style={{ borderRadius: "10px" }}
						className="h-8 w-8 rounded-[10px] bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0"
					>
						<FlaskConical className="h-4 w-4" />
					</div>
				);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
			{metrics.map((item) => (
				<div
					key={item.id}
					style={{ borderRadius: "14px" }}
					className="bg-white rounded-[14px] border border-slate-100/90 p-5 shadow-2xs hover:shadow-xs transition-all duration-200"
				>
					<div className="flex items-center justify-between">
						<span className="text-xs sm:text-sm font-medium text-slate-600">
							{item.title}
						</span>
						{getIcon(item.type)}
					</div>

					<div className="flex items-baseline gap-2.5 mt-3">
						<span className="text-3xl font-bold tracking-tight text-slate-900">
							{item.value}
						</span>
						<span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/70">
							+{item.changePercent}%
						</span>
					</div>

					<p className="text-xs text-slate-400 mt-2">
						{item.subtitle}
					</p>
				</div>
			))}
		</div>
	);
}
