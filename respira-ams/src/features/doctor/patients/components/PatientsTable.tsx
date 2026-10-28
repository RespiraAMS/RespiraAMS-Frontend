"use client";

import { Info, SquarePen, Trash2 } from "lucide-react";
import { Patient } from "../types";
import { PatientStatusBadge } from "./PatientStatusBadge";

interface PatientsTableProps {
	patients: Patient[];
	totalCount: number;
	pageSize: number;
	isLoading?: boolean;
	errorMessage?: string | null;
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onViewDetails: (patient: Patient) => void;
	onEditPatient: (patient: Patient) => void;
	onDeletePatient: (patient: Patient) => void;
}

export function PatientsTable({
	patients,
	totalCount,
	pageSize,
	isLoading = false,
	errorMessage = null,
	currentPage,
	totalPages,
	onPageChange,
	onViewDetails,
	onEditPatient,
	onDeletePatient,
}: PatientsTableProps) {
	// Show a sliding window of at most 5 page buttons
	const windowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
	const windowEnd = Math.min(totalPages, windowStart + 4);
	const pageNumbers = Array.from(
		{ length: windowEnd - windowStart + 1 },
		(_, i) => windowStart + i
	);

	return (
		<div className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs overflow-hidden mt-4">
			{/* Table Container */}
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-slate-100">
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Bệnh nhân & mã B/A
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Tuổi / Giới tính
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Tình trạng điều trị
							</th>
							<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100/80">
						{patients.length === 0 ? (
							<tr>
								<td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
									{isLoading
										? "Đang tải dữ liệu..."
										: (errorMessage ?? "Không tìm thấy bệnh nhân nào phù hợp.")}
								</td>
							</tr>
						) : (
							patients.map((patient) => (
								<tr
									key={patient.id}
									className="hover:bg-slate-50/60 transition-colors group"
								>
									{/* Name & Code */}
									<td className="px-6 py-3">
										<div
											onClick={() => onViewDetails(patient)}
											className="cursor-pointer group/name"
										>
											<p className="font-bold text-slate-800 text-[13.5px] leading-tight group-hover/name:text-[#0EA5E9] transition-colors">
												{patient.name}
											</p>
											<p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
												{patient.code}
											</p>
										</div>
									</td>

									{/* Age & Gender */}
									<td className="px-6 py-3 text-slate-600 font-medium text-[13px]">
										{patient.age} tuổi · {patient.gender}
									</td>

									{/* Status Badge */}
									<td className="px-6 py-3">
										<PatientStatusBadge status={patient.status} />
									</td>

									{/* Actions */}
									<td className="px-6 py-3 text-right">
										<div className="flex items-center justify-end gap-3 text-slate-600">
											<button
												type="button"
												onClick={() => onViewDetails(patient)}
												title="Xem chi tiết"
												className="p-1 rounded-[5px] hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
											>
												<Info className="h-4 w-4" />
											</button>
											<button
												type="button"
												onClick={() => onEditPatient(patient)}
												title="Chỉnh sửa"
												className="p-1 rounded-[5px] hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
											>
												<SquarePen className="h-4 w-4" />
											</button>
											<button
												type="button"
												onClick={() => onDeletePatient(patient)}
												title="Xóa bệnh nhân"
												className="p-1 rounded-[5px] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Footer Pagination Row */}
			<div className="px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-[12.5px] text-slate-500">
				<div>
					Hiển thị <span className="font-bold text-slate-800">{patients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {(currentPage - 1) * pageSize + patients.length}</span> trong
					tổng số <span className="font-bold text-slate-800">{totalCount}</span>
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
