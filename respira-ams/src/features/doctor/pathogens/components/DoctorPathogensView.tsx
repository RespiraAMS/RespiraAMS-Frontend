"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
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

	const [selectedPathogen, setSelectedPathogen] =
		useState<DoctorPathogenItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Debounce search input nhanh (180ms)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query.trim());
			setPage(1);
		}, 180);
		return () => clearTimeout(timer);
	}, [query]);

	const {
		data,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["pathogens", "list", { page, query: debouncedQuery }],
		queryFn: () =>
			debouncedQuery
				? searchPathogens({
						page,
						size: PAGE_SIZE,
						searchTerm: debouncedQuery,
				  })
				: fetchPagedPathogens({
						page,
						size: PAGE_SIZE,
				  }),
	});

	const pathogens = data?.items || [];
	const totalCount = data?.totalCount || 0;
	const totalPages = data?.totalPages || 1;
	const error = isError ? "Không thể tải danh sách tác nhân gây bệnh." : null;

	const handleSearchChange = (val: string) => {
		setQuery(val);
	};

	const handleSelectPathogen = (item: DoctorPathogenItem) => {
		setSelectedPathogen(item);
		setIsDetailOpen(true);
	};

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-5">
			{/* Search Bar */}
			<PathogenSearchBar
				searchQuery={query}
				onSearchChange={handleSearchChange}
			/>

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
