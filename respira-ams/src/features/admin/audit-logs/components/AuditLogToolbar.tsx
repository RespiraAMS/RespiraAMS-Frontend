"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface AuditLogToolbarProps {
	timeRange: string;
	onTimeRangeChange: (value: string) => void;
	onRefresh: () => void;
	isRefreshing?: boolean;
	totalResults: number;
}

export function AuditLogToolbar({
	timeRange,
	onTimeRangeChange,
	onRefresh,
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
			</div>
		</div>
	);
}
