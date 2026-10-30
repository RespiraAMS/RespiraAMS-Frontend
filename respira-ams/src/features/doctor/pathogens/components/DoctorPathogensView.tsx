"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_DOCTOR_PATHOGENS } from "../mockData";
import { DoctorPathogenItem } from "../types";
import { PathogenSearchBar } from "./PathogenSearchBar";
import { PathogensTable } from "./PathogensTable";
import { PathogenDetailDialog } from "./PathogenDetailDialog";

const PAGE_SIZE = 8;

export function DoctorPathogensView() {
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [selectedPathogen, setSelectedPathogen] = useState<DoctorPathogenItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	const filtered = useMemo(() => {
		const q = query.toLowerCase().trim();
		if (!q) return MOCK_DOCTOR_PATHOGENS;
		return MOCK_DOCTOR_PATHOGENS.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				(p.classification === "typical" ? "điển hình" : "không điển hình").includes(q)
		);
	}, [query]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const paginated = useMemo(() => {
		const start = (page - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, page]);

	const handleSearchChange = (val: string) => {
		setQuery(val);
		setPage(1);
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

			{/* Search */}
			<PathogenSearchBar
				searchQuery={query}
				onSearchChange={handleSearchChange}
			/>

			{/* Table */}
			<PathogensTable
				pathogens={paginated}
				totalCount={filtered.length}
				currentPage={page}
				totalPages={totalPages}
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

export default DoctorPathogensView;
