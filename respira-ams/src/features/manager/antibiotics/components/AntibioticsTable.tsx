"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, ListFilter, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
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
		[AwareCategory.Access.toLowerCase()]:       { color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",       label: "Access" },
		[AwareCategory.Watch.toLowerCase()]:        { color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",     label: "Watch" },
		[AwareCategory.Reserve.toLowerCase()]:      { color: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20",           label: "Reserve" },
		[AwareCategory.AccessWatch.toLowerCase()]:  { color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20", label: "Access-Watch" },
		[AwareCategory.Others.toLowerCase()]:       { color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", label: "Others" },
		[AwareCategory.Unclassified.toLowerCase()]: { color: "bg-muted text-muted-foreground border border-border",                          label: "Unclassified" },
	};
	const entry = map[category.toLowerCase()] ?? { color: "bg-muted text-muted-foreground border border-border", label: category };

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
	const t = useTranslations("manager.antibiotics");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [selectedCategory, setSelectedCategory] = useState<AwareCategory | "">("");
	const [selectedSpectrumId, setSelectedSpectrumId] = useState("");

	const searchName = useSearchStore((s) => s.value);
	const clearSearch = useSearchStore((s) => s.clear);

	useEffect(() => { clearSearch(); }, [clearSearch]);
	useEffect(() => { setPage(1); }, [searchName, selectedCategory, selectedSpectrumId]);

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
			<Table className="border-border">
				<TableHeader>
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="text-muted-foreground">{t("table.colName")}</TableHead>
						<TableHead className="text-muted-foreground">{t("table.colCategory")}</TableHead>
						<TableHead className="text-muted-foreground">{t("table.colSpectrum")}</TableHead>
						<TableHead className="text-muted-foreground">{t("table.colDosages")}</TableHead>
						<TableHead className="overflow-visible py-3 text-muted-foreground">
							<div className="flex items-center justify-end gap-2">
								{tCommon("actions")}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="relative hover:bg-accent" id="antibiotics-filter-btn">
											<ListFilter className="h-4 w-4" />
											{activeFilterCount > 0 && (
												<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
													{activeFilterCount}
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
										<DropdownMenuLabel>{t("table.filterBy")}</DropdownMenuLabel>
										<DropdownMenuSeparator />

										<DropdownMenuSub>
											<DropdownMenuSubTrigger>
												{t("table.colCategory")}
												{selectedCategory && (
													<span className="ml-auto text-xs text-muted-foreground">
														{selectedCategory}
													</span>
												)}
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent>
												<DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedCategory("")}>
													{tCommon("all")}
												</DropdownMenuItem>
												{Object.values(AwareCategory).map((cat) => (
													<DropdownMenuItem key={cat} onSelect={(e) => e.preventDefault()} onClick={() => setSelectedCategory(cat)}>
														{cat === "AccessWatch" ? "Access-Watch" : cat}
													</DropdownMenuItem>
												))}
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										<DropdownMenuSub>
											<DropdownMenuSubTrigger>
												{t("table.colSpectrum")}
												{selectedSpectrumId && (
													<span className="ml-auto text-xs text-muted-foreground">
														{MOCK_SPECTRA.find((s) => s.id === selectedSpectrumId)?.name}
													</span>
												)}
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent>
												<DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedSpectrumId("")}>
													{tCommon("all")}
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
											{t("table.clearFilter")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell colSpan={5} className="text-center text-muted-foreground py-10">
								{t("table.empty")}
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow key={item.id} className="border-border hover:bg-accent/50">
								<TableCell className="font-medium align-middle">
									<span className="text-primary font-semibold">{item.name}</span>
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
													<span className="text-muted-foreground">{doses.join(", ")}</span>
												</div>
											))}
										</div>
									) : (
										<span className="text-muted-foreground italic text-sm">N/A</span>
									)}
								</TableCell>
								<TableCell className="align-middle">
									<div className="flex gap-1 justify-end">
										<Button variant="ghost" size="icon" onClick={() => onEdit(item)} id={`edit-antibiotic-${item.id}`} className="hover:bg-accent text-foreground">
											<Edit className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" onClick={() => onDelete(item)} id={`delete-antibiotic-${item.id}`} className="hover:bg-destructive/10">
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
							className={page > 1 ? "cursor-pointer hover:bg-accent" : "pointer-events-none opacity-50"}
							onClick={() => setPage((p) => p - 1)}
						/>
					</PaginationItem>
					<span className="text-sm text-muted-foreground px-2">
						{tCommon("pageOf", { page, totalPages })}
					</span>
					<PaginationItem>
						<PaginationNext
							className={page < totalPages ? "cursor-pointer hover:bg-accent" : "pointer-events-none opacity-50"}
							onClick={() => setPage((p) => p + 1)}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
}