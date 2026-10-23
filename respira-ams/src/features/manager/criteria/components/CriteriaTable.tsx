"use client";

import { useState } from "react";
import { Edit, Trash, Loader2, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { useCriteriaList } from "../queries";
import { type CriteriaItem } from "../types";
import { PrerequisiteFormatter } from "../../components/PrerequisiteFormatter";

const PAGE_SIZE = 10;

interface CriteriaTableProps {
	onViewDetail: (id: string) => void;
	onEdit: (item: CriteriaItem) => void;
	onDelete: (item: CriteriaItem) => void;
}

export function CriteriaTable({ onViewDetail, onEdit, onDelete }: CriteriaTableProps) {
	const tTable = useTranslations("manager.criteria.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);

	const { data: listData, isLoading, isFetching } = useCriteriaList(page, PAGE_SIZE);

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
						<TableHead className="text-muted-foreground font-semibold">{tTable("colFormula")}</TableHead>
						<TableHead className="text-muted-foreground text-right w-[150px] font-semibold">
							{tCommon("actions")}
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow className="border-border">
							<TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
								<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
							</TableCell>
						</TableRow>
					) : items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell colSpan={3} className="text-center text-muted-foreground py-10">
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
								<TableCell className="font-semibold text-primary align-top whitespace-normal break-words">
									{item.name}
								</TableCell>
								<TableCell className="align-top">
									<div className="bg-muted/40 p-2 rounded-lg border border-border">
										<PrerequisiteFormatter formula={item.formula} />
									</div>
								</TableCell>
								<TableCell className="align-top">
									<div className="flex justify-end gap-1">
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
												onEdit(item);
											}}
											className="hover:bg-accent text-foreground"
										>
											<Edit className="h-4 w-4" />
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