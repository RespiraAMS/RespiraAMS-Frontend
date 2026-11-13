"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { AuditLogItem } from "../types";

interface RecentAuditLogsCardProps {
	logs: AuditLogItem[];
}

export function RecentAuditLogsCard({ logs }: RecentAuditLogsCardProps) {
	const t = useTranslations("admin.dashboard");

	const renderStatusBadge = (status: AuditLogItem["status"]) => {
		switch (status) {
			case "success":
				return (
					<span className="inline-flex items-center gap-1 rounded-[6px] bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
						<CheckCircle2 className="h-3 w-3" />
						{t("statusSuccess", { defaultMessage: "Thành công" })}
					</span>
				);
			case "warning":
				return (
					<span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
						<AlertTriangle className="h-3 w-3" />
						{t("statusWarning", { defaultMessage: "Cảnh báo" })}
					</span>
				);
			case "error":
				return (
					<span className="inline-flex items-center gap-1 rounded-[6px] bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
						<AlertCircle className="h-3 w-3" />
						{t("statusError", { defaultMessage: "Thất bại" })}
					</span>
				);
		}
	};

	return (
		<div className="bg-white rounded-[12px] p-5 border border-slate-100 shadow-2xs">
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-sky-50 text-[#0EA5E9]">
						<ShieldCheck className="h-4 w-4" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-slate-900">
							{t("recentAuditTitle", { defaultMessage: "Nhật ký Kiểm toán & Bảo mật Gần đây" })}
						</h3>
						<p className="text-xs text-slate-500">
							{t("recentAuditSubtitle", { defaultMessage: "Ghi nhận các thao tác quản trị, đăng nhập và thay đổi phác đồ" })}
						</p>
					</div>
				</div>

				<Link
					href="/admin/audit-logs"
					className="inline-flex items-center gap-1 text-xs font-semibold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
				>
					<span>{t("viewAll", { defaultMessage: "Xem tất cả" })}</span>
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</div>

			<div className="space-y-3">
				{logs.map((log) => (
					<div
						key={log.id}
						className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-[10px] bg-slate-50/60 hover:bg-slate-50 border border-slate-100/80 transition-colors"
					>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2 flex-wrap">
								<span className="font-semibold text-xs text-slate-800">
									{log.action}
								</span>
								{renderStatusBadge(log.status)}
								<span className="rounded-[4px] bg-slate-200/70 px-1.5 py-0.2 text-[9.5px] font-mono text-slate-600">
									{log.service}
								</span>
							</div>
							<p className="text-[11px] text-slate-500 mt-1">
								{t("by", { defaultMessage: "Bởi" })} <span className="font-medium text-slate-700">{log.actor}</span> ({log.role}) • {t("target", { defaultMessage: "Mục tiêu" })}: <span className="font-mono text-[10.5px] text-slate-600">{log.target}</span>
							</p>
						</div>

						<div className="text-right shrink-0">
							<span className="text-[11px] text-slate-400 block font-medium">
								{log.timestamp}
							</span>
							<span className="text-[10px] font-mono text-slate-400">
								{log.ipAddress}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

