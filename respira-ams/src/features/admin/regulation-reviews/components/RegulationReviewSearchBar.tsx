"use client";

import React from "react";
import { Search, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RegulationReviewFilters } from "../types";

interface RegulationReviewSearchBarProps {
	filters: RegulationReviewFilters;
	onFiltersChange: (newFilters: RegulationReviewFilters) => void;
	onOpenCreateDialog: () => void;
	isLoading?: boolean;
}

export function RegulationReviewSearchBar({
	filters,
	onFiltersChange,
	onOpenCreateDialog,
	isLoading = false,
}: RegulationReviewSearchBarProps) {
	return (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
			{/* Search input */}
			<div className="relative flex-1 min-w-[200px]">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
				<Input
					type="text"
					placeholder="Tìm theo email, số điện thoại, ID thành viên..."
					value={filters.search}
					onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
					className="pl-9 pr-8 h-9.5 text-sm rounded-lg bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900"
				/>
				{filters.search && (
					<button
						type="button"
						onClick={() => onFiltersChange({ ...filters, search: "" })}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
						title="Xóa tìm kiếm"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				)}
			</div>

			{/* Filter dropdowns & Actions */}
			<div className="flex items-center gap-2 flex-wrap">
				{/* Status Filter */}
				<Select
					value={filters.status}
					onValueChange={(val) => onFiltersChange({ ...filters, status: val })}
				>
					<SelectTrigger className="w-[155px] h-9.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
						<SelectItem value="Active">Đang hoạt động</SelectItem>
						<SelectItem value="Inactive">Đã khóa</SelectItem>
					</SelectContent>
				</Select>

				{/* Create Button */}
				<Button
					type="button"
					onClick={onOpenCreateDialog}
					className="h-9.5 px-4 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs gap-1.5 shadow-sm transition-colors cursor-pointer"
					id="btn-add-reviewer"
				>
					<UserPlus className="w-4 h-4" />
					<span>Thêm thành viên</span>
				</Button>
			</div>
		</div>
	);
}
