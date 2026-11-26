"use client";

import { useState } from "react";
import { Edit, Trash, ListFilter, Loader2, Check, FilterX } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import { useTreatmentProtocolsList, useDropdownData } from "../queries";
import {
	type TreatmentProtocolItem,
	type SeverityLevel,
	type TreatmentSite,
	type AntibioticItem,
	type FilterTreatmentProtocolsRequest,
} from "../types";

const PAGE_SIZE = 10;
const INITIAL_VISIBLE_TREATMENTS = 3;

function TreatmentGroupList({ groups }: { groups: AntibioticItem[][] }) {
	const tTable = useTranslations("manager.treatmentProtocols.table");
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_TREATMENTS);

	const visibleGroups = groups.slice(0, visibleCount);
	const remainingCount = groups.length - visibleCount;

	return (
		<div className="flex flex-col gap-2">
			{visibleGroups.map((group, gIdx) => (
				<div
					key={gIdx}
					className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 p-2 text-xs sm:text-sm"
				>
					<span className="mr-1 text-xs font-bold text-muted-foreground">#{gIdx + 1}</span>
					{group.map((ab, idx) => (
						<span key={ab.id} className="flex flex-wrap items-center gap-1.5 break-words">
							<span className="font-medium text-primary break-words">{ab.name}</span>
							{idx < group.length - 1 && (
								<span className="text-xs font-bold text-muted-foreground">+</span>
							)}
						</span>
					))}
				</div>
			))}

			{remainingCount > 0 && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setVisibleCount((prev) => prev + 5)}
					className="h-7 self-start px-2 text-xs font-semibold text-primary hover:bg-primary/10"
				>
					{tTable("showMoreRegimens", {
						count: Math.min(5, remainingCount),
						remaining: remainingCount,
					})}
				</Button>
			)}
		</div>
	);
}

interface ProtocolFilterPopoverProps {
	activeFilterCount: number;
	filterSeverity: SeverityLevel | "ALL";
	filterSite: TreatmentSite | "ALL";
	selectedPathogenIds: string[];
	selectedCriteriaIds: string[];
	pathogens: { id: string; name: string }[];
	criteria: { id: string; name: string }[];
	onSeverityChange: (value: SeverityLevel | "ALL") => void;
	onSiteChange: (value: TreatmentSite | "ALL") => void;
	onTogglePathogen: (id: string) => void;
	onToggleCriteria: (id: string) => void;
	onReset: () => void;
}

function ProtocolFilterPopover({
	activeFilterCount,
	filterSeverity,
	filterSite,
	selectedPathogenIds,
	selectedCriteriaIds,
	pathogens,
	criteria,
	onSeverityChange,
	onSiteChange,
	onTogglePathogen,
	onToggleCriteria,
	onReset,
}: ProtocolFilterPopoverProps) {
	const tTable = useTranslations("manager.treatmentProtocols.table");
	const tForm = useTranslations("manager.treatmentProtocols.form");
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="relative h-8 w-8 text-foreground hover:bg-accent"
				>
					<ListFilter className="h-4 w-4" />
					{activeFilterCount > 0 && (
						<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							{activeFilterCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				collisionPadding={16}
				className="max-h-[70dvh] w-80 max-w-[calc(100vw-2rem)] space-y-4 overflow-y-auto border-border bg-popover p-4 text-popover-foreground shadow-lg"
			>
				<div className="flex items-center justify-between border-b border-border pb-2">
					<span className="text-sm font-bold text-foreground">
						{tTable("filterTitle")}
					</span>
					{activeFilterCount > 0 && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onReset}
							className="h-auto p-0 text-xs text-destructive hover:bg-transparent"
						>
							<FilterX className="mr-1 h-3.5 w-3.5" /> {tTable("clearFilters")}
						</Button>
					)}
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-semibold text-muted-foreground">
						{tTable("filterSeverityLabel")}
					</label>
					<Select
						value={filterSeverity}
						onValueChange={(v) => {
							if (v === "ALL" || v === "Mild" || v === "Moderate" || v === "Severe") {
								onSeverityChange(v);
							}
						}}
					>
						<SelectTrigger className="h-8 border-input bg-background text-xs text-foreground">
							<SelectValue placeholder={tTable("allSeverities")} />
						</SelectTrigger>
						<SelectContent className="max-w-[calc(100vw-2rem)] border-border bg-popover text-popover-foreground">
							<SelectItem value="ALL">{tTable("allSeverities")}</SelectItem>
							<SelectItem value="Mild">{tForm("severityMild")}</SelectItem>
							<SelectItem value="Moderate">{tForm("severityModerate")}</SelectItem>
							<SelectItem value="Severe">{tForm("severitySevere")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-semibold text-muted-foreground">
						{tTable("filterSiteLabel")}
					</label>
					<Select
						value={filterSite}
						onValueChange={(v) => {
							if (
								v === "ALL" ||
								v === "Outpatient" ||
								v === "Inpatient" ||
								v === "IntensiveCareUnit"
							) {
								onSiteChange(v);
							}
						}}
					>
						<SelectTrigger className="h-8 border-input bg-background text-xs text-foreground">
							<SelectValue placeholder={tTable("allSites")} />
						</SelectTrigger>
						<SelectContent className="max-w-[calc(100vw-2rem)] border-border bg-popover text-popover-foreground">
							<SelectItem value="ALL">{tTable("allSites")}</SelectItem>
							<SelectItem value="Outpatient">
								{tForm("treatmentSiteOutpatient")}
							</SelectItem>
							<SelectItem value="Inpatient">
								{tForm("treatmentSiteInpatient")}
							</SelectItem>
							<SelectItem value="IntensiveCareUnit">
								{tForm("treatmentSiteICU")}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-semibold text-muted-foreground">
						{tTable("filterPathogenLabel")}
					</label>
					<Command className="max-h-36 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground">
						<CommandInput
							placeholder={tTable("searchPathogenPlaceholder")}
							className="h-7 border-none text-xs focus:ring-0"
						/>
						<CommandList className="max-h-28">
							<CommandEmpty className="p-2 text-xs">
								{tForm("emptyPathogen")}
							</CommandEmpty>
							<CommandGroup>
								{pathogens.map((p) => (
									<CommandItem
										key={p.id}
										onSelect={() => onTogglePathogen(p.id)}
										className="cursor-pointer py-1 text-xs aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Check
											className={cn(
												"mr-2 h-3.5 w-3.5 shrink-0 text-primary",
												selectedPathogenIds.includes(p.id)
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										<span className="truncate">{p.name}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-semibold text-muted-foreground">
						{tTable("filterCriteriaLabel")}
					</label>
					<Command className="max-h-36 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground">
						<CommandInput
							placeholder={tTable("searchCriteriaPlaceholder")}
							className="h-7 border-none text-xs focus:ring-0"
						/>
						<CommandList className="max-h-28">
							<CommandEmpty className="p-2 text-xs">
								{tForm("emptyCriteria")}
							</CommandEmpty>
							<CommandGroup>
								{criteria.map((c) => (
									<CommandItem
										key={c.id}
										onSelect={() => onToggleCriteria(c.id)}
										className="cursor-pointer py-1 text-xs aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Check
											className={cn(
												"mr-2 h-3.5 w-3.5 shrink-0 text-primary",
												selectedCriteriaIds.includes(c.id)
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										<span className="truncate">{c.name}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</div>
			</PopoverContent>
		</Popover>
	);
}

interface TreatmentProtocolsTableProps {
	readOnly?: boolean;
	onEdit?: (item: TreatmentProtocolItem) => void;
	onDelete?: (item: TreatmentProtocolItem) => void;
}

export function TreatmentProtocolsTable({
	readOnly = false,
	onEdit,
	onDelete,
}: TreatmentProtocolsTableProps) {
	const tTable = useTranslations("manager.treatmentProtocols.table");
	const tForm = useTranslations("manager.treatmentProtocols.form");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);

	const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | "ALL">("ALL");
	const [filterSite, setFilterSite] = useState<TreatmentSite | "ALL">("ALL");
	const [selectedPathogenIds, setSelectedPathogenIds] = useState<string[]>([]);
	const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>([]);

	const { pathogens, criteria } = useDropdownData();

	const queryFilters: FilterTreatmentProtocolsRequest = {
		page,
		pageSize: PAGE_SIZE,
		severity: filterSeverity !== "ALL" ? filterSeverity : null,
		treatmentSite: filterSite !== "ALL" ? filterSite : null,
		pathogenIds: selectedPathogenIds.length > 0 ? selectedPathogenIds : undefined,
		criteriaIds: selectedCriteriaIds.length > 0 ? selectedCriteriaIds : undefined,
	};

	const { data: listData, isLoading, isFetching } = useTreatmentProtocolsList(queryFilters);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const columnCount = readOnly ? 4 : 5;
	const hasActions = !readOnly && Boolean(onEdit || onDelete);

	const activeFilterCount =
		(filterSeverity !== "ALL" ? 1 : 0) +
		(filterSite !== "ALL" ? 1 : 0) +
		selectedPathogenIds.length +
		selectedCriteriaIds.length;

	const resetFilters = () => {
		setFilterSeverity("ALL");
		setFilterSite("ALL");
		setSelectedPathogenIds([]);
		setSelectedCriteriaIds([]);
		setPage(1);
	};

	const togglePathogenFilter = (id: string) => {
		setPage(1);
		setSelectedPathogenIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const toggleCriteriaFilter = (id: string) => {
		setPage(1);
		setSelectedCriteriaIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const getSeverityText = (severity: SeverityLevel) => {
		switch (severity) {
			case "Mild":
				return tForm("severityMild");
			case "Moderate":
				return tForm("severityModerate");
			case "Severe":
				return tForm("severitySevere");
			default:
				return severity;
		}
	};

	const getTreatmentSiteText = (site: TreatmentSite) => {
		switch (site) {
			case "Outpatient":
				return tForm("treatmentSiteOutpatient");
			case "Inpatient":
				return tForm("treatmentSiteInpatient");
			case "IntensiveCareUnit":
				return tForm("treatmentSiteICU");
			default:
				return site;
		}
	};

	const getSeverityBadge = (severity: SeverityLevel) => {
		const styles = {
			Mild: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
			Moderate: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
			Severe: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
		};
		return (
			<Badge
				variant="outline"
				className={cn("shrink-0 whitespace-nowrap", styles[severity])}
			>
				{getSeverityText(severity)}
			</Badge>
		);
	};

	const renderStatusBadge = (isApplied: boolean) =>
		isApplied ? (
			<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
				{tTable("statusActive")}
			</span>
		) : (
			<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
				{tTable("statusInactive")}
			</span>
		);

	const renderIndications = (item: TreatmentProtocolItem) => (
		<div className="space-y-2.5">
			{item.pathogens.length > 0 && (
				<div className="space-y-1">
					<div className="text-[10px] font-bold uppercase text-muted-foreground">
						{tTable("riskFactorsHeading")}
					</div>
					<div className="flex flex-wrap gap-1">
						{item.pathogens.map((p) => (
							<Badge
								key={p.id}
								variant="secondary"
								className="whitespace-normal break-words border border-border bg-muted text-[10px] text-foreground"
							>
								{p.name}
							</Badge>
						))}
					</div>
				</div>
			)}
			{item.criteria.length > 0 && (
				<div className="space-y-1">
					<div className="text-[10px] font-bold uppercase text-muted-foreground">
						{tTable("criteriaHeading")}
					</div>
					<ul className="list-disc space-y-1 break-words pl-3.5 text-xs text-foreground/80">
						{item.criteria.map((c) => (
							<li key={c.id}>{c.name}</li>
						))}
					</ul>
				</div>
			)}
			{item.pathogens.length === 0 && item.criteria.length === 0 && (
				<span className="text-xs italic text-muted-foreground">
					{tTable("noFactors")}
				</span>
			)}
		</div>
	);

	const renderActionButtons = (item: TreatmentProtocolItem) => (
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

	const filterProps: ProtocolFilterPopoverProps = {
		activeFilterCount,
		filterSeverity,
		filterSite,
		selectedPathogenIds,
		selectedCriteriaIds,
		pathogens,
		criteria,
		onSeverityChange: (v) => {
			setFilterSeverity(v);
			setPage(1);
		},
		onSiteChange: (v) => {
			setFilterSite(v);
			setPage(1);
		},
		onTogglePathogen: togglePathogenFilter,
		onToggleCriteria: toggleCriteriaFilter,
		onReset: resetFilters,
	};

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
					<ProtocolFilterPopover {...filterProps} />
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
							className="space-y-3 rounded-lg border border-border bg-card p-3.5 shadow-xs"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex flex-wrap items-center gap-2">
									{getSeverityBadge(item.severity)}
									<span className="text-xs font-medium text-muted-foreground">
										{getTreatmentSiteText(item.treatmentSite)}
									</span>
								</div>
								{renderStatusBadge(item.isApplied)}
							</div>

							<div className="rounded-md bg-muted/30 p-2.5">
								{renderIndications(item)}
							</div>

							<div className="space-y-1.5">
								<div className="text-xs font-semibold text-muted-foreground">
									{tTable("colRegimens")}
								</div>
								<TreatmentGroupList groups={item.treatments} />
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
							<TableHead className="min-w-36 font-semibold text-muted-foreground">
								{tTable("colClassification")}
							</TableHead>
							<TableHead className="min-w-52 font-semibold text-muted-foreground lg:w-56">
								{tTable("colIndications")}
							</TableHead>
							<TableHead className="min-w-64 font-semibold text-muted-foreground">
								{tTable("colRegimens")}
							</TableHead>
							<TableHead className="min-w-28 whitespace-nowrap text-center font-semibold text-muted-foreground">
								{readOnly ? (
									<div className="flex items-center justify-center gap-1.5">
										<span>{tTable("colStatus")}</span>
										<ProtocolFilterPopover {...filterProps} />
									</div>
								) : (
									tTable("colStatus")
								)}
							</TableHead>
							{!readOnly && (
								<TableHead className="min-w-24 whitespace-nowrap text-right font-semibold text-muted-foreground">
									<div className="flex items-center justify-end gap-2">
										{tCommon("actions")}
										<ProtocolFilterPopover {...filterProps} />
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
								<TableRow
									key={item.id}
									className="border-border align-top transition-colors hover:bg-accent/50"
								>
									<TableCell>
										<div className="space-y-2">
											{getSeverityBadge(item.severity)}
											<div className="text-xs font-medium text-muted-foreground">
												{getTreatmentSiteText(item.treatmentSite)}
											</div>
										</div>
									</TableCell>
									<TableCell>{renderIndications(item)}</TableCell>
									<TableCell>
										<TreatmentGroupList groups={item.treatments} />
									</TableCell>
									<TableCell className="whitespace-nowrap text-center">
										{renderStatusBadge(item.isApplied)}
									</TableCell>
									{!readOnly && (
										<TableCell className="whitespace-nowrap">
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