"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditLogPaginationProps {
	page: number;
	pageCount: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}

export function AuditLogPagination({
	page,
	pageCount,
	totalItems,
	pageSize,
	onPageChange,
}: AuditLogPaginationProps) {
	if (totalItems === 0) return null;

	const from = (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, totalItems);

	return (
		<div className="flex items-center justify-between gap-3 flex-wrap px-1">
			<p className="text-xs text-slate-500">
				Hiển thị <strong className="text-slate-700">{from}–{to}</strong> trên{" "}
				<strong className="text-slate-700">{totalItems}</strong> sự kiện kiểm toán
			</p>
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					className="h-9 gap-1 text-xs cursor-pointer"
				>
					<ChevronLeft className="w-4 h-4" /> Trước
				</Button>
				<span className="text-xs font-semibold text-slate-600 px-2">
					Trang {page} / {Math.max(pageCount, 1)}
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={page >= pageCount}
					onClick={() => onPageChange(page + 1)}
					className="h-9 gap-1 text-xs cursor-pointer"
				>
					Sau <ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}

