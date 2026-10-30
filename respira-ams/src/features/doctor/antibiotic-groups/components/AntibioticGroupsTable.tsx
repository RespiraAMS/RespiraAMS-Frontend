"use client";

import { Info } from "lucide-react";
import { AntibioticGroupItem } from "../types";

interface AntibioticGroupsTableProps {
	groups: AntibioticGroupItem[];
	totalCount: number;
	currentPage: number;
	pageSize: number;
	totalPages: number;
	isLoading?: boolean;
	errorMessage?: string | null;
	onPageChange: (page: number) => void;
	onSelectGroup: (item: AntibioticGroupItem) => void;
}

export function AntibioticGroupsTable({
	groups,
	totalCount,
	currentPage,
	pageSize,
	totalPages,
	isLoading = false,
	errorMessage = null,
	onPageChange,
	onSelectGroup,
}: AntibioticGroupsTableProps) {
	// Show a sliding window of at most 5 page buttons
	const windowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
	const windowEnd = Math.min(totalPages, windowStart + 4);
	const pageNumbers = Array.from(
		{ length: windowEnd - windowStart + 1 },
		(_, i) => windowStart + i
	);

	return (
		<div
			style={{ borderRadius: "14px" }}
			className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs overflow-hidden"
		>
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-slate-100">
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-1/4">
								Tên nhóm
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-1/4">
								Nhóm cha
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Mô tả
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100/80">
						{groups.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-6 py-10 text-center text-slate-400 text-sm"
								>
									{isLoading
										? "Đang tải dữ liệu..."
										: errorMessage ?? "Không tìm thấy nhóm kháng sinh nào phù hợp."}
								</td>
							</tr>
						) : (
							groups.map((item) => (
								<tr
									key={item.id}
									className="hover:bg-slate-50/60 transition-colors"
								>
									<td className="px-6 py-4 align-top">
										<button
											type="button"
											onClick={() => onSelectGroup(item)}
											className="font-bold text-slate-800 text-[13.5px] hover:text-[#0EA5E9] transition-colors text-left cursor-pointer"
										>
											{item.name}
										</button>
									</td>
									<td className="px-6 py-4 align-top text-[13px] text-slate-700 font-medium">
										{item.parentName ? (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
												{item.parentName}
											</span>
										) : (
											<span className="text-slate-400 text-xs italic">—</span>
										)}
									</td>
									<td className="px-6 py-4 align-top text-[13px] text-slate-600 leading-relaxed">
										{item.description || "—"}
									</td>
									<td className="px-6 py-4 align-top text-right">
										<button
											type="button"
											title="Xem chi tiết"
											onClick={() => onSelectGroup(item)}
											style={{ borderRadius: "6px" }}
											className="inline-flex p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Info className="h-[18px] w-[18px]" />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-[12.5px] text-slate-500">
				<div>
					Hiển thị{" "}
					<span className="font-bold text-slate-800">
						{groups.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
						{(currentPage - 1) * pageSize + groups.length}
					</span>{" "}
					trong tổng số{" "}
					<span className="font-bold text-slate-800">{totalCount}</span>
				</div>

				<div className="flex items-center gap-3">
					<button
						type="button"
						disabled={currentPage <= 1}
						onClick={() => onPageChange(currentPage - 1)}
						className="text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer font-medium transition-colors text-xs"
					>
						Trước
					</button>
					{pageNumbers.map((page) => (
						<button
							key={page}
							type="button"
							onClick={() => onPageChange(page)}
							className={`h-7 w-7 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
								page === currentPage
									? "bg-[#0EA5E9] text-white shadow-2xs"
									: "text-slate-600 hover:bg-slate-100"
							}`}
						>
							{page}
						</button>
					))}
					<button
						type="button"
						disabled={currentPage >= totalPages}
						onClick={() => onPageChange(currentPage + 1)}
						className="text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer font-medium transition-colors text-xs"
					>
						Sau
					</button>
				</div>
			</div>
		</div>
	);
}
