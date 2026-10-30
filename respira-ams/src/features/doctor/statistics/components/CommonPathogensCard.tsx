"use client";

import { PathogenData } from "../types";
import { cn } from "@/lib/utils";

interface CommonPathogensCardProps {
	pathogens: PathogenData[];
}

export function CommonPathogensCard({ pathogens }: CommonPathogensCardProps) {
	return (
		<div
			style={{ borderRadius: "14px" }}
			className="h-full min-h-[460px] bg-white rounded-[14px] border border-slate-100/90 p-6 shadow-2xs flex flex-col justify-between"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-4 mb-3">
				<div>
					<h3 className="text-base font-bold text-slate-900">
						Tác nhân thường gặp
					</h3>
					<p className="text-xs text-slate-400 mt-0.5">
						Phân bố mẫu vi sinh phân lập dương tính
					</p>
				</div>

				<div
					style={{ borderRadius: "9999px" }}
					className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold shrink-0"
				>
					Top 5 vi khuẩn
				</div>
			</div>

			{/* Pathogens List */}
			<div className="space-y-4 my-auto py-2">
				{pathogens.map((item) => (
					<div key={item.id} className="group">
						{/* Title and Count */}
						<div className="flex items-center justify-between text-xs sm:text-sm">
							<span className="italic font-medium text-slate-800">
								{item.name}
							</span>
							<span className="font-bold text-slate-900">
								{item.count}
							</span>
						</div>

						{/* Progress Bar */}
						<div
							style={{ borderRadius: "9999px" }}
							className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1.5"
						>
							<div
								className="h-full rounded-full transition-all duration-700 ease-out"
								style={{
									width: `${item.percentage}%`,
									backgroundColor: item.barColor,
									borderRadius: "9999px",
								}}
							/>
						</div>

						{/* Sub-info */}
						<div className="flex items-center justify-between text-[11px] mt-1 text-slate-400">
							<span>{item.sensitivityText}</span>
							<span
								className={cn(
									item.isWarning
										? cn("font-semibold", item.warningColor || "text-amber-500")
										: "text-slate-400"
								)}
							>
								{item.extraInfo}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
