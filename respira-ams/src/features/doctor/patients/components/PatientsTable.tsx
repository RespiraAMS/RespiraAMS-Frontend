"use client";

import { useState } from "react";
import { Edit, Eye, ListFilter, Loader2, LogOut, Trash, ChevronDown, Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { usePatientsList } from "../queries";
import {
	type PatientItem,
	type PatientFilters,
	type Gender,
	type TreatmentOutcome,
} from "../types";

const PAGE_SIZE = 10;

interface PatientsTableProps {
	readOnly?: boolean;
	searchTerm?: string;
	onViewDetail: (id: string) => void;
	onEdit?: (item: PatientItem) => void;
	onDelete?: (item: PatientItem) => void;
	onDischarge?: (item: PatientItem) => void;
}

function OutcomeBadge({ outcome }: { outcome: TreatmentOutcome }) {
	const tOutcome = useTranslations("doctor.patients.outcomes");

	switch (outcome) {
		case "InTreatment":
			return (
				<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
					{tOutcome("InTreatment")}
				</span>
			);
		case "Recovered":
			return (
				<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
					{tOutcome("Recovered")}
				</span>
			);
		case "Death":
			return (
				<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
					{tOutcome("Death")}
				</span>
			);
		case "OutOfScope":
			return (
				<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
					{tOutcome("OutOfScope")}
				</span>
			);
		default:
			return null;
	}
}

export function renderOutcomeBadge(outcome: TreatmentOutcome) {
	return <OutcomeBadge outcome={outcome} />;
}

interface PatientsFilterDropdownProps {
	activeFilterCount: number;
	selectedGender: Gender | "";
	draftMinAge: string;
	draftMaxAge: string;
	onGenderChange: (gender: Gender | "") => void;
	onDraftMinAgeChange: (value: string) => void;
	onDraftMaxAgeChange: (value: string) => void;
	onApplyAgeFilter: () => void;
	onClearAllFilters: () => void;
}

function PatientsFilterDropdown({
	activeFilterCount,
	selectedGender,
	draftMinAge,
	draftMaxAge,
	onGenderChange,
	onDraftMinAgeChange,
	onDraftMaxAgeChange,
	onApplyAgeFilter,
	onClearAllFilters,
}: PatientsFilterDropdownProps) {
	const tTable = useTranslations("doctor.patients.table");
	const tGender = useTranslations("doctor.patients.gender");
	const tCommon = useTranslations("common");
	const [isGenderOpen, setIsGenderOpen] = useState(false);

	return (
		<DropdownMenu onOpenChange={(open) => !open && setIsGenderOpen(false)}>
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
				<DropdownMenuLabel className="text-foreground">
					{tTable("filterTitle")}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<div>
					<button
						type="button"
						onClick={() => setIsGenderOpen((prev) => !prev)}
						className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-accent"
					>
						<span className="shrink-0 font-medium">{tTable("filterGender")}</span>
						<span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
							{selectedGender && (
								<span className="truncate font-medium text-primary">
									{tGender(selectedGender)}
								</span>
							)}
							<ChevronDown
								className={cn(
									"h-4 w-4 shrink-0 transition-transform duration-200",
									isGenderOpen && "rotate-180",
								)}
							/>
						</span>
					</button>

					{isGenderOpen && (
						<div className="mt-1 space-y-0.5 border-l border-border pl-2">
							<DropdownMenuItem
								onClick={() => onGenderChange("")}
								className={cn(
									"justify-between text-xs",
									selectedGender === "" && "bg-accent font-semibold",
								)}
							>
								<span>{tCommon("all")}</span>
								{selectedGender === "" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onGenderChange("Male")}
								className={cn(
									"justify-between text-xs",
									selectedGender === "Male" && "bg-accent font-semibold",
								)}
							>
								<span>{tGender("Male")}</span>
								{selectedGender === "Male" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onGenderChange("Female")}
								className={cn(
									"justify-between text-xs",
									selectedGender === "Female" && "bg-accent font-semibold",
								)}
							>
								<span>{tGender("Female")}</span>
								{selectedGender === "Female" && <Check className="h-3.5 w-3.5" />}
							</DropdownMenuItem>
						</div>
					)}
				</div>

				<DropdownMenuSeparator />

				<div className="space-y-2 p-2" onKeyDown={(e) => e.stopPropagation()}>
					<Label className="text-xs font-semibold text-muted-foreground">
						{tTable("filterAgeRange")}
					</Label>
					<div className="flex items-center gap-2">
						<Input
							type="number"
							min={0}
							placeholder={tTable("ageFromPlaceholder")}
							value={draftMinAge}
							onChange={(e) => onDraftMinAgeChange(e.target.value)}
							className="h-8 border-input bg-background text-xs text-foreground"
						/>
						<span className="text-muted-foreground">-</span>
						<Input
							type="number"
							min={0}
							placeholder={tTable("ageToPlaceholder")}
							value={draftMaxAge}
							onChange={(e) => onDraftMaxAgeChange(e.target.value)}
							className="h-8 border-input bg-background text-xs text-foreground"
						/>
					</div>
					<Button
						type="button"
						size="sm"
						variant="secondary"
						className="h-7 w-full text-xs"
						onClick={onApplyAgeFilter}
					>
						{tTable("applyAgeButton")}
					</Button>
				</div>

				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						onClearAllFilters();
						setIsGenderOpen(false);
					}}
					className="cursor-pointer text-destructive focus:text-destructive"
				>
					{tTable("clearAllFilters")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function PatientsTable({
	readOnly = false,
	searchTerm = "",
	onViewDetail,
	onEdit,
	onDelete,
	onDischarge,
}: PatientsTableProps) {
	const tTable = useTranslations("doctor.patients.table");
	const tGender = useTranslations("doctor.patients.gender");
	const tCommon = useTranslations("common");

	const [page, setPage] = useState(1);
	const [selectedGender, setSelectedGender] = useState<Gender | "">("");
	const [minAge, setMinAge] = useState<number | "">("");
	const [maxAge, setMaxAge] = useState<number | "">("");

	const [draftMinAge, setDraftMinAge] = useState<string>("");
	const [draftMaxAge, setDraftMaxAge] = useState<string>("");

	const [prevFilters, setPrevFilters] = useState({ searchTerm, selectedGender, minAge, maxAge });
	if (
		searchTerm !== prevFilters.searchTerm ||
		selectedGender !== prevFilters.selectedGender ||
		minAge !== prevFilters.minAge ||
		maxAge !== prevFilters.maxAge
	) {
		setPrevFilters({ searchTerm, selectedGender, minAge, maxAge });
		setPage(1);
	}

	const filters: PatientFilters = {
		gender: selectedGender,
		minAge,
		maxAge,
	};

	const {
		data: listData,
		isLoading,
		isFetching,
	} = usePatientsList(page, PAGE_SIZE, searchTerm, filters);

	const items = listData?.items || [];
	const totalPages = listData?.metadata?.pageCount || 1;

	const activeFilterCount =
		(selectedGender ? 1 : 0) + (minAge !== "" ? 1 : 0) + (maxAge !== "" ? 1 : 0);

	const applyAgeFilter = () => {
		setMinAge(draftMinAge === "" ? "" : Number(draftMinAge));
		setMaxAge(draftMaxAge === "" ? "" : Number(draftMaxAge));
	};

	const clearAllFilters = () => {
		setSelectedGender("");
		setMinAge("");
		setMaxAge("");
		setDraftMinAge("");
		setDraftMaxAge("");
	};

	const filterProps: PatientsFilterDropdownProps = {
		activeFilterCount,
		selectedGender,
		draftMinAge,
		draftMaxAge,
		onGenderChange: setSelectedGender,
		onDraftMinAgeChange: setDraftMinAge,
		onDraftMaxAgeChange: setDraftMaxAge,
		onApplyAgeFilter: applyAgeFilter,
		onClearAllFilters: clearAllFilters,
	};

	const renderActionButtons = (item: PatientItem) => (
		<div className="flex items-center justify-end gap-1.5 lg:gap-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onViewDetail(item.id)}
				className="h-8 w-8 text-foreground hover:bg-accent"
				title={tTable("actionViewDetail")}
			>
				<Eye className="h-4 w-4" />
			</Button>
			{!readOnly && onDischarge && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDischarge(item)}
					className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
					title={tTable("actionDischarge")}
					disabled={item.treatmentOutcome !== "InTreatment"}
				>
					<LogOut className="h-4 w-4" />
				</Button>
			)}
			{!readOnly && onEdit && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onEdit(item)}
					className="h-8 w-8 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
					title={tTable("actionEdit")}
				>
					<Edit className="h-4 w-4" />
				</Button>
			)}
			{!readOnly && onDelete && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDelete(item)}
					className="h-8 w-8 text-destructive hover:bg-destructive/10"
					title={tTable("actionDelete")}
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
					<PatientsFilterDropdown {...filterProps} />
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
								<div className="min-w-0 space-y-1">
									<button
										type="button"
										onClick={() => onViewDetail(item.id)}
										className="line-clamp-1 text-left font-semibold text-primary hover:underline"
									>
										{item.fullName}
									</button>
									<p className="font-mono text-xs text-muted-foreground">
										{item.medicalRecordCode}
									</p>
								</div>
								{renderOutcomeBadge(item.treatmentOutcome)}
							</div>

							<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
								<span>
									{item.dateOfBirth}{" "}
									<span className="font-medium text-foreground">
										{tTable("ageYears", { age: item.age })}
									</span>
								</span>
								<span className="text-foreground">{tGender(item.gender)}</span>
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
							<TableHead className="w-36 whitespace-nowrap font-semibold text-muted-foreground lg:w-44">
								{tTable("colMedicalRecordCode")}
							</TableHead>
							<TableHead className="min-w-40 whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colFullName")}
							</TableHead>
							<TableHead className="whitespace-nowrap font-semibold text-muted-foreground">
								{tTable("colDobAge")}
							</TableHead>
							<TableHead className="whitespace-nowrap text-center font-semibold text-muted-foreground">
								{tTable("colGender")}
							</TableHead>
							<TableHead className="whitespace-nowrap text-center font-semibold text-muted-foreground">
								{tTable("colStatus")}
							</TableHead>
							<TableHead className="whitespace-nowrap text-right font-semibold text-muted-foreground">
								<div className="flex items-center justify-end gap-2">
									{tCommon("actions")}
									<PatientsFilterDropdown {...filterProps} />
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
									onDoubleClick={() => onViewDetail(item.id)}
								>
									<TableCell className="whitespace-nowrap font-mono text-sm font-medium text-foreground">
										{item.medicalRecordCode}
									</TableCell>
									<TableCell className="whitespace-nowrap font-semibold text-primary">
										{item.fullName}
									</TableCell>
									<TableCell className="whitespace-nowrap text-sm text-muted-foreground">
										{item.dateOfBirth}{" "}
										<span className="font-medium text-foreground">
											{tTable("ageYears", { age: item.age })}
										</span>
									</TableCell>
									<TableCell className="whitespace-nowrap text-center text-sm text-foreground">
										{tGender(item.gender)}
									</TableCell>
									<TableCell className="whitespace-nowrap text-center">
										{renderOutcomeBadge(item.treatmentOutcome)}
									</TableCell>
									<TableCell className="whitespace-nowrap">
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