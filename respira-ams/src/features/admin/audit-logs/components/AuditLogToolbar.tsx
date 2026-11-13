"use client";

import React, { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Download, X, FileSpreadsheet, FileJson } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { AuditLogFilters } from "../types";

interface AuditLogToolbarProps {
	filters: AuditLogFilters;
	onFiltersChange: (updater: (prev: AuditLogFilters) => AuditLogFilters) => void;
	onRefresh?: () => void;
	onResetFilters?: () => void;
	onExportCsv: () => void;
	onExportJson: () => void;
	isRefreshing?: boolean;
	totalResults: number;
}

export function AuditLogToolbar({
	filters,
	onFiltersChange,
	onExportCsv,
	onExportJson,
}: AuditLogToolbarProps) {
	const t = useTranslations("admin.auditLogs");
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Ctrl + K shortcut to focus search input
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				searchInputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
			{/* Search Bar matching UserSearchBar style - không bao giờ nhảy form */}
			<div className="relative flex-1 min-w-[200px]">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
				<Input
					ref={searchInputRef}
					type="text"
					value={filters.search}
					onChange={(e) =>
						onFiltersChange((prev) => ({
							...prev,
							search: e.target.value,
						}))
					}
					placeholder={t("searchPlaceholder")}
					className="pl-9 pr-9 h-9.5 text-xs sm:text-sm rounded-lg bg-slate-50/70 border-slate-200 placeholder:text-slate-400 focus-visible:ring-sky-100"
				/>
				{filters.search && (
					<button
						type="button"
						onClick={() => {
							onFiltersChange((prev) => ({ ...prev, search: "" }));
							searchInputRef.current?.focus();
						}}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
						title={t("clearSearch", { defaultMessage: "Xóa tìm kiếm" })}
					>
						<X className="w-3.5 h-3.5" />
					</button>
				)}
			</div>

			{/* Filters & Actions Group - Form luôn cố định, không thêm bớt nút khi tìm kiếm */}
			<div className="flex items-center gap-2 flex-wrap">
					{/* Service Select */}
					<Select
						value={filters.service}
						onValueChange={(val) =>
							onFiltersChange((prev) => ({
								...prev,
								service: val,
							}))
						}
					>
						<SelectTrigger className="w-[145px] h-9.5 text-xs font-semibold rounded-lg bg-slate-50 border-slate-200">
							<SelectValue placeholder={t("serviceFilter")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">{t("allServices")}</SelectItem>
							<SelectItem value="Clinical">Clinical</SelectItem>
							<SelectItem value="Auth">Authentication</SelectItem>
							<SelectItem value="Patient">Patient</SelectItem>
							<SelectItem value="Doctor">Doctor</SelectItem>
							<SelectItem value="Saga">Saga</SelectItem>
							<SelectItem value="Media">Media</SelectItem>
							<SelectItem value="Gateway">Gateway</SelectItem>
						</SelectContent>
					</Select>

					{/* Status Select */}
					<Select
						value={filters.status}
						onValueChange={(val) =>
							onFiltersChange((prev) => ({
								...prev,
								status: val,
							}))
						}
					>
						<SelectTrigger className="w-[140px] h-9.5 text-xs font-semibold rounded-lg bg-slate-50 border-slate-200">
							<SelectValue placeholder={t("statusFilter")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">{t("allStatus")}</SelectItem>
							<SelectItem value="success">{t("statusSuccess")}</SelectItem>
							<SelectItem value="warning">{t("statusWarning")}</SelectItem>
							<SelectItem value="error">{t("statusError")}</SelectItem>
						</SelectContent>
					</Select>

					{/* Time Range Select */}
					<Select
						value={filters.timeRange}
						onValueChange={(val) =>
							onFiltersChange((prev) => ({
								...prev,
								timeRange: val,
							}))
						}
					>
						<SelectTrigger className="w-[145px] h-9.5 text-xs font-semibold rounded-lg bg-slate-50 border-slate-200">
							<SelectValue placeholder={t("timeFilter")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">{t("allTime")}</SelectItem>
							<SelectItem value="today">{t("today")}</SelectItem>
							<SelectItem value="7d">{t("last7Days")}</SelectItem>
							<SelectItem value="30d">{t("last30Days")}</SelectItem>
						</SelectContent>
					</Select>

					{/* Export Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className="h-9.5 px-3.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-1.5 cursor-pointer shadow-2xs"
							>
								<Download className="w-3.5 h-3.5 text-slate-500" />
								<span>{t("exportLogs")}</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44 text-xs font-medium">
							<DropdownMenuItem onClick={onExportCsv} className="gap-2 cursor-pointer">
								<FileSpreadsheet className="w-4 h-4 text-emerald-600" />
								<span>{t("exportCsv")}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onExportJson} className="gap-2 cursor-pointer">
								<FileJson className="w-4 h-4 text-sky-600" />
								<span>{t("exportJson")}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
		</div>
	);
}
