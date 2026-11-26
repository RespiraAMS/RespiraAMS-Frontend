"use client";

import { useState } from "react";
import { Plus, Edit, Trash, Loader2, ListFilter, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useAntibiogramsList, useAntibiogramMutations, usePathogensDropdown } from "../queries";
import { AntibiogramForm } from "./AntibiogramForm";
import {
	type AntibiogramItem,
	type CreateAntibiogramRequest,
	type UpdateAntibiogramRequest,
	type MicCategory,
} from "../types";

const PAGE_SIZE = 10;

interface AntibiogramsFilterDropdownProps {
	activeFilterCount: number;
	filterPathogenId: string | null;
	filterMicCategory: MicCategory | null;
	pathogensList: { id: string; name: string }[];
	onPathogenChange: (id: string | null) => void;
	onMicChange: (category: MicCategory | null) => void;
	onClear: () => void;
}

function AntibiogramsFilterDropdown({
	activeFilterCount,
	filterPathogenId,
	filterMicCategory,
	pathogensList,
	onPathogenChange,
	onMicChange,
	onClear,
}: AntibiogramsFilterDropdownProps) {
	const tTable = useTranslations("manager.antibiograms.table");
	const tForm = useTranslations("manager.antibiograms.form");
	const tCommon = useTranslations("common");
	const [openSection, setOpenSection] = useState<"pathogen" | "mic" | null>(null);

	const selectedPathogenName = pathogensList.find((p) => p.id === filterPathogenId)?.name;

	const getMicLabel = (category: MicCategory) => {
		switch (category) {
			case "Susceptible":
				return tForm("susceptible");
			case "Intermediate":
				return tForm("intermediate");
			case "Resistant":
				return tForm("resistant");
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
				<DropdownMenuLabel>{tTable("filterTitle")}</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-border" />

				<div>
					<button
						type="button"
						onClick={() =>
							setOpenSection((prev) => (prev === "pathogen" ? null : "pathogen"))
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
									openSection === "pathogen" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openSection === "pathogen" && (
						<div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => onPathogenChange(null)}
								className={cn(
									"justify-between text-xs",
									filterPathogenId === null && "bg-accent font-bold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterPathogenId === null && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{pathogensList.map((p) => (
								<DropdownMenuItem
									key={p.id}
									onClick={() => onPathogenChange(p.id)}
									className={cn(
										"justify-between gap-2 text-xs",
										filterPathogenId === p.id && "bg-accent font-bold",
									)}
								>
									<span className="truncate">{p.name}</span>
									{filterPathogenId === p.id && (
										<Check className="h-3.5 w-3.5 shrink-0" />
									)}
								</DropdownMenuItem>
							))}
						</div>
					)}
				</div>

				<DropdownMenuSeparator className="bg-border" />

				<div>
					<button
						type="button"
						onClick={() => setOpenSection((prev) => (prev === "mic" ? null : "mic"))}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterByMic")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{filterMicCategory && (
								<span className="truncate font-medium text-primary">
									{getMicLabel(filterMicCategory)}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									openSection === "mic" && "rotate-180",
								)}
							/>
						</span>
					</button>

					{openSection === "mic" && (
						<div className="mt-1 space-y-0.5 border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => onMicChange(null)}
								className={cn(
									"justify-between text-xs",
									filterMicCategory === null && "bg-accent font-bold",
								)}
							>
								<span>{tCommon("all")}</span>
								{filterMicCategory === null && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							{(["Susceptible", "Intermediate", "Resistant"] as MicCategory[]).map(
								(cat) => (
									<DropdownMenuItem
										key={cat}
										onClick={() => onMicChange(cat)}
										className={cn(
											"justify-between text-xs",
											filterMicCategory === cat && "bg-accent font-bold",
										)}
									>
										<span>{getMicLabel(cat)}</span>
										{filterMicCategory === cat && (
											<Check className="h-3.5 w-3.5" />
										)}
									</DropdownMenuItem>
								),
							)}
						</div>
					)}
				</div>

				<DropdownMenuSeparator className="bg-border" />
				<DropdownMenuItem
					onClick={() => {
						onClear();
						setOpenSection(null);
					}}
					disabled={activeFilterCount === 0}
					className="cursor-pointer font-medium focus:bg-destructive/10 focus:text-destructive"
				>
					{tTable("clearFilters")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface AntibiogramsViewProps {
	readOnly?: boolean;
}

export function AntibiogramsView({ readOnly = false }: AntibiogramsViewProps) {
	const t = useTranslations("manager.antibiograms");
	const tTable = useTranslations("manager.antibiograms.table");
	const tForm = useTranslations("manager.antibiograms.form");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [filterPathogenId, setFilterPathogenId] = useState<string | null>(null);
	const [filterMicCategory, setFilterMicCategory] = useState<MicCategory | null>(null);

	const {
		data: listData,
		isLoading,
		isFetching,
	} = useAntibiogramsList(page, PAGE_SIZE, filterPathogenId, filterMicCategory);
	const { data: pathogensData } = usePathogensDropdown();
	const { createMutation, updateMutation, deleteMutation } = useAntibiogramMutations();

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selectedItem, setSelectedItem] = useState<AntibiogramItem | null>(null);
	const [itemToDelete, setItemToDelete] = useState<AntibiogramItem | null>(null);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const pathogensList = Array.isArray(pathogensData)
		? pathogensData
		: (pathogensData?.pathogens ?? []);
	const activeFilterCount = (filterPathogenId ? 1 : 0) + (filterMicCategory ? 1 : 0);
	const columnCount = readOnly ? 3 : 4;

	const handleFilterPathogen = (id: string | null) => {
		setFilterPathogenId(id);
		setPage(1);
	};

	const handleFilterMic = (category: MicCategory | null) => {
		setFilterMicCategory(category);
		setPage(1);
	};

	const clearAllFilters = () => {
		setFilterPathogenId(null);
		setFilterMicCategory(null);
		setPage(1);
	};

	const openCreate = () => {
		setSelectedItem(null);
		setModalMode("create");
	};

	const openUpdate = (item: AntibiogramItem) => {
		setSelectedItem(item);
		setModalMode("update");
	};

	const closeModal = () => {
		setModalMode(null);
		setSelectedItem(null);
	};

	const handleFormSubmit = (data: CreateAntibiogramRequest | UpdateAntibiogramRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreateAntibiogramRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(t("toast.createSuccess"));
				},
				onError: (err) => toast.error(t("toast.createError", { error: err.message })),
			});
		} else if (modalMode === "update" && selectedItem) {
			updateMutation.mutate(
				{ id: selectedItem.id, data: data as UpdateAntibiogramRequest },
				{
					onSuccess: () => {
						closeModal();
						toast.success(t("toast.updateSuccess"));
					},
					onError: (err) => toast.error(t("toast.updateError", { error: err.message })),
				},
			);
		}
	};

	const handleDelete = () => {
		if (itemToDelete) {
			deleteMutation.mutate(itemToDelete.id, {
				onSuccess: () => {
					setItemToDelete(null);
					toast.success(t("toast.deleteSuccess"));
				},
				onError: (err) => toast.error(t("toast.deleteError", { error: err.message })),
			});
		}
	};

	const renderMicBadge = (category: MicCategory) => {
		switch (category) {
			case "Susceptible":
				return (
					<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
						{tForm("susceptible")}
					</span>
				);
			case "Intermediate":
				return (
					<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
						{tForm("intermediate")}
					</span>
				);
			case "Resistant":
				return (
					<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
						{tForm("resistant")}
					</span>
				);
			default:
				return null;
		}
	};

	const renderActionButtons = (item: AntibiogramItem) => (
		<div className="flex items-center justify-end gap-1.5 lg:gap-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => openUpdate(item)}
				className="h-8 w-8 text-foreground hover:bg-accent"
			>
				<Edit className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setItemToDelete(item)}
				className="h-8 w-8 text-destructive hover:bg-destructive/10"
			>
				<Trash className="h-4 w-4" />
			</Button>
		</div>
	);

	const filterProps: AntibiogramsFilterDropdownProps = {
		activeFilterCount,
		filterPathogenId,
		filterMicCategory,
		pathogensList,
		onPathogenChange: handleFilterPathogen,
		onMicChange: handleFilterMic,
		onClear: clearAllFilters,
	};

	return (
		<div className="space-y-4 bg-background text-foreground sm:space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						{t("title")}
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
				</div>
				{!readOnly && (
					<Button
						onClick={openCreate}
						className="w-full shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
					>
						<Plus className="mr-2 h-4 w-4" /> {t("addButton")}
					</Button>
				)}
			</div>

			<div className="relative rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-4">
				{isFetching && (
					<div className="absolute left-0 right-0 top-0 z-10 h-1 overflow-hidden rounded-t-md bg-primary/20">
						<div className="h-full w-1/2 translate-x-1/2 animate-pulse bg-primary" />
					</div>
				)}

				<div className="space-y-3 md:hidden">
					<div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
						<span className="text-xs font-medium text-muted-foreground">
							{tTable("filterTitle")}
						</span>
						<AntibiogramsFilterDropdown {...filterProps} />
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
								className="space-y-2.5 rounded-lg border border-border bg-background/50 p-3.5"
							>
								<div className="flex items-start justify-between gap-2">
									<p className="min-w-0 font-semibold text-primary break-words">
										{item.pathogen.name}
									</p>
									{renderMicBadge(item.micCategory)}
								</div>

								<div className="space-y-1.5">
									<div className="text-xs font-medium text-muted-foreground">
										{tTable("colAntibiotics")}
									</div>
									<div className="flex flex-wrap gap-1.5">
										{item.antibiotics.map((ab) => (
											<Badge
												key={ab.id}
												variant="secondary"
												className="whitespace-normal break-words border border-border bg-muted font-normal text-foreground"
											>
												{ab.name}
											</Badge>
										))}
									</div>
								</div>

								{!readOnly && (
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
								<TableHead className="min-w-44 font-semibold text-muted-foreground lg:w-1/4">
									{tTable("colPathogen")}
								</TableHead>

								<TableHead className="min-w-44 whitespace-nowrap text-center font-semibold text-muted-foreground lg:w-52">
									{tTable("colMic")}
								</TableHead>

								<TableHead className="min-w-56 overflow-visible font-semibold text-muted-foreground">
									{readOnly ? (
										<div className="flex items-center justify-between gap-2">
											<span>{tTable("colAntibiotics")}</span>
											<AntibiogramsFilterDropdown {...filterProps} />
										</div>
									) : (
										tTable("colAntibiotics")
									)}
								</TableHead>

								{!readOnly && (
									<TableHead className="overflow-visible whitespace-nowrap text-right font-semibold text-muted-foreground">
										<div className="flex items-center justify-end gap-2">
											{tCommon("actions")}
											<AntibiogramsFilterDropdown {...filterProps} />
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
										className="border-border transition-colors hover:bg-accent/50"
									>
										<TableCell className="align-top font-medium whitespace-normal break-words">
											<span className="font-semibold text-primary">
												{item.pathogen.name}
											</span>
										</TableCell>
										<TableCell className="whitespace-nowrap text-center align-top">
											{renderMicBadge(item.micCategory)}
										</TableCell>
										<TableCell className="align-top">
											<div className="flex flex-wrap gap-1.5">
												{item.antibiotics.map((ab) => (
													<Badge
														key={ab.id}
														variant="secondary"
														className="border border-border bg-muted font-normal text-foreground"
													>
														{ab.name}
													</Badge>
												))}
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

			{!readOnly && (
				<>
					<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
						<DialogContent className="max-h-[90dvh] w-[95vw] overflow-y-auto border-border bg-popover text-popover-foreground sm:max-w-xl">
							<DialogHeader>
								<DialogTitle className="text-foreground">
									{modalMode === "create"
										? t("dialog.createTitle")
										: t("dialog.updateTitle")}
								</DialogTitle>
							</DialogHeader>
							{modalMode && (
								<AntibiogramForm
									initialData={selectedItem}
									onSubmit={handleFormSubmit}
									onCancel={closeModal}
									isPending={createMutation.isPending || updateMutation.isPending}
								/>
							)}
						</DialogContent>
					</Dialog>

					<AlertDialog
						open={!!itemToDelete}
						onOpenChange={(open) => !open && setItemToDelete(null)}
					>
						<AlertDialogContent className="w-[95vw] border-border bg-popover text-popover-foreground sm:max-w-lg">
							<AlertDialogHeader>
								<AlertDialogTitle className="font-semibold text-destructive">
									{t("dialog.deleteTitle")}
								</AlertDialogTitle>
								<AlertDialogDescription className="text-muted-foreground">
									{t.rich("dialog.deleteDescription", {
										pathogen: itemToDelete?.pathogen.name || "",
										b: (chunks) => (
											<span className="font-bold text-foreground">
												{chunks}
											</span>
										),
									})}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="gap-2 sm:gap-0">
								<Button
									variant="outline"
									onClick={() => setItemToDelete(null)}
									className="border-border text-foreground hover:bg-accent"
								>
									{tCommon("cancel")}
								</Button>
								<Button
									variant="destructive"
									onClick={handleDelete}
									disabled={deleteMutation.isPending}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{deleteMutation.isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : null}{" "}
									{tCommon("delete")}
								</Button>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</>
			)}
		</div>
	);
}