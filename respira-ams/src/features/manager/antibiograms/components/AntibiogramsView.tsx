"use client";

import { useState } from "react";
import { Plus, Edit, Trash, Loader2, ListFilter } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { useAntibiogramsList, useAntibiogramMutations, usePathogensDropdown } from "../queries";
import { AntibiogramForm } from "./AntibiogramForm";
import {
	type AntibiogramItem,
	type CreateAntibiogramRequest,
	type UpdateAntibiogramRequest,
	type MicCategory,
} from "../types";

const PAGE_SIZE = 10;

export function AntibiogramsView() {
	const t = useTranslations("manager.antibiograms");
	const tTable = useTranslations("manager.antibiograms.table");
	const tForm = useTranslations("manager.antibiograms.form");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [filterPathogenId, setFilterPathogenId] = useState<string | null>(null);
	const [filterMicCategory, setFilterMicCategory] = useState<MicCategory | null>(null);

	const { data: listData, isLoading, isFetching } = useAntibiogramsList(
		page,
		PAGE_SIZE,
		filterPathogenId,
		filterMicCategory
	);
	const { data: pathogensData } = usePathogensDropdown();
	const { createMutation, updateMutation, deleteMutation } = useAntibiogramMutations();

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selectedItem, setSelectedItem] = useState<AntibiogramItem | null>(null);
	const [itemToDelete, setItemToDelete] = useState<AntibiogramItem | null>(null);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;
	const pathogensList = Array.isArray(pathogensData) ? pathogensData : pathogensData?.pathogens ?? [];
	const activeFilterCount = (filterPathogenId ? 1 : 0) + (filterMicCategory ? 1 : 0);

	const handleFilterPathogen = (id: string | null) => {
		setFilterPathogenId(id);
		setPage(1);
	};

	const handleFilterMic = (category: MicCategory | null) => {
		setFilterMicCategory(category);
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
				}
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
					<span className="inline-flex items-center rounded bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
						{tForm("susceptible")}
					</span>
				);
			case "Intermediate":
				return (
					<span className="inline-flex items-center rounded bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
						{tForm("intermediate")}
					</span>
				);
			case "Resistant":
				return (
					<span className="inline-flex items-center rounded bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
						{tForm("resistant")}
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className="space-y-6 text-foreground bg-background">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
					<p className="text-muted-foreground mt-1">{t("description")}</p>
				</div>
				<Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
					<Plus className="mr-2 h-4 w-4" /> {t("addButton")}
				</Button>
			</div>

			{/* Table Card */}
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground relative">
				{isFetching && (
					<div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md z-10">
						<div className="h-full bg-primary animate-pulse w-1/2 translate-x-1/2" />
					</div>
				)}

				<Table className="border-border">
					<TableHeader>
						<TableRow className="border-border hover:bg-transparent">
							<TableHead className="text-muted-foreground font-semibold w-1/4">
								{tTable("colPathogen")}
							</TableHead>

							<TableHead className="text-muted-foreground font-semibold w-52 text-center">
								{tTable("colMic")}
							</TableHead>

							<TableHead className="text-muted-foreground font-semibold">
								{tTable("colAntibiotics")}
							</TableHead>

							<TableHead className="overflow-visible text-muted-foreground text-right font-semibold">
								<div className="flex items-center justify-end gap-2">
									{tCommon("actions")}
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="relative hover:bg-accent text-foreground h-8 w-8">
												<ListFilter className="h-4 w-4" />
												{activeFilterCount > 0 && (
													<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
														{activeFilterCount}
													</span>
												)}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-56 bg-popover text-popover-foreground border-border"
										>
											<DropdownMenuLabel>{tTable("filterTitle")}</DropdownMenuLabel>
											<DropdownMenuSeparator className="bg-border" />
											<DropdownMenuSub>
												<DropdownMenuSubTrigger className="hover:bg-accent">
													{tTable("filterByPathogen")}
												</DropdownMenuSubTrigger>
												<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto bg-popover text-popover-foreground border-border">
													<DropdownMenuItem
														onClick={() => handleFilterPathogen(null)}
														className={filterPathogenId === null ? "bg-accent font-bold" : ""}
													>
														{tCommon("all")}
													</DropdownMenuItem>
													<DropdownMenuSeparator className="bg-border" />
													{pathogensList.map((p) => (
														<DropdownMenuItem
															key={p.id}
															onClick={() => handleFilterPathogen(p.id)}
															className={filterPathogenId === p.id ? "bg-accent font-bold" : ""}
														>
															{p.name}
														</DropdownMenuItem>
													))}
												</DropdownMenuSubContent>
											</DropdownMenuSub>

											<DropdownMenuSub>
												<DropdownMenuSubTrigger className="hover:bg-accent">
													{tTable("filterByMic")}
												</DropdownMenuSubTrigger>
												<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto bg-popover text-popover-foreground border-border">
													<DropdownMenuItem
														onClick={() => handleFilterMic(null)}
														className={filterMicCategory === null ? "bg-accent font-bold" : ""}
													>
														{tCommon("all")}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleFilterMic("Susceptible")}
														className={filterMicCategory === "Susceptible" ? "bg-accent font-bold" : ""}
													>
														{tForm("susceptible")}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleFilterMic("Intermediate")}
														className={filterMicCategory === "Intermediate" ? "bg-accent font-bold" : ""}
													>
														{tForm("intermediate")}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleFilterMic("Resistant")}
														className={filterMicCategory === "Resistant" ? "bg-accent font-bold" : ""}
													>
														{tForm("resistant")}
													</DropdownMenuItem>
												</DropdownMenuSubContent>
											</DropdownMenuSub>

											<DropdownMenuSeparator className="bg-border" />
											<DropdownMenuItem
												onClick={() => {
													handleFilterPathogen(null);
													handleFilterMic(null);
												}}
												className="text-destructive font-medium focus:bg-destructive/10 focus:text-destructive"
											>
												{tTable("clearFilters")}
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
								<TableRow key={item.id} className="border-border hover:bg-accent/50 transition-colors">
									<TableCell className="font-medium align-middle">
										<span className="text-primary font-semibold">{item.pathogen.name}</span>
									</TableCell>
									<TableCell className="align-top text-center">
										{renderMicBadge(item.micCategory)}
									</TableCell>
									<TableCell className="align-top">
										<div className="flex flex-wrap gap-1.5">
											{item.antibiotics.map((ab) => (
												<Badge
													key={ab.id}
													variant="secondary"
													className="font-normal bg-muted text-foreground border border-border"
												>
													{ab.name}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell className="align-top">
										<div className="flex justify-end gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openUpdate(item)}
												className="hover:bg-accent text-foreground h-8 w-8"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setItemToDelete(item)}
												className="hover:bg-destructive/10 text-destructive h-8 w-8"
											>
												<Trash className="h-4 w-4" />
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

			{/* Create/Update Modal */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="sm:max-w-xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-foreground">
							{modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
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

			{/* Delete Alert */}
			<AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">
							{t("dialog.deleteTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{t.rich("dialog.deleteDescription", {
								pathogen: itemToDelete?.pathogen.name || "",
								b: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
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
							{deleteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}{" "}
							{tCommon("delete")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}