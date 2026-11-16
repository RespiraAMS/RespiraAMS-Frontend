"use client";

import { useTranslations } from "next-intl";
import { Pill, Bug, Server, ClipboardList } from "lucide-react";
import { DashboardMetrics } from "../types";

interface DashboardStatsCardsProps {
	metrics: DashboardMetrics;
}

export function DashboardStatsCards({ metrics }: DashboardStatsCardsProps) {
	const t = useTranslations("admin.dashboard");
	const formatCount = (num: number) => (num < 10 ? `0${num}` : `${num}`);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Card 1: Tổng phác đồ điều trị */}
			<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider">
						{t("cardTreatments", { defaultMessage: "Phác đồ điều trị" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
						<ClipboardList className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-text-primary mt-2 tracking-tight">
					{formatCount(metrics.totalTreatments)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>
						{t("protocolsSubtitle", {
							defaultMessage: "Quy trình & phác đồ lâm sàng",
						})}
					</span>
				</div>
				<div className="h-1 w-20 bg-primary rounded-full mt-2" />
			</div>

			{/* Card 2: Danh mục Kháng sinh */}
			<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider">
						{t("cardAntibiotics", { defaultMessage: "Danh mục Kháng sinh" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-info/10 text-info">
						<Pill className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-info mt-2 tracking-tight">
					{formatCount(metrics.totalAntibiotics)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>{metrics.totalAntibioticGroups} {t("groupsSuffix", { defaultMessage: "nhóm kháng sinh" })}</span>
				</div>
				<div className="h-1 w-16 bg-info rounded-full mt-2" />
			</div>

			{/* Card 3: Tác nhân gây bệnh */}
			<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider">
						{t("cardPathogens", { defaultMessage: "Tác nhân gây bệnh" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-success/10 text-success">
						<Bug className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-success mt-2 tracking-tight">
					{formatCount(metrics.totalPathogens)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>{t("pathogensSub", { defaultMessage: "Vi khuẩn & Mầm bệnh hô hấp" })}</span>
				</div>
				<div className="h-1 w-16 bg-success rounded-full mt-2" />
			</div>

			{/* Card 4: Độ sẵn sàng hạ tầng */}
			<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider">
						{t("cardInfrastructure", { defaultMessage: "Độ sẵn sàng hạ tầng" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-warning/10 text-warning">
						<Server className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-warning mt-2 tracking-tight">
					{metrics.systemUptime}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>{metrics.activeServicesCount}/{metrics.totalServicesCount} {t("servicesSuffix", { defaultMessage: "Dịch vụ" })}</span>
					<span className="text-success font-semibold flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full bg-success" />
						{t("online", { defaultMessage: "Trực tuyến" })}
					</span>
				</div>
				<div className="h-1 w-24 bg-warning rounded-full mt-2" />
			</div>
		</div>
	);
}

