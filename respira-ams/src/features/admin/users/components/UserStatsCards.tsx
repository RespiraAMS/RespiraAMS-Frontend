"use client";

import React from "react";
import { Stethoscope, Briefcase, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from "../types";

interface UserStatsCardsProps {
	stats: UserStats;
}

export const UserStatsCards = React.memo(function UserStatsCards({ stats }: UserStatsCardsProps) {
	const cards = [
		{
			title: "Tổng số Bác sĩ",
			value: stats.total,
			subtitle: "Hồ sơ y tế trong DB",
			icon: Users,
			color: "text-[#0EA5E9]",
			bgColor: "bg-sky-50 dark:bg-sky-950/40",
			borderColor: "border-sky-100 dark:border-sky-900/40",
		},
		{
			title: "Bác sĩ điều trị",
			value: stats.doctors,
			subtitle: "Bác sĩ lâm sàng (Doctor)",
			icon: Stethoscope,
			color: "text-emerald-600",
			bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
			borderColor: "border-emerald-100 dark:border-emerald-900/40",
		},
		{
			title: "Bác sĩ Trưởng khoa",
			value: stats.headDoctors,
			subtitle: "Quản lý (HeadDepartment)",
			icon: Briefcase,
			color: "text-purple-600",
			bgColor: "bg-purple-50 dark:bg-purple-950/40",
			borderColor: "border-purple-100 dark:border-purple-900/40",
		},
		{
			title: "Đang hoạt động",
			value: stats.active,
			subtitle: "Sẵn sàng nhận bệnh",
			icon: UserCheck,
			color: "text-teal-600",
			bgColor: "bg-teal-50 dark:bg-teal-950/40",
			borderColor: "border-teal-100 dark:border-teal-900/40",
		},
		{
			title: "Đã tạm khóa",
			value: stats.inactive,
			subtitle: "Tạm dừng quyền truy cập",
			icon: UserX,
			color: "text-rose-600",
			bgColor: "bg-rose-50 dark:bg-rose-950/40",
			borderColor: "border-rose-100 dark:border-rose-900/40",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
});

