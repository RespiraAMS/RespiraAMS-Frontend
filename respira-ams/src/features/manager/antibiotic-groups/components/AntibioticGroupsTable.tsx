"use client";

import { useEffect, useState } from "react";
import { Edit, ListFilter, Trash, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useSearchStore } from "@/features/manager/stores/searchStore";
import { useAntibioticGroups, useAntibioticGroupsDropdown } from "../queries";
import { type AntibioticGroupItem } from "../types";

const PAGE_SIZE = 10;

interface AntibioticGroupsTableProps {
	onEdit: (item: AntibioticGroupItem) => void;
	onDelete: (item: AntibioticGroupItem) => void;
}

export function AntibioticGroupsTable({ onEdit, onDelete }: AntibioticGroupsTableProps) {
	const t = useTranslations("manager.antibioticGroups.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [selectedParentId, setSelectedParentId] = useState<string>("");

	const searchName = useSearchStore((s) => s.value);
	const clearSearch = useSearchStore((s) => s.clear);

	useEffect(() => { clearSearch(); }, [clearSearch]);

	const [prevFilters, setPrevFilters] = useState({ searchName, selectedParentId });
	if (searchName !== prevFilters.searchName || selectedParentId !== prevFilters.selectedParentId) {
		setPrevFilters({ searchName, selectedParentId });
		setPage(1);
	}

	const { data: listData, isLoading, isFetching } = useAntibioticGroups(page, PAGE_SIZE, searchName, selectedParentId);
	const { data: dropdownData } = useAntibioticGroupsDropdown();
	const parentGroups = dropdownData?.antibioticGroups || [];

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
						<TableHead className="text-muted-foreground w-1/4 font-semibold">{t("colName")}</TableHead>
						<TableHead className="text-muted-foreground w-1/4 font-semibold">{t("colParent")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{t("colDescription")}</TableHead>
						<TableHead className="text-muted-foreground text-right font-semibold">
							<div className="flex items-center justify-end gap-2">
								{tCommon("actions")}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="relative hover:bg-accent text-foreground">
											<ListFilter className="h-4 w-4" />
											{selectedParentId && (
												<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
													1
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
										<DropdownMenuLabel>{t("filterData")}</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>{t("filterByParent")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto bg-popover text-popover-foreground border-border">
												<DropdownMenuItem onClick={() => setSelectedParentId("")}>{tCommon("all")}</DropdownMenuItem>
												{parentGroups.map((group) => (
													<DropdownMenuItem key={group.id} onClick={() => setSelectedParentId(group.id)}>
														{group.name}
													</DropdownMenuItem>
												))}
											</DropdownMenuSubContent>
										</DropdownMenuSub>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => setSelectedParentId("")}>{t("clearFilter")}</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow className="border-border">
							<TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
								<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
							</TableCell>
						</TableRow>
					) : items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell colSpan={4} className="text-center text-muted-foreground py-10">
								{t("empty")}
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow key={item.id} className="border-border hover:bg-accent/50">
								<TableCell className="font-semibold text-primary align-top">{item.name}</TableCell>
								<TableCell className="text-muted-foreground align-top">
									{item.parentName ? (
										<span className="inline-flex items-center rounded-md bg-secondary border border-border px-2 py-1 text-xs font-medium text-secondary-foreground">
											{item.parentName}
										</span>
									) : (
										<span className="italic opacity-50">-</span>
									)}
								</TableCell>
								<TableCell className="align-top max-w-[60ch] whitespace-normal break-words">
									<p className="text-sm text-muted-foreground" title={item.description}>
										{item.description || t("noDescription")}
									</p>
								</TableCell>
								<TableCell className="align-top">
									<div className="flex justify-end gap-1">
										<Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="hover:bg-accent text-foreground">
											<Edit className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="hover:bg-destructive/10">
											<Trash className="h-4 w-4 text-destructive" />
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
							<PaginationPrevious className={page > 1 ? "cursor-pointer hover:bg-accent" : "pointer-events-none opacity-50"} onClick={() => setPage(p => p - 1)} />
						</PaginationItem>
						<span className="text-sm text-muted-foreground px-2">{tCommon("pageOf", { page, totalPages })}</span>
						<PaginationItem>
							<PaginationNext className={page < totalPages ? "cursor-pointer hover:bg-accent" : "pointer-events-none opacity-50"} onClick={() => setPage(p => p + 1)} />
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}