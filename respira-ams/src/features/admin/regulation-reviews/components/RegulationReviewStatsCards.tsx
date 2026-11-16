"use client";

import React from "react";
import { Stethoscope, UserCheck, UserX, MailCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RegulationReviewStats } from "../types";

interface RegulationReviewStatsCardsProps {
	stats: RegulationReviewStats;
}

export const RegulationReviewStatsCards = React.memo(
	function RegulationReviewStatsCards({ stats }: RegulationReviewStatsCardsProps) {
		const cards = [
			{
				title: "Hội đồng thẩm định",
				value: stats.total,
				subtitle: "Medical Regulation Reviewer",
				icon: Stethoscope,
				color: "text-sky-600",
				bgColor: "bg-sky-50 dark:bg-sky-950/40",
				borderColor: "border-sky-100 dark:border-sky-900/40",
			},
			{
				title: "Đang hoạt động",
				value: stats.active,
				subtitle: "Sẵn sàng duyệt hồ sơ",
				icon: UserCheck,
				color: "text-teal-600",
				bgColor: "bg-teal-50 dark:bg-teal-950/40",
				borderColor: "border-teal-100 dark:border-teal-900/40",
			},
			{
				title: "Đã tạm khóa",
				value: stats.inactive,
				subtitle: "Tạm dừng quyền thẩm định",
				icon: UserX,
				color: "text-rose-600",
				bgColor: "bg-rose-50 dark:bg-rose-950/40",
				borderColor: "border-rose-100 dark:border-rose-900/40",
			},
			{
				title: "Đã xác thực Email",
				value: stats.emailConfirmed,
				subtitle: "Tài khoản bảo mật cao",
				icon: MailCheck,
				color: "text-emerald-600",
				bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
				borderColor: "border-emerald-100 dark:border-emerald-900/40",
			},
		];

		return (
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
				{cards.map((card, idx) => {
					const Icon = card.icon;
					return (
						<Card
							key={idx}
							className="border shadow-xs hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 overflow-hidden"
						>
							<CardContent className="p-4 flex flex-col justify-between h-full">
								<div className="flex items-center justify-between mb-2">
									<span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 truncate">
										{card.title}
									</span>
									<div className={`p-2 rounded-xl ${card.bgColor} ${card.color} shrink-0`}>
										<Icon className="w-4 h-4" />
									</div>
								</div>
								<div>
									<div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
										{card.value}
									</div>
									<p className="text-[11px] text-slate-400 mt-0.5 truncate">
										{card.subtitle}
									</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		);
	}
);
