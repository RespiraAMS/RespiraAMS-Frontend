"use client";

import { useTranslations } from "next-intl";
import { FileText, CheckCircle2, PauseCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useProtocolCount } from "../queries";

export function ProtocolStatsCards() {
	const t = useTranslations("admin.protocols");
	const total = useProtocolCount(null);
	const applied = useProtocolCount(true);
	const notApplied = useProtocolCount(false);

	const cards = [
		{
			title: t("totalProtocols", { defaultMessage: "Tổng số phác đồ" }),
			value: total.data,
			loading: total.isLoading,
			subtitle: t("protocolsSubtitle", { defaultMessage: "Phác đồ / thang điểm lâm sàng" }),
			icon: FileText,
			color: "text-primary",
			bg: "bg-primary/10",
		},
		{
			title: t("applied", { defaultMessage: "Đang áp dụng" }),
			value: applied.data,
			loading: applied.isLoading,
			subtitle: t("appliedSubtitle", { defaultMessage: "Dùng trong chẩn đoán" }),
			icon: CheckCircle2,
			color: "text-success",
			bg: "bg-success/10",
		},
		{
			title: t("notApplied", { defaultMessage: "Chưa áp dụng" }),
			value: notApplied.data,
			loading: notApplied.isLoading,
			subtitle: t("notAppliedSubtitle", { defaultMessage: "Bản nháp / phiên bản cũ" }),
			icon: PauseCircle,
			color: "text-warning",
			bg: "bg-warning/10",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<Card
						key={card.title}
						className="border shadow-xs hover:shadow-md transition-all duration-200 bg-surface overflow-hidden"
					>
						<CardContent className="p-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-[12px] font-semibold text-text-secondary">{card.title}</span>
								<div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
									<Icon className="w-4 h-4" />
								</div>
							</div>
							<div className="text-2xl font-extrabold text-text-primary tracking-tight">
								{card.loading ? "—" : card.value ?? 0}
							</div>
							<p className="text-[11px] text-text-tertiary mt-0.5">{card.subtitle}</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

