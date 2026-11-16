"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExpandableText } from "@/components/ui/expandable-text";
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
} from "lucide-react";
import { AuditLogItem, AuditLogStatus, AuditServiceType } from "../types";
import { useAuditActionLabel, useAuditRoleLabel, useAuditCategoryLabel } from "../use-audit-labels";

interface AuditLogsTableProps {
	logs: AuditLogItem[];
	isLoading: boolean;
	isSearching?: boolean;
	onViewDetail: (item: AuditLogItem) => void;
}

export function AuditLogsTable({ logs, isLoading, onViewDetail }: AuditLogsTableProps) {
	const t = useTranslations("admin.auditLogs");
	const locale = useLocale();
	const actionLabel = useAuditActionLabel();
	const roleLabel = useAuditRoleLabel();
	const categoryLabel = useAuditCategoryLabel();

	const formatDateTime = (isoString: string) => {
		try {
			const d = new Date(isoString);
			const dateStr = d.toLocaleDateString(locale, {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
			const timeStr = d.toLocaleTimeString(locale, {
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
					<span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success border border-success/30">
						<CheckCircle2 className="h-3 w-3" />
						<span>{t("statusSuccess")}</span>
					</span>
				);
			case "warning":
				return (
					<span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning border border-warning/30">
						<AlertTriangle className="h-3 w-3" />
						<span>{t("statusWarning")}</span>
					</span>
				);
			case "error":
				return (
					<span className="inline-flex items-center gap-1 rounded-md bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error border border-error/30">
						<AlertCircle className="h-3 w-3" />
						<span>{t("statusError")}</span>
					</span>
				);
		}
	};

	const renderServiceBadge = (service: AuditServiceType) => {
		const styles: Record<AuditServiceType, { bg: string; text: string; border: string }> = {
			Clinical: { bg: "bg-info/10", text: "text-info", border: "border-info/30" },
			Auth: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
			Patient: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
			Doctor: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
			Saga: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
			Media: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
			Gateway: { bg: "bg-surface-secondary", text: "text-text-primary", border: "border-border-default/60" },
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

	const renderRoleBadge = (role: string) => {
		switch (role.toLowerCase()) {
			case "admin":
				return (
					<span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.2 rounded">
						{t("roleBadges.Admin")}
					</span>
				);
			case "manager":
			case "medicalregulationreviewer":
				return (
					<span className="text-[10px] font-bold text-info bg-info/10 border border-info/30 px-1.5 py-0.2 rounded">
						{t("roleBadges.Manager")}
					</span>
				);
			case "doctor":
				return (
					<span className="text-[10px] font-bold text-success bg-success/10 border border-success/30 px-1.5 py-0.2 rounded">
						{t("roleBadges.Doctor")}
					</span>
				);
			case "headdepartmentdoctor":
				return (
					<span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/30 px-1.5 py-0.2 rounded">
						{t("roleBadges.HeadDepartmentDoctor")}
					</span>
				);
			case "system":
			case "gateway":
			default:
				return (
					<span className="text-[10px] font-bold text-text-secondary bg-surface-secondary border border-border-default px-1.5 py-0.2 rounded">
						{t("roleBadges.System")}
					</span>
				);
		}
	};

	// Chỉ hiện khung loading to khi mới vào trang lần đầu và chưa có dữ liệu nào
	if (isLoading && logs.length === 0) {
		return (
			<div className="bg-surface rounded-xl border border-border-default p-12 text-center shadow-xs">
				<div className="inline-block animate-spin text-primary mb-3">
					<Clock className="w-6 h-6" />
				</div>
				<p className="text-sm font-semibold text-text-primary">{t("loading", { defaultMessage: "Đang đồng bộ nhật ký kiểm toán..." })}</p>
				<p className="text-xs text-text-tertiary mt-1">{t("loadingDesc", { defaultMessage: "Đang truy vấn các sự kiện từ các vi dịch vụ" })}</p>
			</div>
		);
	}

	if (logs.length === 0 && !isLoading) {
		return (
			<div className="bg-surface rounded-xl border border-border-default p-12 text-center shadow-xs">
				<div className="mx-auto w-12 h-12 rounded-2xl bg-surface-secondary border border-border-subtle text-text-tertiary flex items-center justify-center mb-3">
					<Shield className="w-6 h-6" />
				</div>
				<h3 className="text-sm font-bold text-text-primary">{t("empty")}</h3>
				<p className="text-xs text-text-tertiary mt-1 max-w-sm mx-auto">
					{t("emptyDesc", { defaultMessage: "Không có nhật ký nào phù hợp với bộ lọc hiện tại. Thử đổi từ khoá tìm kiếm hoặc xóa bộ lọc." })}
				</p>
			</div>
		);
	}

	return (
		<div className="bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden">
			<div className="overflow-x-auto">
				<Table className="table-fixed w-full">
					<TableHeader className="bg-surface-secondary/80">
						<TableRow className="border-b border-border-default hover:bg-transparent">
							<TableHead className="w-[130px] text-[11px] font-bold text-text-secondary uppercase tracking-wider py-3.5 pl-4">
								{t("colTime")}
							</TableHead>
							<TableHead className="w-[210px] text-[11px] font-bold text-text-secondary uppercase tracking-wider py-3.5">
								{t("colActor")}
							</TableHead>
							<TableHead className="w-[105px] text-[11px] font-bold text-text-secondary uppercase tracking-wider py-3.5">
								{t("colService")}
							</TableHead>
							<TableHead className="min-w-[250px] text-[11px] font-bold text-text-secondary uppercase tracking-wider py-3.5">
								{t("colActionTarget")}
							</TableHead>
							<TableHead className="w-[145px] text-[11px] font-bold text-text-secondary uppercase tracking-wider py-3.5">
								{t("colStatus", { defaultMessage: "Trạng thái" })}
							</TableHead>
							<TableHead className="w-[70px] text-[11px] font-bold text-text-secondary uppercase tracking-wider py-3.5 text-right pr-4">
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
									className="border-b border-border-subtle hover:bg-surface-secondary/60 transition-colors cursor-pointer"
									onClick={() => onViewDetail(log)}
								>
									{/* Timestamp */}
									<TableCell className="py-3 pl-4 align-top">
										<div className="flex flex-col">
											<span className="font-semibold text-xs text-text-primary">{timeStr}</span>
											<span className="text-[11px] text-text-tertiary font-mono mt-0.5">
												{dateStr}
											</span>
										</div>
									</TableCell>

									{/* Actor */}
									<TableCell className="py-3 align-top">
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-1.5 flex-wrap">
												<span className="font-semibold text-xs text-text-primary leading-tight">
													{roleLabel(log.role)}
												</span>
												{renderRoleBadge(log.role)}
											</div>
											<span className="text-[11px] text-text-secondary font-mono break-all">
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
											<span className="font-semibold text-xs text-text-primary line-clamp-2 leading-snug">
												{actionLabel(log.action)}
											</span>
											<div className="flex items-center gap-1.5 flex-wrap">
												<span className="text-[10px] font-semibold text-text-secondary bg-surface-secondary px-1.5 py-0.2 rounded font-mono">
													{categoryLabel(log.category)}
												</span>
											</div>
											<ExpandableText
												text={log.target}
												className="text-[11px] text-text-secondary font-mono"
											/>
										</div>
									</TableCell>

									{/* Status */}
									<TableCell className="py-3 align-top">
										<div>{renderStatusBadge(log.status)}</div>
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
											className="h-8 w-8 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-secondary cursor-pointer"
											title={t("viewDetail")}
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

