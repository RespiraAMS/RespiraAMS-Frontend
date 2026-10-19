"use client";

import { Info } from "lucide-react";
import { DoctorPathogenItem } from "../types";
import { PathogenClassificationBadge } from "./PathogenClassificationBadge";

interface PathogensTableProps {
	pathogens: DoctorPathogenItem[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onSelectPathogen: (item: DoctorPathogenItem) => void;
}

export function PathogensTable({
	pathogens,
	totalCount,
	currentPage,
	totalPages,
	onPageChange,
	onSelectPathogen,
}: PathogensTableProps) {
	return (
		<div
			style={{ borderRadius: "14px" }}
			className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs overflow-hidden"
		>
			{/* Table Content */}
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-slate-100">
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-1/4">
								Tên tác nhân
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Mô tả
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-36">
								Phân loại
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100/80">
						{pathogens.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-6 py-10 text-center text-slate-400 text-sm"
								>
									Không tìm thấy tác nhân gây bệnh nào phù hợp.
								</td>
							</tr>
						) : (
							pathogens.map((item) => (
								<tr
									key={item.id}
									className="hover:bg-slate-50/60 transition-colors group"
								>
									{/* Name */}
									<td className="px-6 py-4 align-top">
										<button
											type="button"
											onClick={() => onSelectPathogen(item)}
											className="font-bold text-slate-800 text-[13.5px] hover:text-[#0EA5E9] transition-colors text-left cursor-pointer"
										>
											{item.name}
										</button>
									</td>

									{/* Description */}
									<td className="px-6 py-4 align-top text-[13px] text-slate-600 leading-relaxed">
										{item.description}
									</td>

									{/* Classification */}
									<td className="px-6 py-4 align-top text-center whitespace-nowrap">
										<PathogenClassificationBadge
											classification={item.classification}
										/>
									</td>

									{/* Actions */}
									<td className="px-6 py-4 align-top text-right">
										<button
											type="button"
											title="Xem chi tiết"
											onClick={() => onSelectPathogen(item)}
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

			{/* Footer / Pagination */}
			<div className="px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-[12.5px] text-slate-500">
				<div>
					Hiển thị{" "}
					<span className="font-bold text-slate-800">{pathogens.length}</span>{" "}
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
