"use client";

import { useTranslations } from "next-intl";
import { Users, Stethoscope, ClipboardList, Server } from "lucide-react";
import { DashboardMetrics } from "../types";

interface DashboardStatsCardsProps {
	metrics: DashboardMetrics;
}

export function DashboardStatsCards({ metrics }: DashboardStatsCardsProps) {
	const t = useTranslations("admin.dashboard");
	const formatCount = (num: number) => (num < 10 ? `0${num}` : `${num}`);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Card 1: Tổng người dùng */}
			<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider">
						{t("totalUsers", { defaultMessage: "Tổng người dùng" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
						<Users className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-text-primary mt-2 tracking-tight">
					{formatCount(metrics.totalUsers)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>{t("usersSubtitle", { defaultMessage: "Tài khoản trong hệ thống" })}</span>
				</div>
				<div className="h-1 w-20 bg-primary rounded-full mt-2" />
			</div>

			{/* Card 2: Bác sĩ */}
			<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider">
						{t("totalDoctors", { defaultMessage: "Bác sĩ" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-info/10 text-info">
						<Stethoscope className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-info mt-2 tracking-tight">
					{formatCount(metrics.totalDoctors)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>{t("doctorsSubtitle", { defaultMessage: "Hồ sơ bác sĩ" })}</span>
				</div>
				<div className="h-1 w-16 bg-info rounded-full mt-2" />
			</div>

			{/* Card 3: Sự kiện kiểm toán */}
			<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider">
						{t("totalAuditEvents", { defaultMessage: "Sự kiện kiểm toán" })}
					</p>
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-success/10 text-success">
						<ClipboardList className="h-4 w-4" />
					</div>
				</div>
				<p className="text-2xl font-bold text-success mt-2 tracking-tight">
					{formatCount(metrics.totalAuditEvents)}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>{t("auditEventsSubtitle", { defaultMessage: "Sự kiện đã ghi nhận" })}</span>
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
					{metrics.totalServicesCount > 0
						? `${Math.round(
								(metrics.activeServicesCount / metrics.totalServicesCount) * 100
							)}%`
						: "—"}
				</p>
				<div className="flex items-center justify-between mt-3 text-xs text-text-secondary">
					<span>{metrics.activeServicesCount}/{metrics.totalServicesCount} {t("servicesSuffix", { defaultMessage: "Dịch vụ" })}</span>
					<span
						className={
							metrics.activeServicesCount === metrics.totalServicesCount &&
							metrics.totalServicesCount > 0
								? "text-success font-semibold flex items-center gap-1"
								: "text-warning font-semibold flex items-center gap-1"
						}
					>
						<span
							className={
								metrics.activeServicesCount === metrics.totalServicesCount &&
								metrics.totalServicesCount > 0
									? "h-1.5 w-1.5 rounded-full bg-success"
									: "h-1.5 w-1.5 rounded-full bg-warning"
							}
						/>
						{metrics.activeServicesCount === metrics.totalServicesCount &&
						metrics.totalServicesCount > 0
							? t("online", { defaultMessage: "Trực tuyến" })
							: t("degraded", { defaultMessage: "Suy giảm" })}
					</span>
				</div>
				<div className="h-1 w-24 bg-warning rounded-full mt-2" />
			</div>
		</div>
	);
}
