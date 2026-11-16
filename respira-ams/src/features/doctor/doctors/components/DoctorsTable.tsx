"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, FileBarChart2, FileSpreadsheet, ListFilter, Loader2, RotateCcw } from "lucide-react";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useSearchStore } from "@/features/manager/stores/searchStore";
import { useSubordinateDoctors } from "../queries";
import {
    AcademicTitle,
    AccountStatus,
    DoctorDegree,
    DoctorGender,
    DoctorPosition,
    DoctorRole,
    DoctorSubordinateItem,
} from "../types";
import {
    ACADEMIC_TITLE_LABELS,
    ACCOUNT_STATUS_LABELS,
    DEGREE_LABELS,
    formatDoctorFullName,
    GENDER_LABELS,
    POSITION_LABELS,
    ROLE_LABELS,
} from "../constants";

const PAGE_SIZE = 10;

interface DoctorsTableProps {
    onViewDetail: (doctor: DoctorSubordinateItem) => void;
    onCreateReport: (doctor: DoctorSubordinateItem) => void;
}

export function DoctorsTable({ onViewDetail, onCreateReport }: DoctorsTableProps) {
    const tCommon = useTranslations("common");

    const [page, setPage] = useState(1);
    const [gender, setGender] = useState<DoctorGender | null>(null);
    const [academicTitle, setAcademicTitle] = useState<AcademicTitle | null>(null);
    const [position, setPosition] = useState<DoctorPosition | null>(null);

    const searchTerm = useSearchStore((s) => s.value);
    const clearSearch = useSearchStore((s) => s.clear);

    useEffect(() => {
        clearSearch();
    }, [clearSearch]);

    const [prevFilters, setPrevFilters] = useState({
        searchTerm,
        gender,
        academicTitle,
        position,
    });
    if (
        searchTerm !== prevFilters.searchTerm ||
        gender !== prevFilters.gender ||
        academicTitle !== prevFilters.academicTitle ||
        position !== prevFilters.position
    ) {
        setPrevFilters({ searchTerm, gender, academicTitle, position });
        setPage(1);
    }

    const { data: listData, isLoading, isFetching } = useSubordinateDoctors({
        page,
        pageSize: PAGE_SIZE,
        searchTerm,
        gender,
        academicTitle,
        position,
    });

    const items = listData?.items || [];
    const totalPages = listData?.metadata?.pageCount || 1;

    const activeFilterCount = [gender, academicTitle, position].filter(Boolean).length;

    const resetFilters = () => {
        setGender(null);
        setAcademicTitle(null);
        setPosition(null);
        setPage(1);
    };

    return (
        <div className="relative">
            {isFetching && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md z-10">
                    <div className="h-full bg-primary animate-pulse w-1/2 translate-x-1/2" />
                </div>
            )}

            <Table className="border-border">
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground font-semibold">
                            Bác sĩ
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold">
                            Học hàm / Học vị
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold">
                            Chức vụ & Vai trò
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold w-[100px]">
                            Giới tính
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold w-[140px]">
                            Trạng thái
                        </TableHead>
                        <TableHead className="text-muted-foreground text-right font-semibold w-[135px]">
                            <div className="flex items-center justify-end gap-2">
                                {tCommon("actions")}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Bộ lọc bác sĩ"
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
                                        className="w-72 space-y-4 border-border bg-popover text-popover-foreground p-4"
                                    >
                                        <div className="flex items-center justify-between border-b border-border pb-2">
                                            <span className="text-sm font-semibold">Lọc danh sách</span>
                                            {activeFilterCount > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                                >
                                                    <RotateCcw className="h-3 w-3" /> Đặt lại
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Giới tính</Label>
                                            <Select
                                                value={gender ?? "ALL"}
                                                onValueChange={(val) =>
                                                    setGender(val === "ALL" ? null : (val as DoctorGender))
                                                }
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Tất cả giới tính" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">Tất cả giới tính</SelectItem>
                                                    {(Object.keys(GENDER_LABELS) as DoctorGender[]).map(
                                                        (key) => (
                                                            <SelectItem key={key} value={key}>
                                                                {GENDER_LABELS[key]}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Học hàm</Label>
                                            <Select
                                                value={academicTitle ?? "ALL"}
                                                onValueChange={(val) =>
                                                    setAcademicTitle(
                                                        val === "ALL" ? null : (val as AcademicTitle)
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Tất cả học hàm" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">Tất cả học hàm</SelectItem>
                                                    {(
                                                        Object.keys(
                                                            ACADEMIC_TITLE_LABELS
                                                        ) as AcademicTitle[]
                                                    ).map((key) => (
                                                        <SelectItem key={key} value={key}>
                                                            {ACADEMIC_TITLE_LABELS[key]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Chức vụ</Label>
                                            <Select
                                                value={position ?? "ALL"}
                                                onValueChange={(val) =>
                                                    setPosition(
                                                        val === "ALL" ? null : (val as DoctorPosition)
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Tất cả chức vụ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">Tất cả chức vụ</SelectItem>
                                                    {(
                                                        Object.keys(
                                                            POSITION_LABELS
                                                        ) as DoctorPosition[]
                                                    ).map((key) => (
                                                        <SelectItem key={key} value={key}>
                                                            {POSITION_LABELS[key]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </PopoverContent>
                                </Popover>
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
                                Không tìm thấy bác sĩ nào phù hợp.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow
                                key={item.id}
                                className="border-border hover:bg-accent/50 cursor-pointer"
                                onClick={() => onViewDetail(item)}
                            >
                                <TableCell className="align-top">
                                    <div className="flex items-center gap-3">
                                        {item.avatarUrl ? (
                                            <Image
                                                src={item.avatarUrl}
                                                alt={formatDoctorFullName(item)}
                                                width={36}
                                                height={36}
                                                unoptimized
                                                className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                                                {item.lastName?.[0]}
                                                {item.firstName?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-primary">
                                                {formatDoctorFullName(item)}
                                            </div>
                                            {(item.email || item.phone) && (
                                                <div className="text-xs text-muted-foreground">
                                                    {[item.email, item.phone].filter(Boolean).join(" • ")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top space-y-1.5">
                                    {item.academicTitle && item.academicTitle !== "None" && (
                                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                            {ACADEMIC_TITLE_LABELS[
                                                item.academicTitle as AcademicTitle
                                            ] || item.academicTitle}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                        {item.degrees && item.degrees.length > 0 ? (
                                            item.degrees.map((deg, idx) => (
                                                <span
                                                    key={`${deg}-${idx}`}
                                                    className="inline-flex items-center rounded bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300"
                                                >
                                                    {DEGREE_LABELS[deg as DoctorDegree] || deg}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="text-sm font-medium text-foreground">
                                        {POSITION_LABELS[item.position as DoctorPosition] ||
                                            item.position}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {ROLE_LABELS[item.role as DoctorRole] || item.role}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top text-sm text-foreground">
                                    {GENDER_LABELS[item.gender as DoctorGender] || item.gender}
                                </TableCell>

                                <TableCell className="align-top">
                                    {item.accountStatus === "Active" ? (
                                        <span className="inline-flex items-center rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                            {ACCOUNT_STATUS_LABELS.Active}
                                        </span>
                                    ) : item.accountStatus === "InActive" ? (
                                        <span className="inline-flex items-center rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                                            {ACCOUNT_STATUS_LABELS.InActive}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </TableCell>

                                <TableCell
                                    className="align-top"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Tạo báo cáo phân tích"
                                            onClick={() => onCreateReport(item)}
                                            className="hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 h-8 w-8"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Xem chi tiết bác sĩ"
                                            onClick={() => onViewDetail(item)}
                                            className="hover:bg-accent text-foreground h-8 w-8"
                                        >
                                            <Eye className="h-4 w-4" />
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
                                className={
                                    page > 1
                                        ? "cursor-pointer hover:bg-accent"
                                        : "pointer-events-none opacity-50"
                                }
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            />
                        </PaginationItem>
                        <span className="text-sm text-muted-foreground px-2">
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