"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuditLogFilters, AuditLogItem, AuditLogStats } from "../types";
import {
	fetchAuditLogs,
	exportAuditLogsToCsv,
	exportAuditLogsToJson,
} from "../api";
import { AuditLogStatsCards } from "./AuditLogStatsCards";
import { AuditLogToolbar } from "./AuditLogToolbar";
import { AuditLogsTable } from "./AuditLogsTable";
import { AuditLogPagination } from "./AuditLogPagination";
import { AuditLogDetailDialog } from "./AuditLogDetailDialog";

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: AuditLogFilters = {
	search: "",
	service: "ALL",
	status: "ALL",
	severity: "ALL",
	timeRange: "ALL",
};

export function AdminAuditLogsView() {
	const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_FILTERS);
	const [page, setPage] = useState(1);

	const [logs, setLogs] = useState<AuditLogItem[]>([]);
	const [total, setTotal] = useState(0);
	const [stats, setStats] = useState<AuditLogStats>({
		total: 0,
		successCount: 0,
		warningCount: 0,
		errorCount: 0,
		uniqueActorsCount: 0,
		successRatePercent: 100,
	});

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Detail dialog state
	const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Tìm kiếm và lọc tức thì (0ms latency giống như quản lý người dùng)
	const loadData = useCallback(async () => {
		try {
			const result = await fetchAuditLogs(filters, page, PAGE_SIZE);
			setLogs(result.items);
			setTotal(result.total);
			setStats(result.stats);
		} catch (err) {
			console.error("[AdminAuditLogsView] Failed to load audit logs:", err);
			toast.error("Không thể tải nhật ký kiểm toán. Vui lòng thử lại.");
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, [filters, page]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleRefresh = () => {
		setIsRefreshing(true);
		loadData();
		toast.info("Đang làm mới nhật ký kiểm toán...");
	};

	const handleFiltersChange = (updater: (prev: AuditLogFilters) => AuditLogFilters) => {
		setFilters((prev) => {
			const updated = updater(prev);
			return updated;
		});
		setPage(1);
	};

	const handleResetFilters = () => {
		setFilters(DEFAULT_FILTERS);
		setPage(1);
		toast.success("Đã đặt lại bộ lọc nhật ký");
	};

	const handleExportCsv = () => {
		if (logs.length === 0) {
			toast.warning("Không có dữ liệu nhật ký để xuất");
			return;
		}
		exportAuditLogsToCsv(logs);
		toast.success("Đã xuất file CSV nhật ký kiểm toán thành công");
	};

	const handleExportJson = () => {
		if (logs.length === 0) {
			toast.warning("Không có dữ liệu nhật ký để xuất");
			return;
		}
		exportAuditLogsToJson(logs);
		toast.success("Đã xuất file JSON nhật ký kiểm toán thành công");
	};

	const handleViewDetail = (item: AuditLogItem) => {
		setSelectedLog(item);
		setIsDetailOpen(true);
	};

	const pageCount = Math.ceil(total / PAGE_SIZE);

	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			{/* Page Header */}
			<div>
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-sky-50 text-[#0EA5E9]">
						<ShieldCheck className="w-5 h-5" />
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
						Nhật ký kiểm toán &amp; Bảo mật
					</h1>
				</div>
				<p className="text-xs sm:text-sm text-slate-500 mt-1">
					Theo dõi toàn diện các giao dịch phân tán, hoạt động đăng nhập, chỉnh sửa phác đồ và truy cập dữ liệu y tế trong hệ thống Respira
				</p>
			</div>

			{/* Stats Cards */}
			<AuditLogStatsCards stats={stats} isLoading={isLoading} />

			{/* Toolbar (Search, Filter, Export, Refresh) */}
			<AuditLogToolbar
				filters={filters}
				onFiltersChange={handleFiltersChange}
				onRefresh={handleRefresh}
				onResetFilters={handleResetFilters}
				onExportCsv={handleExportCsv}
				onExportJson={handleExportJson}
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
				page={page}
				pageCount={pageCount}
				totalItems={total}
				pageSize={PAGE_SIZE}
				onPageChange={setPage}
			/>

			{/* Detail Dialog */}
			<AuditLogDetailDialog
				item={selectedLog}
				open={isDetailOpen}
				onOpenChange={setIsDetailOpen}
				onRollbackSuccess={loadData}
			/>
		</div>
	);
}

