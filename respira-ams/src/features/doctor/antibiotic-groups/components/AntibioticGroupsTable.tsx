"use client";

import { Info } from "lucide-react";
import { AntibioticGroupItem } from "../types";

interface AntibioticGroupsTableProps {
	groups: AntibioticGroupItem[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onSelectGroup: (item: AntibioticGroupItem) => void;
}

export function AntibioticGroupsTable({
	groups,
	totalCount,
	currentPage,
	totalPages,
	onPageChange,
	onSelectGroup,
}: AntibioticGroupsTableProps) {
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
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Mô tả
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-36">
								Số kháng sinh
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
									Không tìm thấy nhóm kháng sinh phù hợp.
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
									<td className="px-6 py-4 align-top text-[13px] text-slate-600 leading-relaxed">
										{item.description}
									</td>
									<td className="px-6 py-4 align-top text-center whitespace-nowrap">
										<span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0EA5E9] text-xs font-semibold select-none">
											{item.antibiotics.length} thuốc
										</span>
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
					<span className="font-bold text-slate-800">{groups.length}</span>{" "}
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
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
