"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	CheckCircle2,
	AlertTriangle,
	AlertCircle,
	Eye,
	Shield,
	Clock,
	Layers,
	Globe,
	User,
} from "lucide-react";
import { AuditLogItem, AuditLogStatus, AuditServiceType, AuditLogSeverity } from "../types";

interface AuditLogsTableProps {
	logs: AuditLogItem[];
	isLoading: boolean;
	isSearching?: boolean;
	onViewDetail: (item: AuditLogItem) => void;
}

export function AuditLogsTable({ logs, isLoading, isSearching = false, onViewDetail }: AuditLogsTableProps) {
	const t = useTranslations("admin.auditLogs");

	const formatDateTime = (isoString: string) => {
		try {
			const d = new Date(isoString);
			const dateStr = d.toLocaleDateString("vi-VN", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
			const timeStr = d.toLocaleTimeString("vi-VN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			return { dateStr, timeStr };
		} catch {
			return { dateStr: isoString, timeStr: "" };
		}
	};

	const renderStatusBadge = (status: AuditLogStatus) => {
		switch (status) {
			case "success":
				return (
					<span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
						<CheckCircle2 className="h-3 w-3" />
						<span>{t("statusSuccess")}</span>
					</span>
				);
			case "warning":
				return (
					<span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
						<AlertTriangle className="h-3 w-3" />
						<span>{t("statusWarning")}</span>
					</span>
				);
			case "error":
				return (
					<span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200/60">
						<AlertCircle className="h-3 w-3" />
						<span>{t("statusError")}</span>
					</span>
				);
		}
	};

	const renderServiceBadge = (service: AuditServiceType) => {
		const styles: Record<AuditServiceType, { bg: string; text: string; border: string }> = {
			Clinical: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/60" },
			Auth: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/60" },
			Patient: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/60" },
			Doctor: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/60" },
			Saga: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/60" },
			Media: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200/60" },
			Gateway: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200/60" },
		};

		const s = styles[service] || styles.Gateway;
		return (
			<span
				className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold font-mono border ${s.bg} ${s.text} ${s.border}`}
			>
				{service}
			</span>
		);
	};

	const renderSeverityBadge = (severity: AuditLogSeverity) => {
		switch (severity) {
			case "critical":
				return (
					<span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-100/70 px-1.5 py-0.2 rounded">
						{t("sevCritical")}
					</span>
				);
			case "high":
				return (
					<span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-1.5 py-0.2 rounded">
						{t("sevHigh")}
					</span>
				);
			case "medium":
				return (
					<span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100/70 px-1.5 py-0.2 rounded">
						{t("sevMedium")}
					</span>
				);
			case "low":
			default:
				return (
					<span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
						{t("sevLow")}
					</span>
				);
		}
	};

	const renderRoleBadge = (role: string) => {
		switch (role.toLowerCase()) {
			case "admin":
				return (
					<span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-1.5 py-0.2 rounded">
						Admin
					</span>
				);
			case "manager":
				return (
					<span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded">
						Manager
					</span>
				);
			case "doctor":
				return (
					<span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
						Doctor
					</span>
				);
			case "system":
			case "gateway":
			default:
				return (
					<span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
						{role}
					</span>
				);
		}
	};

	// Chỉ hiện khung loading to khi mới vào trang lần đầu và chưa có dữ liệu nào
	if (isLoading && logs.length === 0) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
				<div className="inline-block animate-spin text-[#0EA5E9] mb-3">
					<Clock className="w-6 h-6" />
				</div>
				<p className="text-sm font-semibold text-slate-700">{t("loading", { defaultMessage: "Đang đồng bộ nhật ký kiểm toán..." })}</p>
				<p className="text-xs text-slate-400 mt-1">{t("loadingDesc", { defaultMessage: "Đang truy vấn các sự kiện từ các vi dịch vụ" })}</p>
			</div>
		);
	}

	if (logs.length === 0 && !isLoading) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
				<div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mb-3">
					<Shield className="w-6 h-6" />
				</div>
				<h3 className="text-sm font-bold text-slate-800">{t("empty")}</h3>
				<p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
					{t("emptyDesc", { defaultMessage: "Không có nhật ký nào phù hợp với bộ lọc hiện tại. Thử đổi từ khoá tìm kiếm hoặc xóa bộ lọc." })}
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
			<div className="overflow-x-auto">
				<Table className="table-fixed w-full">
					<TableHeader className="bg-slate-50/80">
						<TableRow className="border-b border-slate-200 hover:bg-transparent">
							<TableHead className="w-[130px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3.5 pl-4">
								{t("colTime")}
							</TableHead>
							<TableHead className="w-[210px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3.5">
								{t("colActor")}
							</TableHead>
							<TableHead className="w-[105px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3.5">
								{t("colService")}
							</TableHead>
							<TableHead className="min-w-[260px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3.5">
								{t("colActionTarget")}
							</TableHead>
							<TableHead className="w-[125px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3.5">
								{t("colIpDuration")}
							</TableHead>
							<TableHead className="w-[135px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3.5">
								{t("colStatusSeverity")}
							</TableHead>
							<TableHead className="w-[70px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3.5 text-right pr-4">
								{t("colDetail")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{logs.map((log) => {
							const { dateStr, timeStr } = formatDateTime(log.timestamp);
							return (
								<TableRow
									key={log.id}
									className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
									onClick={() => onViewDetail(log)}
								>
									{/* Timestamp */}
									<TableCell className="py-3 pl-4 align-top">
										<div className="flex flex-col">
											<span className="font-semibold text-xs text-slate-800">{timeStr}</span>
											<span className="text-[11px] text-slate-400 font-mono mt-0.5">
												{dateStr}
											</span>
										</div>
									</TableCell>

									{/* Actor */}
									<TableCell className="py-3 align-top">
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-1.5 flex-wrap">
												<span className="font-semibold text-xs text-slate-900 leading-tight">
													{log.actorName}
												</span>
												{renderRoleBadge(log.role)}
											</div>
											<span className="text-[11px] text-slate-500 font-mono break-all">
												{log.actor}
											</span>
										</div>
									</TableCell>

									{/* Service */}
									<TableCell className="py-3 align-top">
										{renderServiceBadge(log.service)}
									</TableCell>

									{/* Action & Target */}
									<TableCell className="py-3 align-top">
										<div className="flex flex-col gap-1">
											<span className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug">
												{log.action}
											</span>
											<div className="flex items-center gap-1.5 flex-wrap">
												<span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
													{log.category}
												</span>
												<span className="text-[11px] text-slate-500 font-mono truncate max-w-[220px]">
													{log.target}
												</span>
											</div>
										</div>
									</TableCell>

									{/* IP & Latency */}
									<TableCell className="py-3 align-top">
										<div className="flex flex-col">
											<span className="font-mono text-xs text-slate-700">
												{log.ipAddress}
											</span>
											<span className="text-[10.5px] text-slate-400 font-mono mt-0.5">
												{log.durationMs}ms
											</span>
										</div>
									</TableCell>

									{/* Status & Severity */}
									<TableCell className="py-3 align-top">
										<div className="flex flex-col gap-1">
											<div>{renderStatusBadge(log.status)}</div>
											<div>{renderSeverityBadge(log.severity)}</div>
										</div>
									</TableCell>

									{/* Action Button */}
									<TableCell
										className="py-3 pr-4 text-right align-top"
										onClick={(e) => {
											e.stopPropagation();
											onViewDetail(log);
										}}
									>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
											title="Xem chi tiết sự kiện"
										>
											<Eye className="w-4 h-4" />
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

