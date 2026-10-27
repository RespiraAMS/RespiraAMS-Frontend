"use client";

import { useState } from "react";
import { Edit, Trash, Loader2, ListFilter } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useRiskFactorsList, usePathogensDropdown } from "../queries";
import { type RiskFactorItem } from "../types";
import { PrerequisiteFormatter } from "../../components/PrerequisiteFormatter";

const PAGE_SIZE = 10;

interface RiskFactorsTableProps {
	onEdit: (item: RiskFactorItem) => void;
	onDelete: (item: RiskFactorItem) => void;
}

export function RiskFactorsTable({ onEdit, onDelete }: RiskFactorsTableProps) {
	const tTable = useTranslations("manager.riskFactors.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [filterPathogenId, setFilterPathogenId] = useState<string | null>(null);

	const { data: listData, isLoading, isFetching } = useRiskFactorsList(page, PAGE_SIZE, filterPathogenId);
	const { data: pathogensData } = usePathogensDropdown();

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const pathogensList = pathogensData?.pathogens || [];

	const handleFilterChange = (id: string | null) => {
		setFilterPathogenId(id);
		setPage(1);
	};

	return (
		<div className="relative">
			{isFetching && (
				<div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md z-10">
					<div className="h-full bg-primary animate-pulse w-1/2 translate-x-1/2" />
				</div>
			)}

			<Table className="border-border">
				<TableHeader>
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="text-muted-foreground font-semibold w-1/6">{tTable("colPathogen")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold w-1/6">{tTable("colCriterionName")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{tTable("colFormula")}</TableHead>
						<TableHead className="text-muted-foreground text-right font-semibold w-[120px]">
							<div className="flex items-center justify-end gap-2">
								{tCommon("actions")}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="relative hover:bg-accent h-8 w-8 text-foreground">
											<ListFilter className="h-4 w-4" />
											{filterPathogenId !== null && (
												<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
													1
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto bg-popover text-popover-foreground border-border">
										<DropdownMenuLabel>{tTable("filterTitle")}</DropdownMenuLabel>
										<DropdownMenuSeparator className="bg-border" />
										<DropdownMenuItem
											onClick={() => handleFilterChange(null)}
											className={filterPathogenId === null ? "bg-accent font-bold" : ""}
										>
											{tTable("allPathogens")}
										</DropdownMenuItem>
										<DropdownMenuSeparator className="bg-border" />
										{pathogensList.map((p) => (
											<DropdownMenuItem
												key={p.id}
												onClick={() => handleFilterChange(p.id)}
												className={filterPathogenId === p.id ? "bg-accent font-bold" : ""}
											>
												{p.name}
											</DropdownMenuItem>
										))}
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
								{tTable("empty")}
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow key={item.id} className="border-border hover:bg-accent/50">
								<TableCell className="font-semibold text-primary align-top whitespace-normal break-words">
									{item.pathogen.name}
								</TableCell>
								<TableCell className="font-medium text-foreground align-top whitespace-normal break-words">
									{item.criterion.name}
								</TableCell>
								<TableCell className="align-top">
									<div className="bg-muted/40 p-2 rounded border border-border">
										<PrerequisiteFormatter formula={item.criterion.formula} />
									</div>
								</TableCell>
								<TableCell className="align-top">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(item)}
											className="hover:bg-accent h-8 w-8 text-foreground"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(item)}
											className="hover:bg-destructive/10 h-8 w-8 text-destructive"
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