"use client";

import { useState } from "react";
import { Edit, ListFilter, Loader2, Eye, Trash, Check } from "lucide-react";
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

import { useClinicalMetricsList } from "../queries";
import { type ClinicalMetricItem } from "../types";

const PAGE_SIZE = 10;

interface ClinicalMetricsFilterDropdownProps {
	filterApplied: boolean | null;
	onFilterChange: (value: boolean | null) => void;
}

function ClinicalMetricsFilterDropdown({
	filterApplied,
	onFilterChange,
}: ClinicalMetricsFilterDropdownProps) {
	const tTable = useTranslations("manager.clinicalMetrics.table");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="relative h-8 w-8 text-foreground hover:bg-accent"
				>
					<ListFilter className="h-4 w-4" />
					{filterApplied !== null && (
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
				<DropdownMenuLabel>{tTable("filterTitle")}</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-border" />
				<DropdownMenuItem
					onClick={() => onFilterChange(null)}
					className={cn(
						"justify-between",
						filterApplied === null && "bg-accent font-bold",
					)}
				>
					<span>{tTable("filterAll")}</span>
					{filterApplied === null && <Check className="h-4 w-4 shrink-0" />}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onFilterChange(true)}
					className={cn(
						"justify-between",
						filterApplied === true && "bg-accent font-bold",
					)}
				>
					<span>{tTable("filterActive")}</span>
					{filterApplied === true && <Check className="h-4 w-4 shrink-0" />}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onFilterChange(false)}
					className={cn(
						"justify-between",
						filterApplied === false && "bg-accent font-bold",
					)}
				>
					<span>{tTable("filterInactive")}</span>
					{filterApplied === false && <Check className="h-4 w-4 shrink-0" />}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface ClinicalMetricsTableProps {
	readOnly?: boolean;
	searchName?: string;
	onViewDetail: (id: string) => void;
	onEdit?: (item: ClinicalMetricItem) => void;
	onDelete?: (item: ClinicalMetricItem) => void;
}

export function ClinicalMetricsTable({
	readOnly = false,
	searchName = "",
	onViewDetail,
	onEdit,
	onDelete,
}: ClinicalMetricsTableProps) {
	const tTable = useTranslations("manager.clinicalMetrics.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [filterApplied, setFilterApplied] = useState<boolean | null>(null);

	const [prevFilters, setPrevFilters] = useState({ searchName, filterApplied });
	if (searchName !== prevFilters.searchName || filterApplied !== prevFilters.filterApplied) {
		setPrevFilters({ searchName, filterApplied });
		setPage(1);
	}

	const {
		data: listData,
		isLoading,
		isFetching,
		isError,
	} = useClinicalMetricsList(page, PAGE_SIZE, searchName, filterApplied);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

	const renderStatusBadge = (isApplied: boolean) =>
		isApplied ? (
			<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
				{tTable("statusActive")}
			</span>
		) : (
			<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
				{tTable("statusInactive")}
			</span>
		);

	const renderActionButtons = (item: ClinicalMetricItem) => (
		<div className="flex items-center justify-end gap-1.5 lg:gap-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={(e) => {
					e.stopPropagation();
					onViewDetail(item.id);
				}}
				className="h-8 w-8 text-foreground hover:bg-accent"
				title={tTable("viewDetailTooltip")}
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
					className="h-8 w-8 text-destructive hover:bg-destructive/10"
				>
					<Trash className="h-4 w-4" />
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
						{tTable("filterTitle")}
					</span>
					<ClinicalMetricsFilterDropdown
						filterApplied={filterApplied}
						onFilterChange={setFilterApplied}
					/>
				</div>

				{isLoading ? (
					<div className="flex h-32 items-center justify-center rounded-lg border border-border text-muted-foreground">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : isError ? (
					<div className="rounded-lg border border-border py-10 text-center text-sm text-destructive">
						{tTable("loadError")}
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
							<div className="flex items-start justify-between gap-2">
								<p className="min-w-0 font-semibold text-primary break-words">
									{item.name}
								</p>
								{renderStatusBadge(item.isApplied)}
							</div>

							{item.description && (
								<p className="text-xs text-muted-foreground whitespace-normal break-words">
									{item.description}
								</p>
							)}

							<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
								<span className="font-mono text-foreground">
									<span className="font-bold">{item.code}</span>{" "}
									<span className="text-muted-foreground">v.{item.version}</span>
								</span>
								{item.publisher && (
									<span className="text-muted-foreground break-words">
										• {item.publisher}
									</span>
								)}
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
							<TableHead className="min-w-52 font-semibold text-muted-foreground lg:w-1/4">
								{tTable("colName")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colCodeVersion")}
							</TableHead>
							<TableHead className="min-w-40 font-semibold text-muted-foreground lg:w-1/4">
								{tTable("colPublisher")}
							</TableHead>
							<TableHead className="whitespace-nowrap text-center font-semibold text-muted-foreground">
								{tTable("colStatus")}
							</TableHead>
							<TableHead className="whitespace-nowrap text-right font-semibold text-muted-foreground">
								<div className="flex items-center justify-end gap-2">
									{tCommon("actions")}
									<ClinicalMetricsFilterDropdown
										filterApplied={filterApplied}
										onFilterChange={setFilterApplied}
									/>
								</div>
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{isLoading ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={5}
									className="h-32 text-center text-muted-foreground"
								>
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
								</TableCell>
							</TableRow>
						) : isError ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={5}
									className="py-10 text-center text-destructive"
								>
									{tTable("loadError")}
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={5}
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
									onDoubleClick={() => onViewDetail(item.id)}
								>
									<TableCell className="align-top font-semibold text-primary whitespace-normal break-words">
										{item.name}
										<p className="mt-1 text-xs font-normal text-muted-foreground">
											{item.description}
										</p>
									</TableCell>
									<TableCell className="whitespace-nowrap align-top font-mono text-sm text-foreground">
										<span className="font-bold">{item.code}</span> <br />
										<span className="text-xs text-muted-foreground">
											v.{item.version}
										</span>
									</TableCell>
									<TableCell className="align-top text-sm text-foreground whitespace-normal break-words">
										{item.publisher}
									</TableCell>
									<TableCell className="whitespace-nowrap align-top text-center">
										{renderStatusBadge(item.isApplied)}
									</TableCell>
									<TableCell className="whitespace-nowrap align-top">
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