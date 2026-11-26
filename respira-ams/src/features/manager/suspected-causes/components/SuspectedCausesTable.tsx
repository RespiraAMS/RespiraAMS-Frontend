"use client";

import { useState } from "react";
import { Edit, ListFilter, Trash, Loader2, ChevronDown, Check } from "lucide-react";
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

import { useSuspectedCauses, usePathogensDropdown } from "../queries";
import { type SuspectedCauseItem, type Severity, type TreatmentSite } from "../types";

const PAGE_SIZE = 10;

interface SuspectedCausesTableProps {
	readOnly?: boolean;
	onEdit?: (item: SuspectedCauseItem) => void;
	onDelete?: (item: SuspectedCauseItem) => void;
}

export function SuspectedCausesTable({
	readOnly = false,
	onEdit,
	onDelete,
}: SuspectedCausesTableProps) {
	const t = useTranslations("manager.suspectedCauses");
	const tTable = useTranslations("manager.suspectedCauses.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);

	const [filterPathogen, setFilterPathogen] = useState<string>("");
	const [filterSeverity, setFilterSeverity] = useState<Severity | "">("");
	const [filterSite, setFilterSite] = useState<TreatmentSite | "">("");
	const [openFilterSection, setOpenFilterSection] = useState<
		"pathogen" | "severity" | "site" | null
	>(null);

	const {
		data: listData,
		isLoading,
		isFetching,
	} = useSuspectedCauses(page, PAGE_SIZE, filterPathogen, filterSeverity, filterSite);
	const { data: pathogensData } = usePathogensDropdown();
	const pathogensList = pathogensData?.pathogens || [];

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const columnCount = readOnly ? 3 : 4;
	const hasActions = !readOnly && Boolean(onEdit || onDelete);
	const selectedPathogenName = pathogensList.find((p) => p.id === filterPathogen)?.name;

	const handleFilterChange = (type: "pathogen" | "severity" | "site", value: string) => {
		if (type === "pathogen") setFilterPathogen(value);
		if (type === "severity") setFilterSeverity(value as Severity | "");
		if (type === "site") setFilterSite(value as TreatmentSite | "");
		setPage(1);
	};

	const countActiveFilters = () => {
		let count = 0;
		if (filterPathogen) count++;
		if (filterSeverity) count++;
		if (filterSite) count++;
		return count;
	};

	const clearFilters = () => {
		setFilterPathogen("");
		setFilterSeverity("");
		setFilterSite("");
		setOpenFilterSection(null);
		setPage(1);
	};

	const formatSeverity = (severity: Severity) => {
		switch (severity) {
			case "Mild":
				return t("form.severityMild");
			case "Moderate":
				return t("form.severityModerate");
			case "Severe":
				return t("form.severitySevere");
			default:
				return severity;
		}
	};

	const formatTreatmentSite = (site: TreatmentSite) => {
		switch (site) {
			case "Outpatient":
				return t("form.siteOutpatient");
			case "Inpatient":
				return t("form.siteInpatient");
			case "IntensiveCareUnit":
				return t("form.siteICU");
			default:
				return site;
		}
	};

	const renderSeverityBadge = (severity: Severity) => (
		<span
			className={cn(
				"inline-flex shrink-0 items-center whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold",
				severity === "Severe"
					? "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400"
					: severity === "Moderate"
						? "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
						: "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
			)}
		>
			{formatSeverity(severity)}
		</span>
	);

	const renderActionButtons = (item: SuspectedCauseItem) => (
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

	const filterDropdown = (
		<DropdownMenu onOpenChange={(open) => !open && setOpenFilterSection(null)}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative h-8 w-8 text-foreground hover:bg-accent"
				>
					<ListFilter className="h-4 w-4" />
					{countActiveFilters() > 0 && (
						<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							{countActiveFilters()}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				collisionPadding={16}
				className="w-64 max-w-[calc(100vw-2rem)] border-border bg-popover text-popover-foreground"
			>
				<DropdownMenuLabel>{tTable("filterData")}</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<div>
					<button
						type="button"
						onClick={() =>
							setOpenFilterSection((prev) =>
								prev === "pathogen" ? null : "pathogen",
							)
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterByPathogen")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{selectedPathogenName && (
								<span className="truncate font-medium text-primary">
									{selectedPathogenName}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openFilterSection === "pathogen" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openFilterSection === "pathogen" && (
						<div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => handleFilterChange("pathogen", "")}
								className={cn(
									"justify-between text-xs",
									filterPathogen === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterPathogen === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{pathogensList.map((p) => (
								<DropdownMenuItem
									key={p.id}
									onClick={() => handleFilterChange("pathogen", p.id)}
									className={cn(
										"justify-between gap-2 text-xs",
										filterPathogen === p.id && "bg-accent font-semibold",
									)}
								>
									<span className="truncate">{p.name}</span>
									{filterPathogen === p.id && (
										<Check className="h-3.5 w-3.5 shrink-0" />
									)}
								</DropdownMenuItem>
							))}
						</div>
					)}
				</div>

				<DropdownMenuSeparator />

				<div>
					<button
						type="button"
						onClick={() =>
							setOpenFilterSection((prev) =>
								prev === "severity" ? null : "severity",
							)
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterBySeverity")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{filterSeverity && (
								<span className="truncate font-medium text-primary">
									{formatSeverity(filterSeverity)}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openFilterSection === "severity" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openFilterSection === "severity" && (
						<div className="mt-1 space-y-0.5 border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => handleFilterChange("severity", "")}
								className={cn(
									"justify-between text-xs",
									filterSeverity === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterSeverity === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{(["Mild", "Moderate", "Severe"] as Severity[]).map((sev) => (
								<DropdownMenuItem
									key={sev}
									onClick={() => handleFilterChange("severity", sev)}
									className={cn(
										"justify-between text-xs",
										filterSeverity === sev && "bg-accent font-semibold",
									)}
								>
									<span>{formatSeverity(sev)}</span>
									{filterSeverity === sev && <Check className="h-3.5 w-3.5" />}
								</DropdownMenuItem>
							))}
						</div>
					)}
				</div>

				<DropdownMenuSeparator />

				<div>
					<button
						type="button"
						onClick={() =>
							setOpenFilterSection((prev) => (prev === "site" ? null : "site"))
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterBySite")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{filterSite && (
								<span className="truncate font-medium text-primary">
									{formatTreatmentSite(filterSite)}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openFilterSection === "site" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openFilterSection === "site" && (
						<div className="mt-1 space-y-0.5 border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => handleFilterChange("site", "")}
								className={cn(
									"justify-between text-xs",
									filterSite === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterSite === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{(
								["Outpatient", "Inpatient", "IntensiveCareUnit"] as TreatmentSite[]
							).map((site) => (
								<DropdownMenuItem
									key={site}
									onClick={() => handleFilterChange("site", site)}
									className={cn(
										"justify-between text-xs",
										filterSite === site && "bg-accent font-semibold",
									)}
								>
									<span>{formatTreatmentSite(site)}</span>
									{filterSite === site && <Check className="h-3.5 w-3.5" />}
								</DropdownMenuItem>
							))}
						</div>
					)}
				</div>

				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={clearFilters}
					disabled={countActiveFilters() === 0}
					className="cursor-pointer text-destructive focus:text-destructive"
				>
					{tTable("clearFilter")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
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
						{tTable("filterData")}
					</span>
					{filterDropdown}
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
									{item.pathogenName}
								</p>
								{renderSeverityBadge(item.severity)}
							</div>

							<p className="text-xs text-muted-foreground">
								<span className="font-medium">{tTable("colSite")}:</span>{" "}
								<span className="font-medium text-foreground">
									{formatTreatmentSite(item.treatmentSite)}
								</span>
							</p>

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
							<TableHead className="min-w-44 lg:w-1/3 font-semibold text-muted-foreground">
								{tTable("colPathogen")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colSeverity")}
							</TableHead>
							<TableHead className="min-w-40 whitespace-nowrap font-semibold text-muted-foreground">
								{readOnly ? (
									<div className="flex items-center justify-between gap-2">
										<span>{tTable("colSite")}</span>
										{filterDropdown}
									</div>
								) : (
									tTable("colSite")
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
									{tTable("empty")}
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => (
								<TableRow key={item.id} className="border-border hover:bg-accent/50">
									<TableCell className="font-semibold text-primary">
										{item.pathogenName}
									</TableCell>
									<TableCell className="whitespace-nowrap">
										{renderSeverityBadge(item.severity)}
									</TableCell>
									<TableCell className="whitespace-nowrap">
										<span className="text-sm font-medium text-foreground">
											{formatTreatmentSite(item.treatmentSite)}
										</span>
									</TableCell>
									{!readOnly && (
										<TableCell className="whitespace-nowrap text-right">
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