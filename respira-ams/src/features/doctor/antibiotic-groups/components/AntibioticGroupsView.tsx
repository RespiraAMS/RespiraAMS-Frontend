"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_ANTIBIOTIC_GROUPS } from "../mockData";
import { AntibioticGroupItem } from "../types";
import { AntibioticGroupSearchBar } from "./AntibioticGroupSearchBar";
import { AntibioticGroupsTable } from "./AntibioticGroupsTable";
import { AntibioticGroupDetailDialog } from "./AntibioticGroupDetailDialog";

const PAGE_SIZE = 8;

export function AntibioticGroupsView() {
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<AntibioticGroupItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	const filtered = useMemo(() => {
		const q = query.toLowerCase().trim();
		if (!q) return MOCK_ANTIBIOTIC_GROUPS;
		return MOCK_ANTIBIOTIC_GROUPS.filter(
			(g) =>
				g.name.toLowerCase().includes(q) ||
				g.description.toLowerCase().includes(q) ||
				g.antibiotics.some((a) => a.toLowerCase().includes(q))
		);
	}, [query]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const paginated = useMemo(() => {
		const start = (page - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, page]);

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
					setPage(1);
				}}
			/>

			<AntibioticGroupsTable
				groups={paginated}
				totalCount={filtered.length}
				currentPage={page}
				totalPages={totalPages}
				onPageChange={setPage}
				onSelectGroup={(g) => {
					setSelected(g);
					setIsDetailOpen(true);
				}}
			/>

			<AntibioticGroupDetailDialog
				group={selected}
				open={isDetailOpen}
				onOpenChange={setIsDetailOpen}
			/>
		</div>
	);
}

export default AntibioticGroupsView;
