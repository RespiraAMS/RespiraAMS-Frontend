"use client";

import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProtocolFilter } from "../types";

interface ProtocolToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	filter: ProtocolFilter;
	onFilterChange: (value: ProtocolFilter) => void;
	onCreate: () => void;
}

export function ProtocolToolbar({
	search,
	onSearchChange,
	filter,
	onFilterChange,
	onCreate,
}: ProtocolToolbarProps) {
	return (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
			<div className="relative flex-1 min-w-[200px]">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
				<Input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Tìm theo tên hoặc mã phác đồ..."
					className="pl-9 pr-9 h-9.5 text-sm rounded-lg bg-slate-50/70 border-slate-200"
				/>
				{search && (
					<button
						type="button"
						onClick={() => onSearchChange("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
						title="Xoá tìm kiếm"
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				<Select value={filter} onValueChange={(v) => onFilterChange(v as ProtocolFilter)}>
					<SelectTrigger className="w-[165px] h-9.5 text-xs font-semibold rounded-lg bg-slate-50 border-slate-200">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
						<SelectItem value="APPLIED">Đang áp dụng</SelectItem>
						<SelectItem value="NOT_APPLIED">Chưa áp dụng</SelectItem>
					</SelectContent>
				</Select>

				<Button
					type="button"
					onClick={onCreate}
					className="h-9.5 px-4 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs gap-1.5 shadow-sm cursor-pointer"
				>
					<Plus className="w-4 h-4" />
					<span>Thêm phác đồ</span>
				</Button>
			</div>
		</div>
	);
}

