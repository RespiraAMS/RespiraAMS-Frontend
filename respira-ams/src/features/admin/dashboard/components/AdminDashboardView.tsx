"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetrics, MicroserviceStatus, AuditLogItem } from "../types";
import {
	fetchAdminDashboardMetrics,
	fetchMicroservicesStatus,
	fetchRecentAuditLogs,
} from "../api";
import { DashboardStatsCards } from "./DashboardStatsCards";
import { MicroservicesHealthCard } from "./MicroservicesHealthCard";
import { RecentAuditLogsCard } from "./RecentAuditLogsCard";
import { QuickActionsCard } from "./QuickActionsCard";

export function AdminDashboardView() {
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [services, setServices] = useState<MicroserviceStatus[]>([]);
	const [logs, setLogs] = useState<AuditLogItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	const loadData = useCallback(async (isRefresh = false) => {
		if (isRefresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}

		try {
			const [metricsData, servicesData, logsData] = await Promise.all([
				fetchAdminDashboardMetrics(),
				fetchMicroservicesStatus(),
				fetchRecentAuditLogs(),
			]);

			setMetrics(metricsData);
			setServices(servicesData);
			setLogs(logsData);
			setLastUpdated(
				new Date().toLocaleTimeString("vi-VN", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})
			);
		} catch (error) {
			console.error("Lỗi khi tải dữ liệu Admin Dashboard:", error);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadData(false);
	}, [loadData]);

	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			{/* Top Bar: Title & Action buttons */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-slate-100 shadow-2xs">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-base font-bold text-slate-900 tracking-tight">
							Bảng điều khiển Quản trị Hệ thống
						</h2>
						<span className="rounded-[6px] bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-bold text-[#0EA5E9]">
							PROD READY
						</span>
					</div>
					<p className="text-xs text-slate-500 mt-0.5">
						Theo dõi thời gian thực dữ liệu vi sinh lâm sàng, hồ sơ bệnh nhân và tình trạng hạ tầng vi dịch vụ
					</p>
				</div>

				<div className="flex items-center gap-3">
					{lastUpdated && (
						<span className="text-[11px] text-slate-400 font-medium">
							Cập nhật lúc: <span className="text-slate-600 font-semibold">{lastUpdated}</span>
						</span>
					)}

					<button
						type="button"
						onClick={() => loadData(true)}
						disabled={isRefreshing || isLoading}
						className="inline-flex items-center gap-2 rounded-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 px-3.5 py-2 text-xs font-semibold cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
					>
						<RefreshCw
							className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#0EA5E9]" : "text-slate-500"}`}
						/>
						<span>{isRefreshing ? "Đang đồng bộ..." : "Làm mới dữ liệu"}</span>
					</button>
				</div>
			</div>

			{/* Main Content */}
			{isLoading ? (
				<div className="space-y-6">
					{/* Stats skeleton */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-28 rounded-[12px] bg-white border border-slate-100" />
						))}
					</div>
					{/* Quick action skeleton */}
					<Skeleton className="h-32 rounded-[12px] bg-white border border-slate-100" />
					{/* Tables skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Skeleton className="h-72 rounded-[12px] bg-white border border-slate-100" />
						<Skeleton className="h-72 rounded-[12px] bg-white border border-slate-100" />
					</div>
				</div>
			) : (
				<>
					{/* 4 Thẻ KPI chính kết nối trực tiếp API Backend */}
					{metrics && <DashboardStatsCards metrics={metrics} />}

					{/* Thao tác quản trị nhanh */}
					<QuickActionsCard />

					{/* 2 Khối chính: Bảng Microservices & Bảng Nhật ký kiểm toán */}
					<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
						<div className="xl:col-span-7">
							<MicroservicesHealthCard services={services} />
						</div>
						<div className="xl:col-span-5">
							<RecentAuditLogsCard logs={logs} />
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default AdminDashboardView;

