"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AntibioticGroupItem } from "../types";
import { fetchPagedAntibioticGroups, searchAntibioticGroups } from "../api";
import { AntibioticGroupSearchBar } from "./AntibioticGroupSearchBar";
import { AntibioticGroupsTable } from "./AntibioticGroupsTable";
import { AntibioticGroupDetailDialog } from "./AntibioticGroupDetailDialog";

const PAGE_SIZE = 8;

export function AntibioticGroupsView() {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [page, setPage] = useState(1);

	const [selected, setSelected] = useState<AntibioticGroupItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Debounce search query nhanh (180ms)
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
		queryKey: ["antibioticGroups", "list", { page, query: debouncedQuery }],
		queryFn: () =>
			debouncedQuery
				? searchAntibioticGroups({
						page,
						size: PAGE_SIZE,
						searchTerm: debouncedQuery,
				  })
				: fetchPagedAntibioticGroups({
						page,
						size: PAGE_SIZE,
				  }),
	});

	const groups = data?.items || [];
	const totalCount = data?.totalCount || 0;
	const totalPages = data?.totalPages || 1;
	const error = isError ? "Không thể tải danh sách nhóm kháng sinh." : null;

	const handleSelectGroup = (item: AntibioticGroupItem) => {
		setSelected(item);
		setIsDetailOpen(true);
	};

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-5">
			<AntibioticGroupSearchBar
				searchQuery={query}
				onSearchChange={(v) => {
					setQuery(v);
				}}
			/>

			<AntibioticGroupsTable
				groups={groups}
				totalCount={totalCount}
				currentPage={page}
				pageSize={PAGE_SIZE}
				totalPages={totalPages}
				isLoading={isLoading}
				errorMessage={error}
				onPageChange={setPage}
				onSelectGroup={handleSelectGroup}
			/>

			<AntibioticGroupDetailDialog
				group={selected}
				open={isDetailOpen}
				onOpenChange={setIsDetailOpen}
			/>
		</div>
	);
}
