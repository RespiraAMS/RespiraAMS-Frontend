"use client";

import { useState } from "react";
import { Edit, Trash, ListFilter, Loader2, Check, FilterX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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
					className="flex items-center flex-wrap gap-1.5 p-2 bg-muted/40 rounded-md border border-border/60 text-sm"
				>
					<span className="font-bold text-muted-foreground mr-1 text-xs">#{gIdx + 1}</span>
					{group.map((ab, idx) => (
						<span key={ab.id} className="flex items-center gap-1.5">
							<span className="font-medium text-primary">{ab.name}</span>
							{idx < group.length - 1 && <span className="text-muted-foreground font-bold text-xs">+</span>}
						</span>
					))}
				</div>
			))}

			{remainingCount > 0 && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setVisibleCount((prev) => prev + 5)}
					className="self-start text-xs font-semibold text-primary hover:bg-primary/10 h-7 px-2"
				>
					{tTable("showMoreRegimens", { count: Math.min(5, remainingCount), remaining: remainingCount })}
				</Button>
			)}
		</div>
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

	const [isFilterOpen, setIsFilterOpen] = useState(false);

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
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	const toggleCriteriaFilter = (id: string) => {
		setPage(1);
		setSelectedCriteriaIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
			<Badge variant="outline" className={styles[severity]}>
				{getSeverityText(severity)}
			</Badge>
		);
	};

	const filterPopover = (
		<Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative hover:bg-accent text-foreground h-8 w-8"
				>
					<ListFilter className="h-4 w-4" />
					{activeFilterCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
							{activeFilterCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-80 p-4 space-y-4 border-border bg-popover text-popover-foreground shadow-lg max-h-[60vh] overflow-y-auto"
			>
				<div className="flex items-center justify-between border-b border-border pb-2">
					<span className="font-bold text-sm text-foreground">{tTable("filterTitle")}</span>
					{activeFilterCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={resetFilters}
							className="h-auto p-0 text-xs text-destructive hover:bg-transparent"
						>
							<FilterX className="w-3.5 h-3.5 mr-1" /> {tTable("clearFilters")}
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
								setFilterSeverity(v);
								setPage(1);
							}
						}}
					>
						<SelectTrigger className="h-8 text-xs bg-background border-input text-foreground">
							<SelectValue placeholder={tTable("allSeverities")} />
						</SelectTrigger>
						<SelectContent className="bg-popover text-popover-foreground border-border">
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
								setFilterSite(v);
								setPage(1);
							}
						}}
					>
						<SelectTrigger className="h-8 text-xs bg-background border-input text-foreground">
							<SelectValue placeholder={tTable("allSites")} />
						</SelectTrigger>
						<SelectContent className="bg-popover text-popover-foreground border-border">
							<SelectItem value="ALL">{tTable("allSites")}</SelectItem>
							<SelectItem value="Outpatient">{tForm("treatmentSiteOutpatient")}</SelectItem>
							<SelectItem value="Inpatient">{tForm("treatmentSiteInpatient")}</SelectItem>
							<SelectItem value="IntensiveCareUnit">{tForm("treatmentSiteICU")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-semibold text-muted-foreground">
						{tTable("filterPathogenLabel")}
					</label>
					<Command className="border border-border rounded-md max-h-36 overflow-hidden bg-popover text-popover-foreground">
						<CommandInput
							placeholder={tTable("searchPathogenPlaceholder")}
							className="h-7 text-xs border-none focus:ring-0"
						/>
						<CommandList className="max-h-28">
							<CommandEmpty className="text-xs p-2">{tForm("emptyPathogen")}</CommandEmpty>
							<CommandGroup>
								{pathogens.map((p) => (
									<CommandItem
										key={p.id}
										onSelect={() => togglePathogenFilter(p.id)}
										className="text-xs py-1 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Check
											className={cn(
												"mr-2 h-3.5 w-3.5 text-primary",
												selectedPathogenIds.includes(p.id) ? "opacity-100" : "opacity-0"
											)}
										/>
										{p.name}
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
					<Command className="border border-border rounded-md max-h-36 overflow-hidden bg-popover text-popover-foreground">
						<CommandInput
							placeholder={tTable("searchCriteriaPlaceholder")}
							className="h-7 text-xs border-none focus:ring-0"
						/>
						<CommandList className="max-h-28">
							<CommandEmpty className="text-xs p-2">{tForm("emptyCriteria")}</CommandEmpty>
							<CommandGroup>
								{criteria.map((c) => (
									<CommandItem
										key={c.id}
										onSelect={() => toggleCriteriaFilter(c.id)}
										className="text-xs py-1 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Check
											className={cn(
												"mr-2 h-3.5 w-3.5 text-primary",
												selectedCriteriaIds.includes(c.id) ? "opacity-100" : "opacity-0"
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

	return (
		<div className="relative text-foreground">
			{isFetching && (
				<div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md z-10">
					<div className="h-full bg-primary animate-pulse w-1/2 translate-x-1/2" />
				</div>
			)}

			<Table className="border-border">
				<TableHeader>
					<TableRow className="border-border hover:bg-transparent">
						<TableHead className="text-muted-foreground font-semibold w-36">
							{tTable("colClassification")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold w-48">
							{tTable("colIndications")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold">
							{tTable("colRegimens")}
						</TableHead>
						<TableHead className="text-muted-foreground font-semibold text-center w-28">
							{readOnly ? (
								<div className="flex items-center justify-center gap-1.5">
									<span>{tTable("colStatus")}</span>
									{filterPopover}
								</div>
							) : (
								tTable("colStatus")
							)}
						</TableHead>
						{!readOnly && (
							<TableHead className="text-muted-foreground font-semibold text-right w-24">
								<div className="flex items-center justify-end gap-2">
									{tCommon("actions")}
									{filterPopover}
								</div>
							</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow className="border-border">
							<TableCell colSpan={columnCount} className="h-32 text-center text-muted-foreground">
								<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
							</TableCell>
						</TableRow>
					) : items.length === 0 ? (
						<TableRow className="border-border">
							<TableCell colSpan={columnCount} className="text-center text-muted-foreground py-10">
								{tTable("empty")}
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow key={item.id} className="border-border hover:bg-accent/50 align-top transition-colors">
								<TableCell>
									<div className="space-y-2">
										{getSeverityBadge(item.severity)}
										<div className="text-xs text-muted-foreground font-medium">
											{getTreatmentSiteText(item.treatmentSite)}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-3">
										{item.pathogens.length > 0 && (
											<div className="space-y-1">
												<div className="text-[10px] uppercase font-bold text-muted-foreground">
													{tTable("riskFactorsHeading")}
												</div>
												<div className="flex flex-wrap gap-1">
													{item.pathogens.map((p) => (
														<Badge
															key={p.id}
															variant="secondary"
															className="text-[10px] bg-muted text-foreground border border-border"
														>
															{p.name}
														</Badge>
													))}
												</div>
											</div>
										)}
										{item.criteria.length > 0 && (
											<div className="space-y-1">
												<div className="text-[10px] uppercase font-bold text-muted-foreground">
													{tTable("criteriaHeading")}
												</div>
												<ul className="list-disc pl-3 text-xs text-foreground/80 space-y-1">
													{item.criteria.map((c) => (
														<li key={c.id}>{c.name}</li>
													))}
												</ul>
											</div>
										)}
										{item.pathogens.length === 0 && item.criteria.length === 0 && (
											<span className="text-xs text-muted-foreground italic">
												{tTable("noFactors")}
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<TreatmentGroupList groups={item.treatments} />
								</TableCell>
								<TableCell className="text-center">
									{item.isApplied ? (
										<span className="inline-flex items-center rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
											{tTable("statusActive")}
										</span>
									) : (
										<span className="inline-flex items-center rounded bg-muted border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
											{tTable("statusInactive")}
										</span>
									)}
								</TableCell>
								{!readOnly && (
									<TableCell>
										<div className="flex justify-end gap-1">
											{onEdit && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onEdit(item)}
													className="hover:bg-accent text-foreground h-8 w-8"
												>
													<Edit className="h-4 w-4" />
												</Button>
											)}
											{onDelete && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onDelete(item)}
													className="hover:bg-destructive/10 text-destructive h-8 w-8"
												>
													<Trash className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								)}
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