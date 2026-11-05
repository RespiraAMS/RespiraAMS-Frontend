"use client";

import React from "react";
import { Search, UserPlus, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserFilters } from "../types";

interface UserSearchBarProps {
	filters: UserFilters;
	onFiltersChange: (newFilters: UserFilters) => void;
	onOpenCreateDialog: () => void;
	onRefresh: () => void;
	isLoading?: boolean;
}

export function UserSearchBar({
	filters,
	onFiltersChange,
	onOpenCreateDialog,
	onRefresh,
	isLoading = false,
}: UserSearchBarProps) {
	return (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
			{/* Search input */}
			<div className="relative flex-1 min-w-[200px]">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
				<Input
					type="text"
					placeholder="Tìm kiếm theo tên, email, SĐT, CCCD..."
					value={filters.search}
					onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
					className="pl-9 h-9.5 text-sm rounded-lg bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900"
				/>
			</div>

			{/* Filter dropdowns & Actions */}
			<div className="flex items-center gap-2 flex-wrap">
				{/* Role Filter */}
				<Select
					value={filters.role}
					onValueChange={(val) => onFiltersChange({ ...filters, role: val })}
				>
					<SelectTrigger className="w-[145px] h-9.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
						<SelectValue placeholder="Vai trò" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả vai trò</SelectItem>
						<SelectItem value="Doctor">Bác sĩ</SelectItem>
						<SelectItem value="Manager">Trưởng khoa / Quản lý</SelectItem>
						<SelectItem value="Admin">Quản trị viên</SelectItem>
					</SelectContent>
				</Select>

				{/* Status Filter */}
				<Select
					value={filters.status}
					onValueChange={(val) => onFiltersChange({ ...filters, status: val })}
				>
					<SelectTrigger className="w-[145px] h-9.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
						<SelectItem value="Active">Đang hoạt động</SelectItem>
						<SelectItem value="Inactive">Đã khóa</SelectItem>
					</SelectContent>
				</Select>

				{/* Refresh Button */}
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={onRefresh}
					disabled={isLoading}
					className="h-9.5 w-9.5 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
					title="Làm mới danh sách"
				>
					<RotateCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
				</Button>

				{/* Create User Button */}
				<Button
					type="button"
					onClick={onOpenCreateDialog}
					className="h-9.5 px-4 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs gap-1.5 shadow-sm transition-colors cursor-pointer"
				>
					<UserPlus className="w-4 h-4" />
					<span>Thêm người dùng</span>
				</Button>
			</div>
		</div>
	);
}

