"use client";

import React from "react";
import { Users, Stethoscope, Briefcase, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from "../types";

interface UserStatsCardsProps {
	stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
	const cards = [
		{
			title: "Tổng người dùng",
			value: stats.total,
			subtitle: "Tài khoản trong hệ thống",
			icon: Users,
			color: "text-[#0EA5E9]",
			bgColor: "bg-sky-50 dark:bg-sky-950/40",
			borderColor: "border-sky-100 dark:border-sky-900/40",
		},
		{
			title: "Bác sĩ lâm sàng",
			value: stats.doctors,
			subtitle: "Khoa phòng điều trị",
			icon: Stethoscope,
			color: "text-emerald-600",
			bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
			borderColor: "border-emerald-100 dark:border-emerald-900/40",
		},
		{
			title: "Trưởng khoa & Quản lý",
			value: stats.managers,
			subtitle: "Phê duyệt & giám sát",
			icon: Briefcase,
			color: "text-purple-600",
			bgColor: "bg-purple-50 dark:bg-purple-950/40",
			borderColor: "border-purple-100 dark:border-purple-900/40",
		},
		{
			title: "Quản trị viên",
			value: stats.admins,
			subtitle: "Toàn quyền hệ thống",
			icon: ShieldAlert,
			color: "text-indigo-600",
			bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
			borderColor: "border-indigo-100 dark:border-indigo-900/40",
		},
		{
			title: "Đang hoạt động",
			value: stats.active,
			subtitle: `${stats.inactive} tài khoản tạm khóa`,
			icon: CheckCircle2,
			color: "text-teal-600",
			bgColor: "bg-teal-50 dark:bg-teal-950/40",
			borderColor: "border-teal-100 dark:border-teal-900/40",
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
}

