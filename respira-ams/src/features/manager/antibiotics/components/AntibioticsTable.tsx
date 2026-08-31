"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, ListFilter, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchStore } from "@/features/manager/stores/searchStore";
import {
	AwareCategory,
	MOCK_ANTIBIOTICS,
	MOCK_SPECTRA,
	type AntibioticItem,
} from "../types";

const PAGE_SIZE = 4;

// ─── Category Badge ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
	const map: Record<string, { color: string; label: string }> = {
		[AwareCategory.Access.toLowerCase()]:      { color: "bg-blue-100 text-blue-800",   label: "Access" },
		[AwareCategory.Watch.toLowerCase()]:       { color: "bg-amber-100 text-amber-800", label: "Watch" },
		[AwareCategory.Reserve.toLowerCase()]:     { color: "bg-red-100 text-red-800",     label: "Reserve" },
		[AwareCategory.AccessWatch.toLowerCase()]: { color: "bg-purple-100 text-purple-800", label: "Access-Watch" },
		[AwareCategory.Others.toLowerCase()]:      { color: "bg-green-100 text-green-800", label: "Others" },
		[AwareCategory.Unclassified.toLowerCase()]:{ color: "bg-gray-100 text-gray-800",   label: "Unclassified" },
	};
	const entry = map[category.toLowerCase()] ?? { color: "bg-gray-100 text-gray-800", label: category };

	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${entry.color}`}>
			{entry.label}
		</span>
	);
}

// ─── AntibioticsTable ─────────────────────────────────────────────────────────

interface AntibioticsTableProps {
	onEdit: (item: AntibioticItem) => void;
	onDelete: (item: AntibioticItem) => void;
}

export function AntibioticsTable({ onEdit, onDelete }: AntibioticsTableProps) {
	const [page, setPage] = useState(1);
	const [selectedCategory, setSelectedCategory] = useState<AwareCategory | "">("");
	const [selectedSpectrumId, setSelectedSpectrumId] = useState("");

	const searchName = useSearchStore((s) => s.value);
	const clearSearch = useSearchStore((s) => s.clear);

	useEffect(() => { clearSearch(); }, [clearSearch]);
	useEffect(() => { setPage(1); }, [searchName, selectedCategory, selectedSpectrumId]);

	// Client-side filter
	const filtered = useMemo(() =>
		MOCK_ANTIBIOTICS.filter((item) => {
			const matchName = searchName
				? item.name.toLowerCase().includes(searchName.toLowerCase())
				: true;
			const matchCat = selectedCategory
				? item.category.toLowerCase() === selectedCategory.toLowerCase()
				: true;
			const matchSpec = selectedSpectrumId
				? item.antibioticSpectrum.id === selectedSpectrumId
				: true;
			return matchName && matchCat && matchSpec;
		}),
		[searchName, selectedCategory, selectedSpectrumId]
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedSpectrumId ? 1 : 0);

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Tên kháng sinh</TableHead>
						<TableHead>Phân loại AWaRe</TableHead>
						<TableHead>Phổ kháng sinh</TableHead>
						<TableHead>Liều dùng</TableHead>
						<TableHead className="overflow-visible py-3">
							<div className="flex items-center justify-end gap-2">
								Thao tác
								{/* Filter Dropdown */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="relative" id="antibiotics-filter-btn">
											<ListFilter className="h-4 w-4" />
											{activeFilterCount > 0 && (
												<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
													{activeFilterCount}
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<DropdownMenuLabel>Lọc theo</DropdownMenuLabel>
										<DropdownMenuSeparator />

										{/* Category sub-menu */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>
												Phân loại AWaRe
												{selectedCategory && (
													<span className="ml-auto text-xs text-muted-foreground">
														{selectedCategory}
													</span>
												)}
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent>
												<DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedCategory("")}>
													Tất cả
												</DropdownMenuItem>
												{Object.values(AwareCategory).map((cat) => (
													<DropdownMenuItem key={cat} onSelect={(e) => e.preventDefault()} onClick={() => setSelectedCategory(cat)}>
														{cat === "AccessWatch" ? "Access-Watch" : cat}
													</DropdownMenuItem>
												))}
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										{/* Spectrum sub-menu */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>
												Phổ kháng sinh
												{selectedSpectrumId && (
													<span className="ml-auto text-xs text-muted-foreground">
														{MOCK_SPECTRA.find((s) => s.id === selectedSpectrumId)?.name}
													</span>
												)}
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent>
												<DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedSpectrumId("")}>
													Tất cả
												</DropdownMenuItem>
												{MOCK_SPECTRA.map((spec) => (
													<DropdownMenuItem key={spec.id} onSelect={(e) => e.preventDefault()} onClick={() => setSelectedSpectrumId(spec.id)}>
														{spec.name}
													</DropdownMenuItem>
												))}
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										<DropdownMenuSeparator />
										<DropdownMenuItem
											onSelect={(e) => e.preventDefault()}
											onClick={() => { setSelectedCategory(""); setSelectedSpectrumId(""); }}
										>
											Xóa tất cả bộ lọc
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center text-muted-foreground py-10">
								Không tìm thấy kháng sinh nào.
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow key={item.id}>
								<TableCell className="font-medium align-middle">
									<span className="text-primary">{item.name}</span>
								</TableCell>
								<TableCell className="align-middle">
									<CategoryBadge category={item.category} />
								</TableCell>
								<TableCell className="align-middle">
									<span className="text-foreground">
										{item.antibioticSpectrum?.name || "N/A"}
									</span>
								</TableCell>
								<TableCell className="align-middle whitespace-normal">
									{item.dosages && Object.keys(item.dosages).length > 0 ? (
										<div className="flex flex-col gap-1">
											{Object.entries(item.dosages).map(([route, doses]) => (
												<div key={route} className="text-sm">
													<span className="font-semibold capitalize text-foreground">
														{route}:{" "}
													</span>
													<span className="text-foreground">{doses.join(", ")}</span>
												</div>
											))}
										</div>
									) : (
										<span className="text-muted-foreground italic text-sm">N/A</span>
									)}
								</TableCell>
								<TableCell className="align-middle">
									<div className="flex gap-1 justify-end">
										<Button variant="ghost" size="icon" onClick={() => onEdit(item)} id={`edit-antibiotic-${item.id}`}>
											<Edit className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" onClick={() => onDelete(item)} id={`delete-antibiotic-${item.id}`}>
											<Trash className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							className={page > 1 ? "cursor-pointer" : "pointer-events-none opacity-50"}
							onClick={() => setPage((p) => p - 1)}
						/>
					</PaginationItem>
					<span className="text-sm text-muted-foreground px-2">
						Trang {page} / {totalPages}
					</span>
					<PaginationItem>
						<PaginationNext
							className={page < totalPages ? "cursor-pointer" : "pointer-events-none opacity-50"}
							onClick={() => setPage((p) => p + 1)}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
}
