"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DoctorPathogenItem } from "../types";
import { fetchPagedPathogens, searchPathogens } from "../api";
import { PathogenSearchBar } from "./PathogenSearchBar";
import { PathogensTable } from "./PathogensTable";
import { PathogenDetailDialog } from "./PathogenDetailDialog";

const PAGE_SIZE = 8;

export function DoctorPathogensView() {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [page, setPage] = useState(1);
	const [pathogens, setPathogens] = useState<DoctorPathogenItem[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedPathogen, setSelectedPathogen] =
		useState<DoctorPathogenItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query.trim());
			setPage(1);
		}, 350);
		return () => clearTimeout(timer);
	}, [query]);

	// Fetch data from backend API
	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		setError(null);

		const request = debouncedQuery
			? searchPathogens({
					page,
					size: PAGE_SIZE,
					searchTerm: debouncedQuery,
				})
			: fetchPagedPathogens({
					page,
					size: PAGE_SIZE,
				});

		request
			.then((res) => {
				if (isMounted) {
					setPathogens(res.items);
					setTotalCount(res.totalCount);
					setTotalPages(res.totalPages);
				}
			})
			.catch((err) => {
				if (isMounted) {
					setPathogens([]);
					setTotalCount(0);
					setTotalPages(1);
					setError(
						err instanceof Error
							? err.message
							: "Không thể tải danh sách tác nhân gây bệnh."
					);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [page, debouncedQuery]);

	const handleSearchChange = (val: string) => {
		setQuery(val);
	};

	const handleSelectPathogen = (item: DoctorPathogenItem) => {
		setSelectedPathogen(item);
		setIsDetailOpen(true);
	};

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-5">
			{/* Back Link */}
			<Link
				href="/doctor/info"
				className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0EA5E9] hover:text-[#25B4F8] transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Danh sách danh mục</span>
			</Link>

			{/* Search Bar */}
			<PathogenSearchBar
				searchQuery={query}
				onSearchChange={handleSearchChange}
			/>

			{/* Error Alert */}
			{error && (
				<p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-3.5 py-2.5">
					{error}
				</p>
			)}

			{/* Table */}
			<PathogensTable
				pathogens={pathogens}
				totalCount={totalCount}
				currentPage={page}
				pageSize={PAGE_SIZE}
				totalPages={totalPages}
				isLoading={isLoading}
				errorMessage={error}
				onPageChange={setPage}
				onSelectPathogen={handleSelectPathogen}
			/>

			{/* Detail Dialog */}
			<PathogenDetailDialog
				pathogen={selectedPathogen}
				open={isDetailOpen}
				onOpenChange={setIsDetailOpen}
			/>
		</div>
	);
}
