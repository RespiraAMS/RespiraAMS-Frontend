"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AuditLogStats } from "../types";

interface AuditLogStatsCardsProps {
	stats: AuditLogStats;
	isLoading?: boolean;
}

export function AuditLogStatsCards({ stats, isLoading = false }: AuditLogStatsCardsProps) {
	const t = useTranslations("admin.auditLogs");

	const cards = [
		{
			title: t("totalEvents"),
			value: stats.total,
			subtitle: `${stats.uniqueActorsCount} ${t("uniqueActorsSuffix", { defaultMessage: "tác nhân & hệ thống ghi nhận" })}`,
			icon: ShieldCheck,
			color: "text-[#0EA5E9]",
			bg: "bg-sky-50",
		},
		{
			title: t("successfulEvents"),
			value: stats.successCount,
			subtitle: `${t("successRatePrefix", { defaultMessage: "Tỷ lệ thành công đạt" })} ${stats.successRatePercent}%`,
			icon: CheckCircle2,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
		},
		{
			title: t("warningEvents"),
			value: stats.warningCount,
			subtitle: t("warningSubtitle", { defaultMessage: "Cần lưu ý & theo dõi đặc quyền" }),
			icon: AlertTriangle,
			color: "text-amber-600",
			bg: "bg-amber-50",
		},
		{
			title: t("errorEvents"),
			value: stats.errorCount,
			subtitle: t("errorSubtitle", { defaultMessage: "Sự cố phân tán & vi phạm bảo mật" }),
			icon: AlertCircle,
			color: "text-red-600",
			bg: "bg-red-50",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<Card
						key={card.title}
						className="border shadow-xs hover:shadow-md transition-all duration-200 bg-white overflow-hidden"
					>
						<CardContent className="p-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-[12px] font-semibold text-slate-500">{card.title}</span>
								<div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
									<Icon className="w-4 h-4" />
								</div>
							</div>
							<div className="text-2xl font-extrabold text-slate-900 tracking-tight">
								{isLoading ? "—" : card.value.toLocaleString()}
							</div>
							<p className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtitle}</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

