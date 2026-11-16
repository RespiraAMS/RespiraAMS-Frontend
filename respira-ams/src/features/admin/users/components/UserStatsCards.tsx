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
			color: "text-primary",
			bgColor: "bg-primary/10 dark:bg-primary/10",
			borderColor: "border-primary/30 dark:border-primary/30",
		},
		{
			title: "Bác sĩ lâm sàng",
			value: stats.doctors,
			subtitle: "Khoa phòng điều trị",
			icon: Stethoscope,
			color: "text-success",
			bgColor: "bg-success/10 dark:bg-success/10",
			borderColor: "border-success/30 dark:border-success/30",
		},
		{
			title: "Trưởng khoa & Quản lý",
			value: stats.managers,
			subtitle: "Phê duyệt & giám sát",
			icon: Briefcase,
			color: "text-warning",
			bgColor: "bg-warning/10 dark:bg-warning/10",
			borderColor: "border-warning/30 dark:border-warning/30",
		},
		{
			title: "Quản trị viên",
			value: stats.admins,
			subtitle: "Toàn quyền hệ thống",
			icon: ShieldAlert,
			color: "text-info",
			bgColor: "bg-info/10 dark:bg-info/10",
			borderColor: "border-info/30 dark:border-info/30",
		},
		{
			title: "Đang hoạt động",
			value: stats.active,
			subtitle: `${stats.inactive} tài khoản tạm khóa`,
			icon: CheckCircle2,
			color: "text-success",
			bgColor: "bg-success/10 dark:bg-success/10",
			borderColor: "border-success/30 dark:border-success/30",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
			{cards.map((card, idx) => {
				const Icon = card.icon;
				return (
					<Card
						key={idx}
						className="border shadow-xs hover:shadow-md transition-all duration-200 bg-surface dark:bg-surface overflow-hidden"
					>
						<CardContent className="p-4 flex flex-col justify-between h-full">
							<div className="flex items-center justify-between mb-2">
								<span className="text-[12px] font-semibold text-text-secondary dark:text-text-tertiary truncate">
									{card.title}
								</span>
								<div className={`p-2 rounded-xl ${card.bgColor} ${card.color} shrink-0`}>
									<Icon className="w-4 h-4" />
								</div>
							</div>
							<div>
								<div className="text-2xl font-extrabold text-text-primary dark:text-primary-foreground tracking-tight">
									{card.value}
								</div>
								<p className="text-[11px] text-text-tertiary mt-0.5 truncate">
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

