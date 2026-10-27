"use client";

import { useEffect, useState } from "react";
import { Edit, ListFilter, Loader2, Eye, Trash } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";

import { useSearchStore } from "@/features/manager/stores/searchStore";
import { useClinicalMetricsList } from "../queries";
import { type ClinicalMetricItem } from "../types";

const PAGE_SIZE = 10;

interface ClinicalMetricsTableProps {
	onViewDetail: (id: string) => void;
	onEdit: (item: ClinicalMetricItem) => void;
	onDelete: (item: ClinicalMetricItem) => void;
}

export function ClinicalMetricsTable({ onViewDetail, onEdit, onDelete }: ClinicalMetricsTableProps) {
	const tTable = useTranslations("manager.clinicalMetrics.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [filterApplied, setFilterApplied] = useState<boolean | null>(null);

	const searchName = useSearchStore((s) => s.value);
	const clearSearch = useSearchStore((s) => s.clear);

	useEffect(() => {
		clearSearch();
	}, [clearSearch]);

	const [prevFilters, setPrevFilters] = useState({ searchName, filterApplied });
	if (searchName !== prevFilters.searchName || filterApplied !== prevFilters.filterApplied) {
		setPrevFilters({ searchName, filterApplied });
		setPage(1);
	}

	const { data: listData, isLoading, isFetching } = useClinicalMetricsList(
		page,
		PAGE_SIZE,
		searchName,
		filterApplied
	);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

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
						<TableHead className="text-muted-foreground font-semibold">{tTable("colCodeVersion")}</TableHead>
						<TableHead className="text-muted-foreground w-1/4 font-semibold">{tTable("colPublisher")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold text-center">{tTable("colStatus")}</TableHead>
						<TableHead className="text-muted-foreground text-right font-semibold">
							<div className="flex items-center justify-end gap-2">
								{tCommon("actions")}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="relative hover:bg-accent text-foreground h-8 w-8"
										>
											<ListFilter className="h-4 w-4" />
											{filterApplied !== null && (
												<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
													1
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-56 bg-popover text-popover-foreground border-border"
									>
										<DropdownMenuLabel>{tTable("filterTitle")}</DropdownMenuLabel>
										<DropdownMenuSeparator className="bg-border" />
										<DropdownMenuItem
											onClick={() => setFilterApplied(null)}
											className={filterApplied === null ? "bg-accent font-bold" : ""}
										>
											{tTable("filterAll")}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setFilterApplied(true)}
											className={filterApplied === true ? "bg-accent font-bold" : ""}
										>
											{tTable("filterActive")}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setFilterApplied(false)}
											className={filterApplied === false ? "bg-accent font-bold" : ""}
										>
											{tTable("filterInactive")}
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
							<TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
								<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
							</TableCell>
						</TableRow>
					) : items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell colSpan={5} className="text-center text-muted-foreground py-10">
								{tTable("empty")}
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow
								key={item.id}
								className="border-border hover:bg-accent/50 cursor-pointer"
								onDoubleClick={() => onViewDetail(item.id)}
							>
								<TableCell className="font-semibold text-primary align-top whitespace-normal break-words">
									{item.name}
									<p className="text-xs text-muted-foreground font-normal mt-1">{item.description}</p>
								</TableCell>
								<TableCell className="align-top font-mono text-sm text-foreground">
									<span className="font-bold">{item.code}</span> <br />
									<span className="text-xs text-muted-foreground">v.{item.version}</span>
								</TableCell>
								<TableCell className="align-top text-sm text-foreground whitespace-normal break-words">
									{item.publisher}
								</TableCell>
								<TableCell className="align-top text-center">
									{item.isApplied ? (
										<span className="inline-flex items-center rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
											{tTable("statusActive")}
										</span>
									) : (
										<span className="inline-flex items-center rounded bg-muted border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
											{tTable("statusInactive")}
										</span>
									)}
								</TableCell>
								<TableCell className="align-top">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onViewDetail(item.id)}
											className="hover:bg-accent text-foreground h-8 w-8"
											title={tTable("viewDetailTooltip")}
										>
											<Eye className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(item)}
											className="hover:bg-accent text-foreground h-8 w-8"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(item)}
											className="hover:bg-destructive/10 text-destructive h-8 w-8"
										>
											<Trash className="h-4 w-4" />
										</Button>
									</div>
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
						<span className="text-sm text-muted-foreground px-2">
							{tCommon("pageOf", { page, totalPages })}
						</span>
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