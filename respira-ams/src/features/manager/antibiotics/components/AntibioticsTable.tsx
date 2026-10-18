// src/features/manager/antibiotics/components/AntibioticsTable.tsx
"use client";

import { useEffect, useState } from "react";
import { Edit, ListFilter, Trash, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearchStore } from "@/features/manager/stores/searchStore";
import { AwareCategory, type AntibioticItem } from "../types";
import { useAntibiotics, useAntibioticGroups } from "../queries";

const PAGE_SIZE = 10;

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

interface AntibioticsTableProps {
    onEdit: (item: AntibioticItem) => void;
    onDelete: (item: AntibioticItem) => void;
}

export function AntibioticsTable({ onEdit, onDelete }: AntibioticsTableProps) {
    const t = useTranslations("manager.antibiotics");
    const tCommon = useTranslations("common");

    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedGroupId, setSelectedGroupId] = useState("");

    const searchName = useSearchStore((s) => s.value);
    const clearSearch = useSearchStore((s) => s.clear);

    useEffect(() => { clearSearch(); }, [clearSearch]);

    const [prevFilters, setPrevFilters] = useState({ searchName, selectedCategory, selectedGroupId });
    if (
        searchName !== prevFilters.searchName ||
        selectedCategory !== prevFilters.selectedCategory ||
        selectedGroupId !== prevFilters.selectedGroupId
    ) {
        setPrevFilters({ searchName, selectedCategory, selectedGroupId });
        setPage(1); 
    }

    const { data: listData, isLoading, isFetching } = useAntibiotics(page, PAGE_SIZE, searchName, selectedCategory, selectedGroupId);
    
    const { data: groupsData } = useAntibioticGroups();
    const antibioticGroups = groupsData?.antibioticGroups || [];

    const items = listData?.items || [];
    const totalPages = listData?.metadata?.pageCount || 1;
    const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedGroupId ? 1 : 0);

    return (
        <div className="relative">
            {isFetching && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '50%', transform: 'translateX(50%)' }} />
                </div>
            )}
            <Table className="border-border">
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">{t("table.colName")}</TableHead>
                        <TableHead className="text-muted-foreground">{t("table.colCategory")}</TableHead>
                        <TableHead className="text-muted-foreground">{t("table.colGroup")}</TableHead>
                        <TableHead className="overflow-visible py-3 text-muted-foreground">
                            <div className="flex items-center justify-end gap-2">
                                {tCommon("actions")}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative hover:bg-accent">
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
                                            <DropdownMenuSubTrigger>{t("table.colCategory")}</DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setSelectedCategory("")}>{tCommon("all")}</DropdownMenuItem>
                                                {Object.values(AwareCategory).map((cat) => (
                                                    <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)}>
                                                        {cat === "AccessWatch" ? "Access-Watch" : cat}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>

                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>{t("table.colGroup")}</DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                                <DropdownMenuItem onClick={() => setSelectedGroupId("")}>{tCommon("all")}</DropdownMenuItem>
                                                {antibioticGroups.map((group) => (
                                                    <DropdownMenuItem key={group.id} onClick={() => setSelectedGroupId(group.id)}>
                                                        {group.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>

                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => { setSelectedCategory(""); setSelectedGroupId(""); }}>
                                            {t("table.clearFilter")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell>
                        </TableRow>
                    ) : items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-10">{t("table.empty")}</TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id} className="border-border hover:bg-accent/50">
                                <TableCell className="font-medium align-middle">
                                    <span className="text-primary font-semibold">{item.name}</span>
                                </TableCell>
                                <TableCell className="align-middle">
                                    <CategoryBadge category={item.classification} />
                                </TableCell>
                                <TableCell className="align-middle text-foreground">
                                    {item.antibioticGroup?.name || "N/A"}
                                </TableCell>
                                <TableCell className="align-middle whitespace-normal">
                                    <div className="flex gap-1 justify-end">
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