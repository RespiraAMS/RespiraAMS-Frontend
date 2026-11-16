"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuditLogItem, AuditLogStats } from "../types";
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

export function AdminAuditLogsView() {
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
		successRatePercent: 100,
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
				toast.error("Không thể tải nhật ký kiểm toán. Vui lòng thử lại.");
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
	}, [page, timeRange, reloadKey]);

	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);

	const handleRefresh = () => {
		setIsRefreshing(true);
		setReloadKey((value) => value + 1);
		toast.info("Đang làm mới nhật ký kiểm toán...");
	};

	const handleTimeRangeChange = (value: string) => {
		setTimeRange(value);
		setPage(1);
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

	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			{/* Page Header */}
			<div>
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-primary/10 text-primary">
						<ShieldCheck className="w-5 h-5" />
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
						Nhật ký kiểm toán &amp; Bảo mật
					</h1>
				</div>
				<p className="text-xs sm:text-sm text-text-secondary mt-1">
					Theo dõi toàn diện các giao dịch phân tán, hoạt động đăng nhập, chỉnh sửa phác đồ và truy cập dữ liệu y tế trong hệ thống Respira
				</p>
			</div>

			{/* Stats Cards */}
			<AuditLogStatsCards stats={stats} isLoading={isLoading} />
			<p className="text-[11px] text-text-tertiary -mt-3">
				Tổng sự kiện là toàn hệ thống; thành công / cảnh báo / lỗi được tính trên trang hiện tại.
			</p>

			{/* Toolbar (Time range, Export, Refresh) */}
			<AuditLogToolbar
				timeRange={timeRange}
				onTimeRangeChange={handleTimeRangeChange}
				onRefresh={handleRefresh}
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

