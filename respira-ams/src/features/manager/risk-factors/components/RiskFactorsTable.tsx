"use client";

import { useState } from "react";
import { Edit, Trash, Loader2, ListFilter, AlertCircle, Check } from "lucide-react";
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

import { useRiskFactorsList, usePathogensDropdown } from "../queries";
import { type RiskFactorItem } from "../types";
import { PrerequisiteFormatter } from "../../components/PrerequisiteFormatter";

const PAGE_SIZE = 10;

interface RiskFactorsFilterDropdownProps {
	filterPathogenId: string | null;
	pathogensList: { id: string; name: string }[];
	onFilterChange: (id: string | null) => void;
}

function RiskFactorsFilterDropdown({
	filterPathogenId,
	pathogensList,
	onFilterChange,
}: RiskFactorsFilterDropdownProps) {
	const tTable = useTranslations("manager.riskFactors.table");

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
					{filterPathogenId !== null && (
						<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							1
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				collisionPadding={16}
				className="max-h-[60dvh] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto border-border bg-popover text-popover-foreground"
			>
				<DropdownMenuLabel>{tTable("filterTitle")}</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-border" />
				<DropdownMenuItem
					onClick={() => onFilterChange(null)}
					className={cn(
						"justify-between",
						filterPathogenId === null && "bg-accent font-bold",
					)}
				>
					<span>{tTable("allPathogens")}</span>
					{filterPathogenId === null && <Check className="h-4 w-4 shrink-0" />}
				</DropdownMenuItem>
				<DropdownMenuSeparator className="bg-border" />
				{pathogensList.map((p) => (
					<DropdownMenuItem
						key={p.id}
						onClick={() => onFilterChange(p.id)}
						className={cn(
							"justify-between gap-2",
							filterPathogenId === p.id && "bg-accent font-bold",
						)}
					>
						<span className="truncate">{p.name}</span>
						{filterPathogenId === p.id && <Check className="h-4 w-4 shrink-0" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface RiskFactorsTableProps {
	readOnly?: boolean;
	onEdit?: (item: RiskFactorItem) => void;
	onDelete?: (item: RiskFactorItem) => void;
}

export function RiskFactorsTable({
	readOnly = false,
	onEdit,
	onDelete,
}: RiskFactorsTableProps) {
	const tTable = useTranslations("manager.riskFactors.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [filterPathogenId, setFilterPathogenId] = useState<string | null>(null);

	const {
		data: listData,
		isLoading,
		isFetching,
	} = useRiskFactorsList(page, PAGE_SIZE, filterPathogenId);
	const { data: pathogensData } = usePathogensDropdown();

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const pathogensList = pathogensData?.pathogens || [];
	const columnCount = readOnly ? 4 : 5;
	const hasActions = !readOnly && Boolean(onEdit || onDelete);

	const handleFilterChange = (id: string | null) => {
		setFilterPathogenId(id);
		setPage(1);
	};

	const renderSeverityBadge = (isCriticalFactor: boolean) =>
		isCriticalFactor ? (
			<span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-destructive/30 bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
				<AlertCircle className="h-3 w-3 shrink-0" /> {tTable("critical")}
			</span>
		) : (
			<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
				{tTable("normal")}
			</span>
		);

	const renderActionButtons = (item: RiskFactorItem) => (
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
					<RiskFactorsFilterDropdown
						filterPathogenId={filterPathogenId}
						pathogensList={pathogensList}
						onFilterChange={handleFilterChange}
					/>
				</div>

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
							className="space-y-2.5 rounded-lg border border-border bg-card p-3.5 shadow-xs"
						>
							<div className="flex items-start justify-between gap-2">
								<p className="min-w-0 font-semibold text-primary break-words">
									{item.pathogen.name}
								</p>
								{renderSeverityBadge(item.isCriticalFactor)}
							</div>

							<div className="space-y-1">
								<div className="text-xs font-medium text-muted-foreground">
									{tTable("colCriterionName")}
								</div>
								<p className="text-sm font-medium text-foreground break-words">
									{item.criterion.name}
								</p>
							</div>

							<div className="space-y-1">
								<div className="text-xs font-medium text-muted-foreground">
									{tTable("colFormula")}
								</div>
								<div className="rounded border border-border bg-muted/40 p-2 text-xs whitespace-normal break-words">
									{item.criterion.formula}
								</div>
							</div>

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
							<TableHead className="min-w-40 font-semibold text-muted-foreground lg:w-1/6">
								{tTable("colPathogen")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colSeverity")}
							</TableHead>
							<TableHead className="min-w-44 font-semibold text-muted-foreground lg:w-1/6">
								{tTable("colCriterionName")}
							</TableHead>
							<TableHead className="min-w-60 font-semibold text-muted-foreground">
								{readOnly ? (
									<div className="flex items-center justify-between gap-2">
										<span>{tTable("colFormula")}</span>
										<RiskFactorsFilterDropdown
											filterPathogenId={filterPathogenId}
											pathogensList={pathogensList}
											onFilterChange={handleFilterChange}
										/>
									</div>
								) : (
									tTable("colFormula")
								)}
							</TableHead>
							{!readOnly && (
								<TableHead className="w-[120px] whitespace-nowrap text-right font-semibold text-muted-foreground">
									<div className="flex items-center justify-end gap-2">
										{tCommon("actions")}
										<RiskFactorsFilterDropdown
											filterPathogenId={filterPathogenId}
											pathogensList={pathogensList}
											onFilterChange={handleFilterChange}
										/>
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
									{tTable("empty")}
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => (
								<TableRow key={item.id} className="border-border hover:bg-accent/50">
									<TableCell className="align-top font-semibold text-primary whitespace-normal break-words">
										{item.pathogen.name}
									</TableCell>
									<TableCell className="whitespace-nowrap align-top">
										{renderSeverityBadge(item.isCriticalFactor)}
									</TableCell>
									<TableCell className="align-top font-medium text-foreground whitespace-normal break-words">
										{item.criterion.name}
									</TableCell>
									<TableCell className="align-top">
										<div className="rounded border border-border bg-muted/40 p-2 whitespace-normal break-words">
											{item.criterion.formula}
										</div>
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