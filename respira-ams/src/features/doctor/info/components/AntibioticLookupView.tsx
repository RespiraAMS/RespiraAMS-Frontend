"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Search } from "lucide-react";
import { LOOKUP_ANTIBIOTICS } from "../mockData";
import { AwareBadge } from "./AwareBadge";

const PAGE_SIZE = 8;

export function AntibioticLookupView() {
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const filtered = useMemo(() => {
		const q = query.toLowerCase().trim();
		return LOOKUP_ANTIBIOTICS.filter((a) => a.name.toLowerCase().includes(q));
	}, [query]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-5">
			<Link
				href="/doctor/info"
				className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0EA5E9] hover:text-[#25B4F8] transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Danh sách danh mục</span>
			</Link>

			{/* Search */}
			<div
				style={{ borderRadius: "14px" }}
				className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs p-3 sm:p-3.5"
			>
				<div
					style={{ borderRadius: "10px" }}
					className="flex items-center h-[42px] bg-[#F8FAFC] border border-slate-200/70 rounded-[10px] px-3.5 focus-within:border-[#0EA5E9] focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 transition-all"
				>
					<Search className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-2.5" />
					<input
						ref={inputRef}
						id="antibiotic-search-input"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setPage(1);
						}}
						placeholder="Tìm theo tên kháng sinh"
						className="w-full bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder:text-slate-400"
					/>
					<span className="shrink-0 text-[9.5px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-[4px] select-none ml-2 shadow-2xs">
						Ctrl + K
					</span>
				</div>
			</div>

			{/* Table */}
			<div
				style={{ borderRadius: "14px" }}
				className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs overflow-hidden"
			>
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-slate-100">
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
									Tên kháng sinh
								</th>
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
									Nhóm kháng sinh
								</th>
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
									Phân loại
								</th>
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
									Thao tác
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100/80">
							{rows.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="px-6 py-10 text-center text-slate-400 text-sm"
									>
										Không tìm thấy kháng sinh phù hợp.
									</td>
								</tr>
							) : (
								rows.map((a) => (
									<tr
										key={a.id}
										className="hover:bg-slate-50/60 transition-colors"
									>
										<td className="px-6 py-3.5">
											<Link
												href={`/doctor/info/${a.id}`}
												className="font-bold text-slate-800 text-[13.5px] hover:text-[#0EA5E9] transition-colors"
											>
												{a.name}
											</Link>
										</td>
										<td className="px-6 py-3.5 text-center text-slate-600 font-medium text-[13px]">
											{a.group}
										</td>
										<td className="px-6 py-3.5 text-center">
											<AwareBadge value={a.aware} />
										</td>
										<td className="px-6 py-3.5 text-right">
											<Link
												href={`/doctor/info/${a.id}`}
												title="Xem chi tiết"
												style={{ borderRadius: "6px" }}
												className="inline-flex p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
											>
												<Info className="h-[18px] w-[18px]" />
											</Link>
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
						<span className="font-bold text-slate-800">{rows.length}</span> trong
						tổng số{" "}
						<span className="font-bold text-slate-800">{filtered.length}</span>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							disabled={page <= 1}
							onClick={() => setPage(page - 1)}
							className="text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer font-medium transition-colors text-xs"
						>
							Trước
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								type="button"
								onClick={() => setPage(p)}
								className={`h-7 w-7 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
									p === page
										? "bg-[#0EA5E9] text-white shadow-2xs"
										: "text-slate-600 hover:bg-slate-100"
								}`}
							>
								{p}
							</button>
						))}
						<button
							type="button"
							disabled={page >= totalPages}
							onClick={() => setPage(page + 1)}
							className="text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer font-medium transition-colors text-xs"
						>
							Sau
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AntibioticLookupView;
