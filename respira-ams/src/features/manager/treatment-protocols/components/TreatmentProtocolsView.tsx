"use client";

import { useState } from "react";
import { Plus, Edit, Trash, Loader2, FilterX } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useTreatmentProtocolsList, useTreatmentProtocolMutations } from "../queries";
import { TreatmentProtocolForm } from "./TreatmentProtocolForm";
import { 
    type TreatmentProtocolItem, 
    type TreatmentProtocolRequest,
    type SeverityLevel,
    type TreatmentSite,
    type FilterTreatmentProtocolsRequest
} from "../types";

const PAGE_SIZE = 10;

export function TreatmentProtocolsView() {
    const tCommon = useTranslations("common");
    
    // States for Pagination & Filters
    const [page, setPage] = useState(1);
    const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | "ALL">("ALL");
    const [filterSite, setFilterSite] = useState<TreatmentSite | "ALL">("ALL");
    
    const queryFilters: FilterTreatmentProtocolsRequest = {
        page,
        pageSize: PAGE_SIZE,
        severity: filterSeverity !== "ALL" ? filterSeverity : null,
        treatmentSite: filterSite !== "ALL" ? filterSite : null,
        // (Nếu cần làm UI filter cho Pathogen/Criteria thì nối state vào đây, tạm thời dùng select cơ bản)
    };

    const { data: listData, isLoading, isFetching } = useTreatmentProtocolsList(queryFilters);
    const { createMutation, updateMutation, deleteMutation } = useTreatmentProtocolMutations();

    const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
    const [selectedItem, setSelectedItem] = useState<TreatmentProtocolItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<TreatmentProtocolItem | null>(null);

    const items = listData?.items || [];
    const totalPages = listData?.metadata?.pageCount || 1;

    const resetFilters = () => {
        setFilterSeverity("ALL");
        setFilterSite("ALL");
        setPage(1);
    };

    const handleFormSubmit = (data: TreatmentProtocolRequest) => {
        if (modalMode === "create") {
            createMutation.mutate(data, {
                onSuccess: () => {
                    setModalMode(null);
                    toast.success("Tạo phác đồ điều trị thành công!");
                },
                onError: (err) => toast.error("Lỗi tạo mới: " + err.message)
            });
        } else if (modalMode === "update" && selectedItem) {
            updateMutation.mutate({ id: selectedItem.id, data }, {
                onSuccess: () => {
                    setModalMode(null);
                    setSelectedItem(null);
                    toast.success("Cập nhật phác đồ thành công!");
                },
                onError: (err) => toast.error("Lỗi cập nhật: " + err.message)
            });
        }
    };

    const handleDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id, {
                onSuccess: () => {
                    setItemToDelete(null);
                    toast.success("Đã xóa phác đồ!");
                },
                onError: (err) => toast.error("Không thể xóa: " + err.message)
            });
        }
    };

    const getSeverityBadge = (severity: SeverityLevel) => {
        const styles = {
            Mild: "bg-emerald-100 text-emerald-700 border-emerald-200",
            Moderate: "bg-amber-100 text-amber-700 border-amber-200",
            Severe: "bg-rose-100 text-rose-700 border-rose-200"
        };
        return <Badge variant="outline" className={styles[severity]}>{severity}</Badge>;
    };

    return (
        <div className="space-y-6 bg-background">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Phác đồ Điều trị</h2>
                    <p className="text-muted-foreground mt-1">Quản lý các phác đồ kháng sinh theo mức độ và cơ sở điều trị</p>
                </div>
                <Button onClick={() => { setSelectedItem(null); setModalMode("create"); }} className="bg-primary shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Phác đồ
                </Button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg shadow-sm">
                <Select value={filterSeverity} onValueChange={(v: any) => { setFilterSeverity(v); setPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Mức độ (Severity)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả mức độ</SelectItem>
                        <SelectItem value="Mild">Nhẹ (Mild)</SelectItem>
                        <SelectItem value="Moderate">Trung bình (Moderate)</SelectItem>
                        <SelectItem value="Severe">Nặng (Severe)</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterSite} onValueChange={(v: any) => { setFilterSite(v); setPage(1); }}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Cơ sở (Site)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả cơ sở</SelectItem>
                        <SelectItem value="Outpatient">Ngoại trú</SelectItem>
                        <SelectItem value="Inpatient">Nội trú</SelectItem>
                        <SelectItem value="IntensiveCareUnit">Hồi sức tích cực (ICU)</SelectItem>
                    </SelectContent>
                </Select>

                {(filterSeverity !== "ALL" || filterSite !== "ALL") && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                        <FilterX className="w-4 h-4 mr-2" /> Xóa bộ lọc
                    </Button>
                )}
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground relative">
                {isFetching && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-primary/20 overflow-hidden rounded-t-md">
                        <div className="h-full bg-primary animate-pulse w-1/2 translate-x-1/2" />
                    </div>
                )}
                
                <Table className="border-border">
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-semibold w-40">Phân loại</TableHead>
                            <TableHead className="text-muted-foreground font-semibold w-64">Chỉ định cụ thể (Đích/Tiêu chí)</TableHead>
                            <TableHead className="text-muted-foreground font-semibold">Các lựa chọn Phác đồ (Hoặc)</TableHead>
                            <TableHead className="text-muted-foreground font-semibold text-center w-24">Trạng thái</TableHead>
                            <TableHead className="text-muted-foreground font-semibold text-right w-24">{tCommon("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-border">
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow className="border-border">
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                    Không tìm thấy phác đồ điều trị phù hợp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} className="border-border hover:bg-accent/50 align-top">
                                    <TableCell>
                                        <div className="space-y-2">
                                            {getSeverityBadge(item.severity)}
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                                {item.treatmentSite === "IntensiveCareUnit" ? "ICU" : item.treatmentSite}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-3">
                                            {item.pathogens.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Mầm bệnh</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.pathogens.map(p => <Badge key={p.id} variant="secondary" className="text-[10px] bg-muted">{p.name}</Badge>)}
                                                    </div>
                                                </div>
                                            )}
                                            {item.criteria.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Tiêu chí</div>
                                                    <ul className="list-disc pl-3 text-xs text-foreground/80 space-y-1">
                                                        {item.criteria.map(c => <li key={c.id}>{c.name}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                            {item.pathogens.length === 0 && item.criteria.length === 0 && (
                                                <span className="text-xs text-muted-foreground italic">Áp dụng chung (Kinh nghiệm)</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            {item.treatments.map((group, gIdx) => (
                                                <div key={gIdx} className="flex items-center flex-wrap gap-1.5 p-2 bg-muted/40 rounded-md border border-border/50 text-sm">
                                                    <span className="font-bold text-muted-foreground mr-1 text-xs">#{gIdx + 1}</span>
                                                    {group.map((ab, idx) => (
                                                        <span key={ab.id} className="flex items-center gap-1.5">
                                                            <span className="font-medium text-primary">{ab.name}</span>
                                                            {idx < group.length - 1 && <span className="text-muted-foreground font-bold text-xs">+</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.isApplied ? (
                                            <span className="inline-flex items-center rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-600">Active</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded bg-muted border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">Inactive</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setModalMode("update"); }} className="hover:bg-accent text-blue-600 h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)} className="hover:bg-destructive/10 text-destructive h-8 w-8">
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
                                <PaginationPrevious className={page > 1 ? "cursor-pointer" : "pointer-events-none opacity-50"} onClick={() => setPage(p => Math.max(1, p - 1))} />
                            </PaginationItem>
                            <span className="text-sm text-muted-foreground px-2">{tCommon("pageOf", { page, totalPages })}</span>
                            <PaginationItem>
                                <PaginationNext className={page < totalPages ? "cursor-pointer" : "pointer-events-none opacity-50"} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Modal Form */}
            <Dialog open={modalMode !== null} onOpenChange={(open) => !open && setModalMode(null)}>
                <DialogContent className="sm:max-w-4xl border-border bg-card max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{modalMode === "create" ? "Thêm Phác đồ Điều trị" : "Cập nhật Phác đồ"}</DialogTitle>
                    </DialogHeader>
                    {modalMode && (
                        <TreatmentProtocolForm
                            initialData={selectedItem}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setModalMode(null)}
                            isPending={createMutation.isPending || updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent className="border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive font-semibold">Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phác đồ điều trị này không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setItemToDelete(null)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null} Xóa
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}