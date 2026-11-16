"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuditLogItem, AuditLogStats } from "../types";
import { fetchAuditLogs } from "../api";
import { AuditLogStatsCards } from "./AuditLogStatsCards";
import { AuditLogToolbar } from "./AuditLogToolbar";
import { AuditLogsTable } from "./AuditLogsTable";
import { AuditLogPagination } from "./AuditLogPagination";
import { AuditLogDetailDialog } from "./AuditLogDetailDialog";

const PAGE_SIZE = 10;

export function AdminAuditLogsView() {
	const t = useTranslations("admin.auditLogs");
	const [timeRange, setTimeRange] = useState("ALL");
	const [page, setPage] = useState(1);

	const [logs, setLogs] = useState<AuditLogItem[]>([]);
	const [total, setTotal] = useState(0);
	const [stats, setStats] = useState<AuditLogStats>({
		total: 0,
		successCount: 0,
		warningCount: 0,
		errorCount: 0,
		uniqueActorsCount: 0,
		successRatePercent: 0,
	});

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);

	// Detail dialog state
	const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Chỉ tải đúng trang hiện tại; thời gian do backend lọc qua `from`.
	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const result = await fetchAuditLogs(page, PAGE_SIZE, timeRange);
				if (cancelled) return;
				setLogs(result.items);
				setTotal(result.total);
				setStats(result.stats);
			} catch (err) {
				if (cancelled) return;
				console.error("[AdminAuditLogsView] Failed to load audit logs:", err);
				toast.error(t("loadErrorToast"));
			} finally {
				if (!cancelled) {
					setIsLoading(false);
					setIsRefreshing(false);
				}
			}
		};

		void load();

		return () => {
			cancelled = true;
		};
	}, [page, timeRange, reloadKey, t]);

	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);

	const handleRefresh = () => {
		setIsRefreshing(true);
		setReloadKey((value) => value + 1);
		toast.info(t("refreshingToast"));
	};

	const handleTimeRangeChange = (value: string) => {
		setTimeRange(value);
		setPage(1);
	};

	const handleViewDetail = (item: AuditLogItem) => {
		setSelectedLog(item);
		setIsDetailOpen(true);
	};

	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			{/* Page Header */}
			<div>
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-primary/10 text-primary">
						<ShieldCheck className="w-5 h-5" />
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
						{t("pageTitle")}
					</h1>
				</div>
				<p className="text-xs sm:text-sm text-text-secondary mt-1">
					{t("pageSubtitle")}
				</p>
			</div>

			{/* Stats Cards */}
			<AuditLogStatsCards stats={stats} isLoading={isLoading} />
			<p className="text-[11px] text-text-tertiary -mt-3">
				{t("statsNote")}
			</p>

			{/* Toolbar (Time range & Refresh) */}
			<AuditLogToolbar
				timeRange={timeRange}
				onTimeRangeChange={handleTimeRangeChange}
				onRefresh={handleRefresh}
				isRefreshing={isRefreshing}
				totalResults={total}
			/>

			{/* Table List */}
			<AuditLogsTable
				logs={logs}
				isLoading={isLoading}
				isSearching={isRefreshing}
				onViewDetail={handleViewDetail}
			/>

			{/* Pagination */}
			<AuditLogPagination
				page={currentPage}
				pageCount={pageCount}
				totalItems={total}
				pageSize={PAGE_SIZE}
				onPageChange={(nextPage) => {
					setIsRefreshing(true);
					setPage(nextPage);
				}}
			/>

			{/* Detail Dialog */}
			<AuditLogDetailDialog
				item={selectedLog}
				open={isDetailOpen}
				onOpenChange={setIsDetailOpen}
				onRollbackSuccess={() => setReloadKey((value) => value + 1)}
			/>
		</div>
	);
}

