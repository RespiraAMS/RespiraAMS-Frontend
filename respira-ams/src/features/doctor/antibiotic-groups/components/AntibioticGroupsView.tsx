"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
	const [groups, setGroups] = useState<AntibioticGroupItem[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selected, setSelected] = useState<AntibioticGroupItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query.trim());
			setPage(1);
		}, 350);
		return () => clearTimeout(timer);
	}, [query]);

	// Fetch data from backend
	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		setError(null);

		const request = debouncedQuery
			? searchAntibioticGroups({
					page,
					size: PAGE_SIZE,
					searchTerm: debouncedQuery,
				})
			: fetchPagedAntibioticGroups({
					page,
					size: PAGE_SIZE,
				});

		request
			.then((res) => {
				if (isMounted) {
					setGroups(res.items);
					setTotalCount(res.totalCount);
					setTotalPages(res.totalPages);
				}
			})
			.catch((err) => {
				if (isMounted) {
					setGroups([]);
					setTotalCount(0);
					setTotalPages(1);
					setError(
						err instanceof Error
							? err.message
							: "Không thể tải danh sách nhóm kháng sinh."
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

	const handleSelectGroup = (item: AntibioticGroupItem) => {
		setSelected(item);
		setIsDetailOpen(true);
	};

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-5">
			<Link
				href="/doctor/info"
				className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0EA5E9] hover:text-[#25B4F8] transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Danh sách danh mục</span>
			</Link>

			<AntibioticGroupSearchBar
				searchQuery={query}
				onSearchChange={(v) => {
					setQuery(v);
				}}
			/>

			{error && (
				<p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-3.5 py-2.5">
					{error}
				</p>
			)}

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
