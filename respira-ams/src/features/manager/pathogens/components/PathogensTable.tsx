"use client";

import { useState } from "react";
import { Edit, ListFilter, Trash, Loader2, Check } from "lucide-react";
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
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { usePathogens } from "../queries";
import { type PathogenItem } from "../types";

const PAGE_SIZE = 10;

interface PathogensTableProps {
	readOnly?: boolean;
	searchName?: string;
	onEdit?: (item: PathogenItem) => void;
	onDelete?: (item: PathogenItem) => void;
}

export function PathogensTable({
	readOnly = false,
	searchName = "",
	onEdit,
	onDelete,
}: PathogensTableProps) {
	const t = useTranslations("manager.pathogens.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [filterAtypical, setFilterAtypical] = useState<boolean | null>(null);

	const [prevFilters, setPrevFilters] = useState({ searchName, filterAtypical });
	if (searchName !== prevFilters.searchName || filterAtypical !== prevFilters.filterAtypical) {
		setPrevFilters({ searchName, filterAtypical });
		setPage(1);
	}

	const {
		data: listData,
		isLoading,
		isFetching,
	} = usePathogens(page, PAGE_SIZE, searchName, filterAtypical);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const columnCount = readOnly ? 3 : 4;
	const hasActions = !readOnly && Boolean(onEdit || onDelete);

	const filterDropdown = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative h-8 w-8 text-foreground hover:bg-accent"
				>
					<ListFilter className="h-4 w-4" />
					{filterAtypical !== null && (
						<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							1
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				collisionPadding={16}
				className="w-56 max-w-[calc(100vw-2rem)] border-border bg-popover text-popover-foreground"
			>
				<DropdownMenuLabel>{t("filterData")}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => setFilterAtypical(null)}
					className={cn(
						"justify-between",
						filterAtypical === null && "bg-accent font-semibold",
					)}
				>
					<span>{t("allTypes")}</span>
					{filterAtypical === null && <Check className="h-4 w-4 shrink-0" />}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setFilterAtypical(false)}
					className={cn(
						"justify-between",
						filterAtypical === false && "bg-accent font-semibold",
					)}
				>
					<span>{t("typical")}</span>
					{filterAtypical === false && <Check className="h-4 w-4 shrink-0" />}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setFilterAtypical(true)}
					className={cn(
						"justify-between",
						filterAtypical === true && "bg-accent font-semibold",
					)}
				>
					<span>{t("atypical")}</span>
					{filterAtypical === true && <Check className="h-4 w-4 shrink-0" />}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const renderTypeBadge = (isAtypical: boolean) =>
		isAtypical ? (
			<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
				{t("atypical")}
			</span>
		) : (
			<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
				{t("typical")}
			</span>
		);

	const renderActionButtons = (item: PathogenItem) => (
		<div className="flex items-center justify-end gap-1.5 lg:gap-1">
			{onEdit && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onEdit(item)}
					className="h-8 w-8 text-foreground hover:bg-accent"
				>
					<Edit className="h-4 w-4" />
				</Button>
			)}
			{onDelete && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDelete(item)}
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
				<div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
					<span className="text-xs font-medium text-muted-foreground">
						{t("filterData")}
					</span>
					{filterDropdown}
				</div>

				{isLoading ? (
					<div className="flex h-32 items-center justify-center rounded-lg border border-border text-muted-foreground">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : items.length === 0 ? (
					<div className="rounded-lg border border-border py-10 text-center text-sm text-muted-foreground">
						{t("empty")}
					</div>
				) : (
					items.map((item) => (
						<div
							key={item.id}
							className="space-y-2.5 rounded-lg border border-border bg-card p-3.5 shadow-xs"
						>
							<div className="flex items-start justify-between gap-2">
								<p className="min-w-0 font-semibold text-primary break-words">
									{item.name}
								</p>
								{renderTypeBadge(item.isAtypical)}
							</div>

							{item.description && (
								<p className="text-sm text-muted-foreground whitespace-normal break-words">
									{item.description}
								</p>
							)}

							{hasActions && (
								<div className="border-t border-border pt-2">
									{renderActionButtons(item)}
								</div>
							)}
						</div>
					))
				)}
			</div>

			<div className="hidden md:block">
				<Table className="border-border">
					<TableHeader>
						<TableRow className="border-border hover:bg-transparent">
							<TableHead className="min-w-44 lg:w-1/4 font-semibold text-muted-foreground">
								{t("colName")}
							</TableHead>
							<TableHead className="min-w-32 lg:w-1/4 whitespace-nowrap font-semibold text-muted-foreground">
								{t("colType")}
							</TableHead>
							<TableHead className="min-w-60 font-semibold text-muted-foreground">
								{readOnly ? (
									<div className="flex items-center justify-between gap-2">
										<span>{t("colDescription")}</span>
										{filterDropdown}
									</div>
								) : (
									t("colDescription")
								)}
							</TableHead>
							{!readOnly && (
								<TableHead className="whitespace-nowrap text-right font-semibold text-muted-foreground">
									<div className="flex items-center justify-end gap-2">
										{tCommon("actions")}
										{filterDropdown}
									</div>
								</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={columnCount}
									className="h-32 text-center text-muted-foreground"
								>
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={columnCount}
									className="py-10 text-center text-muted-foreground"
								>
									{t("empty")}
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => (
								<TableRow key={item.id} className="border-border hover:bg-accent/50">
									<TableCell className="align-top font-semibold text-primary">
										{item.name}
									</TableCell>
									<TableCell className="whitespace-nowrap align-top">
										{renderTypeBadge(item.isAtypical)}
									</TableCell>
									<TableCell className="max-w-[60ch] whitespace-normal break-words align-top">
										<p
											className="text-sm text-muted-foreground"
											title={item.description}
										>
											{item.description}
										</p>
									</TableCell>
									{!readOnly && (
										<TableCell className="whitespace-nowrap align-top">
											{renderActionButtons(item)}
										</TableCell>
									)}
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