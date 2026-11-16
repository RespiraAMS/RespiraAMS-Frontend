"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Download, FileSpreadsheet, FileJson, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuditLogToolbarProps {
	timeRange: string;
	onTimeRangeChange: (value: string) => void;
	onRefresh: () => void;
	onExportCsv: () => void;
	onExportJson: () => void;
	isRefreshing?: boolean;
	totalResults: number;
}

export function AuditLogToolbar({
	timeRange,
	onTimeRangeChange,
	onRefresh,
	onExportCsv,
	onExportJson,
	isRefreshing = false,
	totalResults,
}: AuditLogToolbarProps) {
	const t = useTranslations("admin.auditLogs");

	return (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border-default shadow-xs">
			<div className="text-xs font-semibold text-text-secondary">
				{t("totalResults", { defaultMessage: "Tổng cộng" })}:{" "}
				<span className="text-text-primary">{totalResults}</span>{" "}
				{t("events", { defaultMessage: "sự kiện" })}
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				{/* Time Range Select - BE filters by `from` */}
				<Select value={timeRange} onValueChange={onTimeRangeChange}>
					<SelectTrigger className="w-[145px] h-9.5 text-xs font-semibold rounded-lg bg-surface-secondary border-border-default">
						<SelectValue placeholder={t("timeFilter")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">{t("allTime")}</SelectItem>
						<SelectItem value="today">{t("today")}</SelectItem>
						<SelectItem value="7d">{t("last7Days")}</SelectItem>
						<SelectItem value="30d">{t("last30Days")}</SelectItem>
					</SelectContent>
				</Select>

				<Button
					type="button"
					variant="outline"
					onClick={onRefresh}
					disabled={isRefreshing}
					className="h-9.5 px-3.5 rounded-lg border-border-default text-xs font-semibold text-text-primary hover:bg-surface-secondary gap-1.5 cursor-pointer shadow-2xs disabled:opacity-60"
				>
					<RefreshCw
						className={`w-3.5 h-3.5 text-text-secondary ${
							isRefreshing ? "animate-spin" : ""
						}`}
					/>
					<span>{t("refresh", { defaultMessage: "Làm mới" })}</span>
				</Button>

				{/* Export Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="outline"
							className="h-9.5 px-3.5 rounded-lg border-border-default text-xs font-semibold text-text-primary hover:bg-surface-secondary gap-1.5 cursor-pointer shadow-2xs"
						>
							<Download className="w-3.5 h-3.5 text-text-secondary" />
							<span>{t("exportLogs")}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44 text-xs font-medium">
						<DropdownMenuItem onClick={onExportCsv} className="gap-2 cursor-pointer">
							<FileSpreadsheet className="w-4 h-4 text-success" />
							<span>{t("exportCsv")}</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onExportJson} className="gap-2 cursor-pointer">
							<FileJson className="w-4 h-4 text-primary" />
							<span>{t("exportJson")}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
