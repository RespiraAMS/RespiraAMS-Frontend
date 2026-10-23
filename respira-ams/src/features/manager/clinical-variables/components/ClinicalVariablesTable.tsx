"use client";

import { useState } from "react";
import { Eye, ListFilter, Loader2, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import { useSearchStore } from "@/features/manager/stores/searchStore";
import { useClinicalVariables } from "../queries";
import { type ClinicalVariableItem, type VariableCategory, type VariableValueType } from "../types";

const PAGE_SIZE = 10;

interface ClinicalVariablesTableProps {
	onViewDetail: (id: string) => void;
	onDelete: (item: ClinicalVariableItem) => void;
}

export function ClinicalVariablesTable({ onViewDetail, onDelete }: ClinicalVariablesTableProps) {
	const t = useTranslations("manager.clinicalVariables");
	const tTable = useTranslations("manager.clinicalVariables.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);

	const [filterRequired, setFilterRequired] = useState<boolean | null>(null);
	const [filterValueType, setFilterValueType] = useState<VariableValueType | "">("");
	const [filterCategory, setFilterCategory] = useState<VariableCategory | "">("");

	const searchName = useSearchStore((s) => s.value);

	const [prevFilters, setPrevFilters] = useState({ searchName, filterRequired, filterValueType, filterCategory });
	if (
		searchName !== prevFilters.searchName ||
		filterRequired !== prevFilters.filterRequired ||
		filterValueType !== prevFilters.filterValueType ||
		filterCategory !== prevFilters.filterCategory
	) {
		setPrevFilters({ searchName, filterRequired, filterValueType, filterCategory });
		setPage(1);
	}

	const { data: listData, isLoading, isFetching } = useClinicalVariables(
		page,
		PAGE_SIZE,
		searchName,
		filterRequired,
		filterValueType,
		filterCategory
	);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

	const countActiveFilters = () => {
		let count = 0;
		if (filterRequired !== null) count++;
		if (filterValueType) count++;
		if (filterCategory) count++;
		return count;
	};

	const clearFilters = () => {
		setFilterRequired(null);
		setFilterValueType("");
		setFilterCategory("");
		setPage(1);
	};

	const formatCategory = (category: VariableCategory) => {
		switch (category) {
			case "Clinical":
				return t("categories.clinical");
			case "Paraclinical":
				return t("categories.paraclinical");
			case "PersonalInformation":
				return t("categories.personal");
			default:
				return category;
		}
	};

	return (
		<div className="relative">
			{isFetching && (
				<div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md">
					<div className="h-full bg-primary animate-pulse w-1/2 translate-x-1/2" />
				</div>
			)}

			<Table className="border-border">
				<TableHeader>
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="text-muted-foreground w-1/4 font-semibold">{tTable("colName")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{tTable("colCode")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{tTable("colCategory")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{tTable("colValueType")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{tTable("colRequired")}</TableHead>
						<TableHead className="text-muted-foreground text-right font-semibold">
							<div className="flex items-center justify-end gap-2">
								{tCommon("actions")}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="relative hover:bg-accent text-foreground">
											<ListFilter className="h-4 w-4" />
											{countActiveFilters() > 0 && (
												<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
													{countActiveFilters()}
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
										<DropdownMenuLabel>{tTable("filterData")}</DropdownMenuLabel>
										<DropdownMenuSeparator />

										{/* Filter Required */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>{tTable("filterByRequired")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent className="bg-popover text-popover-foreground border-border">
												<DropdownMenuItem onClick={() => setFilterRequired(null)}>{tCommon("all")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterRequired(true)}>{tTable("requiredTrue")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterRequired(false)}>{tTable("requiredFalse")}</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										{/* Filter Category */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>{tTable("filterByCategory")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent className="bg-popover text-popover-foreground border-border">
												<DropdownMenuItem onClick={() => setFilterCategory("")}>{tCommon("all")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterCategory("PersonalInformation")}>{t("categories.personal")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterCategory("Clinical")}>{t("categories.clinical")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterCategory("Paraclinical")}>{t("categories.paraclinical")}</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										{/* Filter Value Type */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>{tTable("filterByValueType")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent className="bg-popover text-popover-foreground border-border">
												<DropdownMenuItem onClick={() => setFilterValueType("")}>{tCommon("all")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterValueType("Numeric")}>{t("valueTypes.numeric")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterValueType("Boolean")}>{t("valueTypes.boolean")}</DropdownMenuItem>
												<DropdownMenuItem onClick={() => setFilterValueType("Categorical")}>{t("valueTypes.categorical")}</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={clearFilters} disabled={countActiveFilters() === 0}>
											{tTable("clearFilter")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow className="border-border">
							<TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
								<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
							</TableCell>
						</TableRow>
					) : items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell colSpan={6} className="text-center text-muted-foreground py-10">
								{tTable("empty")}
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow
								key={item.id}
								className="border-border hover:bg-accent/50 cursor-pointer"
								onClick={() => onViewDetail(item.id)}
							>
								<TableCell className="font-semibold text-primary">{item.name}</TableCell>
								<TableCell>
									<span className="font-mono text-sm bg-accent text-accent-foreground px-1.5 py-0.5 rounded border border-border">
										{item.code}
									</span>
								</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold border ${
											item.category === "Clinical"
												? "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400"
												: item.category === "Paraclinical"
												? "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400"
												: "bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400"
										}`}
									>
										{formatCategory(item.category)}
									</span>
								</TableCell>
								<TableCell className="text-muted-foreground text-sm font-medium">{item.valueType}</TableCell>
								<TableCell>
									{item.isRequired ? (
										<span className="text-destructive font-semibold">{tTable("yes")}</span>
									) : (
										<span className="text-muted-foreground">{tTable("no")}</span>
									)}
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											onViewDetail(item.id);
										}}
										className="hover:bg-accent text-foreground"
									>
										<Eye className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(item);
										}}
										className="hover:bg-destructive/10"
									>
										<Trash className="h-4 w-4 text-destructive" />
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{totalPages > 1 && (
				<Pagination className="mt-4">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								className={page > 1 ? "cursor-pointer hover:bg-accent" : "pointer-events-none opacity-50"}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							/>
						</PaginationItem>
						<span className="text-sm text-muted-foreground px-2">{tCommon("pageOf", { page, totalPages })}</span>
						<PaginationItem>
							<PaginationNext
								className={page < totalPages ? "cursor-pointer hover:bg-accent" : "pointer-events-none opacity-50"}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}