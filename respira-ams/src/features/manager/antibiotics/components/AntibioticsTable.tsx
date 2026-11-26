"use client";

import { useState } from "react";
import { Edit, ListFilter, Trash, Loader2, Eye, ChevronDown, Check } from "lucide-react";
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
import { AwareCategory, type AntibioticItem } from "../types";
import { useAntibiotics, useAntibioticGroups } from "../queries";

const PAGE_SIZE = 10;

function CategoryBadge({ category }: { category: string }) {
	const map: Record<string, { color: string; label: string }> = {
		[AwareCategory.Access.toLowerCase()]: {
			color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
			label: "Access",
		},
		[AwareCategory.Watch.toLowerCase()]: {
			color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
			label: "Watch",
		},
		[AwareCategory.Reserve.toLowerCase()]: {
			color: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20",
			label: "Reserve",
		},
		[AwareCategory.AccessWatch.toLowerCase()]: {
			color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
			label: "Access-Watch",
		},
		[AwareCategory.Others.toLowerCase()]: {
			color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
			label: "Others",
		},
		[AwareCategory.Unclassified.toLowerCase()]: {
			color: "bg-muted text-muted-foreground border border-border",
			label: "Unclassified",
		},
	};
	const entry = map[category.toLowerCase()] ?? {
		color: "bg-muted text-muted-foreground border border-border",
		label: category,
	};

	return (
		<span
			className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${entry.color}`}
		>
			{entry.label}
		</span>
	);
}

interface AntibioticsTableProps {
	readOnly?: boolean;
	searchName?: string;
	onViewDetail: (id: string) => void;
	onEdit?: (item: AntibioticItem) => void;
	onDelete?: (item: AntibioticItem) => void;
}

export function AntibioticsTable({
	readOnly = false,
	searchName = "",
	onViewDetail,
	onEdit,
	onDelete,
}: AntibioticsTableProps) {
	const t = useTranslations("manager.antibiotics");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [selectedGroupId, setSelectedGroupId] = useState("");
	const [openFilterSection, setOpenFilterSection] = useState<"category" | "group" | null>(null);

	const [prevFilters, setPrevFilters] = useState({
		searchName,
		selectedCategory,
		selectedGroupId,
	});
	if (
		searchName !== prevFilters.searchName ||
		selectedCategory !== prevFilters.selectedCategory ||
		selectedGroupId !== prevFilters.selectedGroupId
	) {
		setPrevFilters({ searchName, selectedCategory, selectedGroupId });
		setPage(1);
	}

	const {
		data: listData,
		isLoading,
		isFetching,
	} = useAntibiotics(page, PAGE_SIZE, searchName, selectedCategory, selectedGroupId);

	const { data: groupsData } = useAntibioticGroups();
	const antibioticGroups = groupsData?.antibioticGroups || [];

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedGroupId ? 1 : 0);
	const selectedGroupName = antibioticGroups.find((g) => g.id === selectedGroupId)?.name;

	const filterDropdown = (
		<DropdownMenu onOpenChange={(open) => !open && setOpenFilterSection(null)}>
			<DropdownMenuTrigger asChild>
				<Button
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
				<DropdownMenuLabel>{t("table.filterBy")}</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<div>
					<button
						type="button"
						onClick={() =>
							setOpenFilterSection((prev) =>
								prev === "category" ? null : "category",
							)
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{t("table.colCategory")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{selectedCategory && (
								<span className="truncate text-primary font-medium">
									{selectedCategory === "AccessWatch"
										? "Access-Watch"
										: selectedCategory}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openFilterSection === "category" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openFilterSection === "category" && (
						<div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => setSelectedCategory("")}
								className={cn(
									"justify-between text-xs",
									selectedCategory === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{selectedCategory === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{Object.values(AwareCategory).map((cat) => (
								<DropdownMenuItem
									key={cat}
									onClick={() => setSelectedCategory(cat)}
									className={cn(
										"justify-between text-xs",
										selectedCategory === cat && "bg-accent font-semibold",
									)}
								>
									<span>{cat === "AccessWatch" ? "Access-Watch" : cat}</span>
									{selectedCategory === cat && <Check className="h-3.5 w-3.5" />}
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
							setOpenFilterSection((prev) => (prev === "group" ? null : "group"))
						}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{t("table.colGroup")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{selectedGroupName && (
								<span className="truncate text-primary font-medium">
									{selectedGroupName}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openFilterSection === "group" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openFilterSection === "group" && (
						<div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => setSelectedGroupId("")}
								className={cn(
									"justify-between text-xs",
									selectedGroupId === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{selectedGroupId === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{antibioticGroups.map((group) => (
								<DropdownMenuItem
									key={group.id}
									onClick={() => setSelectedGroupId(group.id)}
									className={cn(
										"justify-between gap-2 text-xs",
										selectedGroupId === group.id && "bg-accent font-semibold",
									)}
								>
									<span className="truncate">{group.name}</span>
									{selectedGroupId === group.id && (
										<Check className="h-3.5 w-3.5 shrink-0" />
									)}
								</DropdownMenuItem>
							))}
						</div>
					)}
				</div>

				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						setSelectedCategory("");
						setSelectedGroupId("");
						setOpenFilterSection(null);
					}}
					className="cursor-pointer text-destructive focus:text-destructive"
				>
					{t("table.clearFilter")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const renderActionButtons = (item: AntibioticItem) => (
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
					<div
						className="h-full animate-pulse bg-primary"
						style={{ width: "50%", transform: "translateX(50%)" }}
					/>
				</div>
			)}

			<div className="space-y-3 md:hidden">
				<div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
					<span className="text-xs font-medium text-muted-foreground">
						{t("table.filterBy")}
					</span>
					{filterDropdown}
				</div>

				{isLoading ? (
					<div className="flex h-32 items-center justify-center rounded-lg border border-border text-muted-foreground">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : items.length === 0 ? (
					<div className="rounded-lg border border-border py-10 text-center text-sm text-muted-foreground">
						{t("table.empty")}
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
								<CategoryBadge category={item.classification} />
							</div>

							<p className="text-xs text-muted-foreground">
								<span className="font-medium">{t("table.colGroup")}:</span>{" "}
								<span className="text-foreground">
									{item.antibioticGroup?.name || "N/A"}
								</span>
							</p>

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
							<TableHead className="min-w-44 font-semibold text-muted-foreground">
								{t("table.colName")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{t("table.colCategory")}
							</TableHead>
							<TableHead className="min-w-40 font-semibold text-muted-foreground">
								{t("table.colGroup")}
							</TableHead>
							<TableHead className="overflow-visible whitespace-nowrap text-right font-semibold text-muted-foreground">
								<div className="flex items-center justify-end gap-2">
									{tCommon("actions")}
									{filterDropdown}
								</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={4}
									className="h-32 text-center text-muted-foreground"
								>
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={4}
									className="py-10 text-center text-muted-foreground"
								>
									{t("table.empty")}
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => (
								<TableRow
									key={item.id}
									className="cursor-pointer border-border transition-colors hover:bg-accent/50"
									onClick={() => onViewDetail(item.id)}
								>
									<TableCell className="align-middle font-medium">
										<span className="font-semibold text-primary">
											{item.name}
										</span>
									</TableCell>
									<TableCell className="whitespace-nowrap align-middle">
										<CategoryBadge category={item.classification} />
									</TableCell>
									<TableCell className="align-middle text-foreground">
										{item.antibioticGroup?.name || "N/A"}
									</TableCell>
									<TableCell className="whitespace-nowrap align-middle">
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
								onClick={() => setPage((p) => p - 1)}
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
								onClick={() => setPage((p) => p + 1)}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}