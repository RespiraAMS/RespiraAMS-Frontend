"use client";

import { useState } from "react";
import { Edit, ListFilter, Trash, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import { useSuspectedCauses, usePathogensDropdown } from "../queries";
import { type SuspectedCauseItem, type Severity, type TreatmentSite } from "../types";

const PAGE_SIZE = 10;

interface SuspectedCausesTableProps {
	onEdit: (item: SuspectedCauseItem) => void;
	onDelete: (item: SuspectedCauseItem) => void;
}

export function SuspectedCausesTable({ onEdit, onDelete }: SuspectedCausesTableProps) {
	const t = useTranslations("manager.suspectedCauses");
	const tTable = useTranslations("manager.suspectedCauses.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);

	const [filterPathogen, setFilterPathogen] = useState<string>("");
	const [filterSeverity, setFilterSeverity] = useState<Severity | "">("");
	const [filterSite, setFilterSite] = useState<TreatmentSite | "">("");

	const { data: listData, isLoading, isFetching } = useSuspectedCauses(
		page,
		PAGE_SIZE,
		filterPathogen,
		filterSeverity,
		filterSite
	);
	const { data: pathogensData } = usePathogensDropdown();
	const pathogensList = pathogensData?.pathogens || [];

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

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
						<TableHead className="text-muted-foreground w-1/3 font-semibold">{tTable("colPathogen")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{tTable("colSeverity")}</TableHead>
						<TableHead className="text-muted-foreground font-semibold">{tTable("colSite")}</TableHead>
						<TableHead className="text-muted-foreground text-right font-semibold">
							<div className="flex items-center justify-end gap-2">
								{tCommon("actions")}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="relative hover:bg-accent text-foreground">
											<ListFilter className="h-4 w-4" />
											{countActiveFilters() > 0 && (
												<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
													{countActiveFilters()}
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
										<DropdownMenuLabel>{tTable("filterData")}</DropdownMenuLabel>
										<DropdownMenuSeparator />

										{/* Pathogen Filter */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>{tTable("filterByPathogen")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent className="max-h-60 overflow-y-auto bg-popover text-popover-foreground border-border">
												<DropdownMenuItem onClick={() => handleFilterChange("pathogen", "")}>
													{tCommon("all")}
												</DropdownMenuItem>
												{pathogensList.map((p) => (
													<DropdownMenuItem key={p.id} onClick={() => handleFilterChange("pathogen", p.id)}>
														{p.name}
													</DropdownMenuItem>
												))}
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										{/* Severity Filter */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>{tTable("filterBySeverity")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent className="bg-popover text-popover-foreground border-border">
												<DropdownMenuItem onClick={() => handleFilterChange("severity", "")}>
													{tCommon("all")}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleFilterChange("severity", "Mild")}>
													{t("form.severityMild")}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleFilterChange("severity", "Moderate")}>
													{t("form.severityModerate")}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleFilterChange("severity", "Severe")}>
													{t("form.severitySevere")}
												</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										{/* Treatment Site Filter */}
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>{tTable("filterBySite")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent className="bg-popover text-popover-foreground border-border">
												<DropdownMenuItem onClick={() => handleFilterChange("site", "")}>
													{tCommon("all")}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleFilterChange("site", "Outpatient")}>
													{t("form.siteOutpatient")}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleFilterChange("site", "Inpatient")}>
													{t("form.siteInpatient")}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleFilterChange("site", "IntensiveCareUnit")}>
													{t("form.siteICU")}
												</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={clearFilters} disabled={countActiveFilters() === 0}>
											{tTable("clearFilter")}
										</DropdownMenuItem>
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
								<TableCell className="font-semibold text-primary">{item.pathogenName}</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold border ${
											item.severity === "Severe"
												? "bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400"
												: item.severity === "Moderate"
												? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
												: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
										}`}
									>
										{formatSeverity(item.severity)}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-foreground text-sm font-medium">
										{formatTreatmentSite(item.treatmentSite)}
									</span>
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(item)}
											className="hover:bg-accent text-foreground"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(item)}
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
						<span className="text-sm text-muted-foreground px-2">{tCommon("pageOf", { page, totalPages })}</span>
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