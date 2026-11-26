"use client";

import { useState } from "react";
import { Eye, ListFilter, Loader2, Trash, ChevronDown, Check } from "lucide-react";
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

import { useClinicalVariables } from "../queries";
import {
	type ClinicalVariableItem,
	type VariableCategory,
	type VariableValueType,
} from "../types";

const PAGE_SIZE = 10;

interface ClinicalVariablesFilterDropdownProps {
	activeFilterCount: number;
	filterRequired: boolean | null;
	filterCategory: VariableCategory | "";
	filterValueType: VariableValueType | "";
	onRequiredChange: (value: boolean | null) => void;
	onCategoryChange: (value: VariableCategory | "") => void;
	onValueTypeChange: (value: VariableValueType | "") => void;
	onClear: () => void;
}

function ClinicalVariablesFilterDropdown({
	activeFilterCount,
	filterRequired,
	filterCategory,
	filterValueType,
	onRequiredChange,
	onCategoryChange,
	onValueTypeChange,
	onClear,
}: ClinicalVariablesFilterDropdownProps) {
	const t = useTranslations("manager.clinicalVariables");
	const tTable = useTranslations("manager.clinicalVariables.table");
	const tCommon = useTranslations("common");
	const [openSection, setOpenSection] = useState<"required" | "category" | "valueType" | null>(
		null,
	);

	const getCategoryLabel = (category: VariableCategory) => {
		switch (category) {
			case "Clinical":
				return t("categories.clinical");
			case "Paraclinical":
				return t("categories.paraclinical");
			case "PersonalInformation":
				return t("categories.personal");
			case "MedicalHistory":
				return t("categories.medicalHistory");
			default:
				return category;
		}
	};

	const getValueTypeLabel = (valueType: VariableValueType) => {
		switch (valueType) {
			case "Numeric":
				return t("valueTypes.numeric");
			case "Boolean":
				return t("valueTypes.boolean");
			case "Categorical":
				return t("valueTypes.categorical");
			default:
				return valueType;
		}
	};

	return (
		<DropdownMenu onOpenChange={(open) => !open && setOpenSection(null)}>
			<DropdownMenuTrigger asChild>
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
							setOpenSection((prev) => (prev === "required" ? null : "required"))
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterByRequired")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{filterRequired !== null && (
								<span className="truncate font-medium text-primary">
									{filterRequired
										? tTable("requiredTrue")
										: tTable("requiredFalse")}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openSection === "required" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openSection === "required" && (
						<div className="mt-1 space-y-0.5 border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => onRequiredChange(null)}
								className={cn(
									"justify-between text-xs",
									filterRequired === null && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterRequired === null && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onRequiredChange(true)}
								className={cn(
									"justify-between text-xs",
									filterRequired === true && "bg-accent font-semibold",
								)}
							>
								<span>{tTable("requiredTrue")}</span>
								{filterRequired === true && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onRequiredChange(false)}
								className={cn(
									"justify-between text-xs",
									filterRequired === false && "bg-accent font-semibold",
								)}
							>
								<span>{tTable("requiredFalse")}</span>
								{filterRequired === false && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
						</div>
					)}
				</div>

				<DropdownMenuSeparator />

				<div>
					<button
						type="button"
						onClick={() =>
							setOpenSection((prev) => (prev === "category" ? null : "category"))
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterByCategory")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{filterCategory && (
								<span className="truncate font-medium text-primary">
									{getCategoryLabel(filterCategory)}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openSection === "category" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openSection === "category" && (
						<div className="mt-1 space-y-0.5 border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => onCategoryChange("")}
								className={cn(
									"justify-between text-xs",
									filterCategory === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterCategory === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{(
								[
									"Clinical",
									"Paraclinical",
									"PersonalInformation",
									"MedicalHistory",
								] as VariableCategory[]
							).map((cat) => (
								<DropdownMenuItem
									key={cat}
									onClick={() => onCategoryChange(cat)}
									className={cn(
										"justify-between gap-2 text-xs",
										filterCategory === cat && "bg-accent font-semibold",
									)}
								>
									<span className="truncate">{getCategoryLabel(cat)}</span>
									{filterCategory === cat && (
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
							setOpenSection((prev) => (prev === "valueType" ? null : "valueType"))
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterByValueType")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{filterValueType && (
								<span className="truncate font-medium text-primary">
									{getValueTypeLabel(filterValueType)}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openSection === "valueType" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openSection === "valueType" && (
						<div className="mt-1 space-y-0.5 border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => onValueTypeChange("")}
								className={cn(
									"justify-between text-xs",
									filterValueType === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterValueType === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{(["Numeric", "Boolean", "Categorical"] as VariableValueType[]).map(
								(type) => (
									<DropdownMenuItem
										key={type}
										onClick={() => onValueTypeChange(type)}
										className={cn(
											"justify-between text-xs",
											filterValueType === type && "bg-accent font-semibold",
										)}
									>
										<span>{getValueTypeLabel(type)}</span>
										{filterValueType === type && (
											<Check className="h-3.5 w-3.5" />
										)}
									</DropdownMenuItem>
								),
							)}
						</div>
					)}
				</div>

				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						onClear();
						setOpenSection(null);
					}}
					disabled={activeFilterCount === 0}
					className="cursor-pointer text-destructive focus:text-destructive"
				>
					{tTable("clearFilter")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface ClinicalVariablesTableProps {
	readOnly?: boolean;
	searchName?: string;
	onViewDetail: (id: string) => void;
	onDelete?: (item: ClinicalVariableItem) => void;
}

export function ClinicalVariablesTable({
	readOnly = false,
	searchName = "",
	onViewDetail,
	onDelete,
}: ClinicalVariablesTableProps) {
	const t = useTranslations("manager.clinicalVariables");
	const tTable = useTranslations("manager.clinicalVariables.table");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);

	const [filterRequired, setFilterRequired] = useState<boolean | null>(null);
	const [filterValueType, setFilterValueType] = useState<VariableValueType | "">("");
	const [filterCategory, setFilterCategory] = useState<VariableCategory | "">("");

	const [prevFilters, setPrevFilters] = useState({
		searchName,
		filterRequired,
		filterValueType,
		filterCategory,
	});
	if (
		searchName !== prevFilters.searchName ||
		filterRequired !== prevFilters.filterRequired ||
		filterValueType !== prevFilters.filterValueType ||
		filterCategory !== prevFilters.filterCategory
	) {
		setPrevFilters({ searchName, filterRequired, filterValueType, filterCategory });
		setPage(1);
	}

	const {
		data: listData,
		isLoading,
		isFetching,
	} = useClinicalVariables(
		page,
		PAGE_SIZE,
		searchName,
		filterRequired,
		filterValueType,
		filterCategory,
	);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

	const activeFilterCount =
		(filterRequired !== null ? 1 : 0) +
		(filterValueType ? 1 : 0) +
		(filterCategory ? 1 : 0);

	const clearFilters = () => {
		setFilterRequired(null);
		setFilterValueType("");
		setFilterCategory("");
		setPage(1);
	};

	const formatCategory = (category: VariableCategory) => {
		switch (category) {
			case "Clinical":
				return t("categories.clinical");
			case "Paraclinical":
				return t("categories.paraclinical");
			case "PersonalInformation":
				return t("categories.personal");
			case "MedicalHistory":
				return t("categories.medicalHistory");
			default:
				return category;
		}
	};

	const renderCategoryBadge = (category: VariableCategory) => (
		<span
			className={cn(
				"inline-flex shrink-0 items-center whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold",
				category === "Clinical"
					? "border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400"
					: category === "Paraclinical"
						? "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400"
						: category === "PersonalInformation"
							? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
							: "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400",
			)}
		>
			{formatCategory(category)}
		</span>
	);

	const renderActionButtons = (item: ClinicalVariableItem) => (
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

	const filterProps: ClinicalVariablesFilterDropdownProps = {
		activeFilterCount,
		filterRequired,
		filterCategory,
		filterValueType,
		onRequiredChange: setFilterRequired,
		onCategoryChange: setFilterCategory,
		onValueTypeChange: setFilterValueType,
		onClear: clearFilters,
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
						{tTable("filterData")}
					</span>
					<ClinicalVariablesFilterDropdown {...filterProps} />
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
							onClick={() => onViewDetail(item.id)}
							className="cursor-pointer space-y-2.5 rounded-lg border border-border bg-card p-3.5 shadow-xs transition-colors hover:bg-accent/50"
						>
							<div className="flex items-start justify-between gap-2">
								<p className="min-w-0 font-semibold text-primary break-words">
									{item.name}
								</p>
								{renderCategoryBadge(item.category)}
							</div>

							<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
								<span className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono text-accent-foreground">
									{item.code}
								</span>
								<span className="font-medium text-muted-foreground">
									{item.valueType}
								</span>
								<span className="text-muted-foreground">
									{tTable("colRequired")}:{" "}
									{item.isRequired ? (
										<span className="font-semibold text-destructive">
											{tTable("yes")}
										</span>
									) : (
										<span className="text-foreground">{tTable("no")}</span>
									)}
								</span>
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
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colCode")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colCategory")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colValueType")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colRequired")}
							</TableHead>
							<TableHead className="whitespace-nowrap text-right font-semibold text-muted-foreground">
								<div className="flex items-center justify-end gap-2">
									{tCommon("actions")}
									<ClinicalVariablesFilterDropdown {...filterProps} />
								</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={6}
									className="h-32 text-center text-muted-foreground"
								>
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={6}
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
									<TableCell className="font-semibold text-primary">
										{item.name}
									</TableCell>
									<TableCell className="whitespace-nowrap">
										<span className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono text-sm text-accent-foreground">
											{item.code}
										</span>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										{renderCategoryBadge(item.category)}
									</TableCell>
									<TableCell className="whitespace-nowrap text-sm font-medium text-muted-foreground">
										{item.valueType}
									</TableCell>
									<TableCell className="whitespace-nowrap">
										{item.isRequired ? (
											<span className="font-semibold text-destructive">
												{tTable("yes")}
											</span>
										) : (
											<span className="text-muted-foreground">
												{tTable("no")}
											</span>
										)}
									</TableCell>
									<TableCell className="whitespace-nowrap text-right">
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