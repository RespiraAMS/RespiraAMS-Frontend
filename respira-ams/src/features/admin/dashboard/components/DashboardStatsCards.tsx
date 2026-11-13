"use client";

import { useTranslations } from "next-intl";
import { Users, Pill, Bug, Server } from "lucide-react";
import { DashboardMetrics } from "../types";

interface DashboardStatsCardsProps {
	metrics: DashboardMetrics;
}

export function DashboardStatsCards({ metrics }: DashboardStatsCardsProps) {
	const t = useTranslations("admin.dashboard");
	const formatCount = (num: number) => (num < 10 ? `0${num}` : `${num}`);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Card 1: Tổng hồ sơ bệnh nhân */}
			<div className="bg-white rounded-[12px] p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
						{t("cardPatients", { defaultMessage: "Bệnh nhân & Hồ sơ EMR" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-sky-50 text-[#0EA5E9]">
						<Users className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
					{formatCount(metrics.totalPatients)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-slate-500">
					<span>{t("realClinicalData", { defaultMessage: "Dữ liệu lâm sàng thực tế" })}</span>
					<span className="text-[#0EA5E9] font-medium">{t("openRecords", { defaultMessage: "Hồ sơ mở" })}</span>
				</div>
				<div className="h-1 w-20 bg-[#0EA5E9] rounded-full mt-2" />
			</div>

			{/* Card 2: Danh mục Kháng sinh */}
			<div className="bg-white rounded-[12px] p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
						{t("cardAntibiotics", { defaultMessage: "Danh mục Kháng sinh" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600">
						<Pill className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-[#2563EB] mt-2 tracking-tight">
					{formatCount(metrics.totalAntibiotics)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-slate-500">
					<span>{metrics.totalAntibioticGroups} {t("groupsSuffix", { defaultMessage: "nhóm kháng sinh" })}</span>
					<span className="text-blue-600 font-medium">AWaRe WHO</span>
				</div>
				<div className="h-1 w-16 bg-[#2563EB] rounded-full mt-2" />
			</div>

			{/* Card 3: Tác nhân gây bệnh */}
			<div className="bg-white rounded-[12px] p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
						{t("cardPathogens", { defaultMessage: "Tác nhân gây bệnh" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-600">
						<Bug className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-emerald-600 mt-2 tracking-tight">
					{formatCount(metrics.totalPathogens)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-slate-500">
					<span>{t("pathogensSub", { defaultMessage: "Vi khuẩn & Mầm bệnh hô hấp" })}</span>
					<span className="text-emerald-600 font-medium">{t("amrSurveillance", { defaultMessage: "Giám sát AMR" })}</span>
				</div>
				<div className="h-1 w-16 bg-emerald-500 rounded-full mt-2" />
			</div>

			{/* Card 4: Độ sẵn sàng hạ tầng */}
			<div className="bg-white rounded-[12px] p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
						{t("cardInfrastructure", { defaultMessage: "Độ sẵn sàng hạ tầng" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-purple-50 text-purple-600">
						<Server className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-purple-600 mt-2 tracking-tight">
					{metrics.systemUptime}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-slate-500">
					<span>{metrics.activeServicesCount}/{metrics.totalServicesCount} {t("servicesSuffix", { defaultMessage: "Vi dịch vụ" })}</span>
					<span className="text-emerald-600 font-semibold flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
						{t("online", { defaultMessage: "Trực tuyến" })}
					</span>
				</div>
				<div className="h-1 w-24 bg-purple-500 rounded-full mt-2" />
			</div>
		</div>
	);
}

