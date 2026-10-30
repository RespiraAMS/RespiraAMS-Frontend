"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Loader2, RefreshCw, Search, X } from "lucide-react";
import { PagedAntibioticItem, PaginationMetadata } from "../types";
import {
	fetchAntibiotics,
	searchAntibiotics,
} from "../services/antibioticApi";
import { AwareBadge } from "./AwareBadge";

const PAGE_SIZE = 8;

export function AntibioticLookupView() {
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [items, setItems] = useState<PagedAntibioticItem[]>([]);
	const [metadata, setMetadata] = useState<PaginationMetadata | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const inputRef = useRef<HTMLInputElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Load data from API
	const loadData = useCallback(async (searchTerm: string, pageNum: number) => {
		setLoading(true);
		setError(null);
		try {
			const res = searchTerm.trim()
				? await searchAntibiotics({
						searchTerm: searchTerm.trim(),
						page: pageNum,
						size: PAGE_SIZE,
				  })
				: await fetchAntibiotics({
						page: pageNum,
						size: PAGE_SIZE,
				  });

			setItems(res.items || []);
			setMetadata(res.metadata);
		} catch (err) {
			console.error("[AntibioticLookupView] Lỗi tải danh sách kháng sinh:", err);
			setError("Không thể tải danh mục kháng sinh từ máy chủ. Vui lòng thử lại.");
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounce search input and handle page changes
	useEffect(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			loadData(query, page);
		}, 300);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [query, page, loadData]);

	// Shortcut Ctrl/Cmd + K
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

	const totalPages = metadata?.pageCount ?? Math.max(1, Math.ceil((metadata?.totalItemCount ?? items.length) / PAGE_SIZE));
	const totalItems = metadata?.totalItemCount ?? items.length;

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-5">
			{/* Breadcrumb / Back Navigation */}
			<div className="flex items-center justify-between">
				<Link
					href="/doctor/info"
					className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0EA5E9] hover:text-[#25B4F8] transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Tra cứu kháng sinh & liều dùng</span>
				</Link>

				<button
					type="button"
					onClick={() => loadData(query, page)}
					disabled={loading}
					className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium text-slate-600 bg-white border border-slate-200/70 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
					title="Làm mới dữ liệu"
				>
					<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#0EA5E9]" : "text-slate-400"}`} />
					<span>{loading ? "Đang tải..." : "Làm mới"}</span>
				</button>
			</div>

			{/* Search Bar */}
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
						placeholder="Tìm theo tên kháng sinh (ví dụ: Amoxicilin, Ceftriaxone...)"
						className="w-full bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder:text-slate-400"
					/>
					{query && (
						<button
							type="button"
							onClick={() => {
								setQuery("");
								setPage(1);
								inputRef.current?.focus();
							}}
							className="text-slate-400 hover:text-slate-600 p-1 mr-1 transition-colors"
							title="Xóa tìm kiếm"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
					<span className="shrink-0 text-[9.5px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-[4px] select-none ml-2 shadow-2xs">
						Ctrl + K
					</span>
				</div>
			</div>

			{/* Error Alert */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] flex items-center justify-between text-xs">
					<span>{error}</span>
					<button
						type="button"
						onClick={() => loadData(query, page)}
						className="font-bold underline ml-3 cursor-pointer hover:text-red-900"
					>
						Thử lại
					</button>
				</div>
			)}

			{/* Table Card */}
			<div
				style={{ borderRadius: "14px" }}
				className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs overflow-hidden"
			>
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-slate-100 bg-slate-50/50">
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
									Tên kháng sinh
								</th>
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
									Nhóm kháng sinh
								</th>
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
									Phân loại AWaRe
								</th>
								<th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
									Thao tác
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100/80">
							{loading && items.length === 0 ? (
								<tr>
									<td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
										<div className="flex flex-col items-center justify-center gap-2">
											<Loader2 className="h-6 w-6 animate-spin text-[#0EA5E9]" />
											<span className="text-xs">Đang tải dữ liệu kháng sinh...</span>
										</div>
									</td>
								</tr>
							) : items.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="px-6 py-10 text-center text-slate-400 text-sm"
									>
										Không tìm thấy kháng sinh phù hợp.
									</td>
								</tr>
							) : (
								items.map((a) => (
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
											{a.antibioticGroup?.name || "Chưa phân nhóm"}
										</td>
										<td className="px-6 py-3.5 text-center">
											<AwareBadge value={a.classification} />
										</td>
										<td className="px-6 py-3.5 text-right">
											<Link
												href={`/doctor/info/${a.id}`}
												title="Xem chi tiết & liều dùng"
												style={{ borderRadius: "6px" }}
												className="inline-flex p-1.5 text-slate-500 hover:text-[#0EA5E9] hover:bg-sky-50 transition-colors"
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

				{/* Pagination Footer */}
				<div className="px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-[12.5px] text-slate-500">
					<div>
						Hiển thị{" "}
						<span className="font-bold text-slate-800">{items.length}</span> trong
						tổng số{" "}
						<span className="font-bold text-slate-800">{totalItems}</span>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							disabled={loading || page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							className="px-2.5 py-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer font-medium transition-colors text-xs rounded-[6px] hover:bg-slate-100"
						>
							Trước
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								type="button"
								disabled={loading}
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
							disabled={loading || page >= totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							className="px-2.5 py-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer font-medium transition-colors text-xs rounded-[6px] hover:bg-slate-100"
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
