"use client";

import { useState } from "react";
import { Edit, Eye, ListFilter, Loader2, LogOut, Trash } from "lucide-react";
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function renderOutcomeBadge(outcome: TreatmentOutcome) {
    switch (outcome) {
        case "InTreatment":
            return (
                <span className="inline-flex items-center rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Đang điều trị
                </span>
            );
        case "Recovered":
            return (
                <span className="inline-flex items-center rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Khỏi bệnh
                </span>
            );
        case "Death":
            return (
                <span className="inline-flex items-center rounded bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Tử vong
                </span>
            );
        case "OutOfScope":
            return (
                <span className="inline-flex items-center rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Ngoài phạm vi
                </span>
            );
        default:
            return null;
    }
}

export function PatientsTable({
    readOnly = false,
    searchTerm = "",
    onViewDetail,
    onEdit,
    onDelete,
    onDischarge,
}: PatientsTableProps) {
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

    const { data: listData, isLoading, isFetching } = usePatientsList(
        page,
        PAGE_SIZE,
        searchTerm,
        filters
    );

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

    const filterDropdown = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-64 bg-popover text-popover-foreground border-border"
            >
                <DropdownMenuLabel>Bộ lọc bệnh nhân</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        Giới tính {selectedGender ? `(${selectedGender === "Male" ? "Nam" : "Nữ"})` : ""}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-popover text-popover-foreground border-border">
                        <DropdownMenuItem
                            onClick={() => setSelectedGender("")}
                            className={selectedGender === "" ? "bg-accent font-semibold" : ""}
                        >
                            Tất cả
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setSelectedGender("Male")}
                            className={selectedGender === "Male" ? "bg-accent font-semibold" : ""}
                        >
                            Nam (Male)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setSelectedGender("Female")}
                            className={selectedGender === "Female" ? "bg-accent font-semibold" : ""}
                        >
                            Nữ (Female)
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <div
                    className="p-2 space-y-2"
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Label className="text-xs font-semibold text-muted-foreground">Độ tuổi (Min - Max)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min={0}
                            placeholder="Từ"
                            value={draftMinAge}
                            onChange={(e) => setDraftMinAge(e.target.value)}
                            className="h-8 text-xs"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="number"
                            min={0}
                            placeholder="Đến"
                            value={draftMaxAge}
                            onChange={(e) => setDraftMaxAge(e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="w-full h-7 text-xs"
                        onClick={applyAgeFilter}
                    >
                        Áp dụng tuổi
                    </Button>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAllFilters} className="text-destructive focus:text-destructive">
                    Xóa tất cả bộ lọc
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

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
                        <TableHead className="text-muted-foreground font-semibold w-44">Mã bệnh án</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Họ và tên</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Ngày sinh / Tuổi</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-center">Giới tính</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-center">Trạng thái</TableHead>
                        <TableHead className="text-muted-foreground text-right font-semibold">
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
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : items.length === 0 ? (
                        <TableRow className="border-border">
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                Không tìm thấy dữ liệu bệnh nhân.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow
                                key={item.id}
                                className="border-border hover:bg-accent/50 cursor-pointer"
                                onDoubleClick={() => onViewDetail(item.id)}
                            >
                                <TableCell className="font-mono text-sm font-medium text-foreground">
                                    {item.medicalRecordCode}
                                </TableCell>
                                <TableCell className="font-semibold text-primary">
                                    {item.fullName}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {item.dateOfBirth} <span className="font-medium text-foreground">({item.age} tuổi)</span>
                                </TableCell>
                                <TableCell className="text-center text-sm">
                                    {item.gender === "Male" ? "Nam" : "Nữ"}
                                </TableCell>
                                <TableCell className="text-center">
                                    {renderOutcomeBadge(item.treatmentOutcome)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewDetail(item.id)}
                                            className="hover:bg-accent text-foreground h-8 w-8"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {!readOnly && onDischarge && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDischarge(item)}
                                                className="hover:bg-accent text-emerald-600 h-8 w-8"
                                                title="Xuất viện / Kết quả điều trị"
                                                disabled={!(item.treatmentOutcome==="InTreatment")}
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {!readOnly && onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(item)}
                                                className="hover:bg-accent text-blue-600 h-8 w-8"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {!readOnly && onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(item)}
                                                className="hover:bg-destructive/10 text-destructive h-8 w-8"
                                                title="Xóa"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
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
    );
}