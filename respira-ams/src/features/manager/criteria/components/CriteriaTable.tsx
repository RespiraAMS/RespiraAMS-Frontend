"use client";

import { useState } from "react";
import { Edit, Trash, Loader2, Eye } from "lucide-react";
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

import { useCriteriaList } from "../queries";
import { type CriteriaItem } from "../types";
import { PrerequisiteFormatter } from "../../components/PrerequisiteFormatter";

const PAGE_SIZE = 10;

interface CriteriaTableProps {
	readOnly?: boolean;
	onViewDetail: (id: string) => void;
	onEdit?: (item: CriteriaItem) => void;
	onDelete?: (item: CriteriaItem) => void;
}

export function CriteriaTable({
	readOnly = false,
	onViewDetail,
	onEdit,
	onDelete,
}: CriteriaTableProps) {
	const tTable = useTranslations("manager.criteria.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);

	const { data: listData, isLoading, isFetching } = useCriteriaList(page, PAGE_SIZE);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

	const renderActionButtons = (item: CriteriaItem) => (
		<div className="flex items-center justify-end gap-1.5 lg:gap-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={(e) => {
					e.stopPropagation();
					onViewDetail(item.id);
				}}
				className="h-8 w-8 text-foreground hover:bg-accent"
			>
				<Eye className="h-4 w-4" />
			</Button>
			{!readOnly && onEdit && (
				<Button
					variant="ghost"
					size="icon"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(item);
					}}
					className="h-8 w-8 text-foreground hover:bg-accent"
				>
					<Edit className="h-4 w-4" />
				</Button>
			)}
			{!readOnly && onDelete && (
				<Button
					variant="ghost"
					size="icon"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(item);
					}}
					className="h-8 w-8 hover:bg-destructive/10"
				>
					<Trash className="h-4 w-4 text-destructive" />
				</Button>
			)}
		</div>
	);

	return (
		<div className="relative text-foreground">
			{isFetching && (
				<div className="absolute left-0 right-0 top-0 z-10 h-1 overflow-hidden rounded-t-md bg-primary/20">
					<div className="h-full w-1/2 translate-x-1/2 animate-pulse bg-primary" />
				</div>
			)}

			<div className="space-y-3 md:hidden">
				{isLoading ? (
					<div className="flex h-32 items-center justify-center rounded-lg border border-border text-muted-foreground">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : items.length === 0 ? (
					<div className="rounded-lg border border-border py-10 text-center text-sm text-muted-foreground">
						{tTable("empty")}
					</div>
				) : (
					items.map((item) => (
						<div
							key={item.id}
							onClick={() => onViewDetail(item.id)}
							className="cursor-pointer space-y-2.5 rounded-lg border border-border bg-card p-3.5 shadow-xs transition-colors hover:bg-accent/50"
						>
							<p className="font-semibold text-primary break-words">{item.name}</p>

							<div className="space-y-1">
								<div className="text-xs font-medium text-muted-foreground">
									{tTable("colFormula")}
								</div>
								<div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs whitespace-normal break-words">
									{item.formula}
								</div>
							</div>

							<div className="border-t border-border pt-2">
								{renderActionButtons(item)}
							</div>
						</div>
					))
				)}
			</div>

			<div className="hidden md:block">
				<Table className="border-border">
					<TableHeader>
						<TableRow className="border-border hover:bg-transparent">
							<TableHead className="min-w-44 font-semibold text-muted-foreground lg:w-1/4">
								{tTable("colName")}
							</TableHead>
							<TableHead className="min-w-64 font-semibold text-muted-foreground">
								{tTable("colFormula")}
							</TableHead>
							<TableHead className="w-[150px] whitespace-nowrap text-right font-semibold text-muted-foreground">
								{tCommon("actions")}
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{isLoading ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={3}
									className="h-32 text-center text-muted-foreground"
								>
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={3}
									className="py-10 text-center text-muted-foreground"
								>
									{tTable("empty")}
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => (
								<TableRow
									key={item.id}
									className="cursor-pointer border-border transition-colors hover:bg-accent/50"
									onClick={() => onViewDetail(item.id)}
								>
									<TableCell className="align-top font-semibold text-primary whitespace-normal break-words">
										{item.name}
									</TableCell>
									<TableCell className="align-top">
										<div className="rounded-lg border border-border bg-muted/40 p-2 text-sm whitespace-normal break-words">
											{item.formula}
										</div>
									</TableCell>
									<TableCell className="align-top whitespace-nowrap">
										{renderActionButtons(item)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<Pagination className="mt-4">
					<PaginationContent className="flex-wrap justify-center">
						<PaginationItem>
							<PaginationPrevious
								className={
									page > 1
										? "cursor-pointer hover:bg-accent"
										: "pointer-events-none opacity-50"
								}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							/>
						</PaginationItem>
						<span className="px-2 text-sm text-muted-foreground">
							{tCommon("pageOf", { page, totalPages })}
						</span>
						<PaginationItem>
							<PaginationNext
								className={
									page < totalPages
										? "cursor-pointer hover:bg-accent"
										: "pointer-events-none opacity-50"
								}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}