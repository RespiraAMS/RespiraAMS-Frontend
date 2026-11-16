"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AnalysisReportsTable } from "./AnalysisReportsTable";
import { CreateAnalysisReportForm } from "./CreateAnalysisReportForm";
import { useAnalysisMutations } from "../queries";
import { AnalysisReportItem, CreateAnalysisReportRequest } from "../types";

export function AnalysisReportsView() {
    const tCommon = useTranslations("common");
    const router = useRouter();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<AnalysisReportItem | null>(null);

    const { createMutation, deleteMutation } = useAnalysisMutations();

    const handleViewDetail = (analysisId: string) => {
        router.push(`/doctor/analysis/${analysisId}`);
    };

    const handleCreateSubmit = (payload: CreateAnalysisReportRequest) => {
        createMutation.mutate(payload, {
            onSuccess: (createdReport) => {
                toast.success("Đã tạo báo cáo phân tích thành công!");
                setIsCreateOpen(false);
                if (createdReport?.analysisId) {
                    router.push(`/doctor/analysis/${createdReport.analysisId}`);
                }
            },
            onError: (error) => {
                toast.error("Lỗi khi tạo báo cáo: " + error.message);
            },
        });
    };

    const handleDelete = () => {
        if (!reportToDelete) return;
        deleteMutation.mutate(reportToDelete.analysisId, {
            onSuccess: () => {
                setReportToDelete(null);
                toast.success("Đã xóa báo cáo phân tích thành công!");
            },
            onError: (error) => {
                toast.error("Không thể xóa báo cáo: " + error.message);
            },
        });
    };

    const formatDateRange = (item: AnalysisReportItem | null) => {
        if (!item) return "";
        const start = new Date(item.start).toLocaleDateString("vi-VN");
        const end = new Date(item.end).toLocaleDateString("vi-VN");
        return `${start} — ${end}`;
    };

    return (
        <div className="space-y-6 text-foreground bg-background">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Báo cáo Phân tích Kháng sinh
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Thống kê mức độ tuân thủ phác đồ điều trị, phân nhóm thuốc AWaRe và kết quả điều trị.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo báo cáo mới
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
                <AnalysisReportsTable
                    onViewDetail={handleViewDetail}
                    onDelete={setReportToDelete}
                />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg border-border bg-popover text-popover-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-foreground">
                            Tạo Báo Cáo Phân Tích Mới
                        </DialogTitle>
                    </DialogHeader>
                    {isCreateOpen && (
                        <CreateAnalysisReportForm
                            onSubmit={handleCreateSubmit}
                            onCancel={() => setIsCreateOpen(false)}
                            isPending={createMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={!!reportToDelete}
                onOpenChange={(open) => !open && setReportToDelete(null)}
            >
                <AlertDialogContent className="border-border bg-popover text-popover-foreground shadow-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive font-semibold">
                            Xác nhận xóa báo cáo
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Bạn có chắc chắn muốn xóa báo cáo phân tích kỳ{" "}
                            <span className="font-bold text-foreground">
                                {formatDateRange(reportToDelete)}
                            </span>{" "}
                            không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReportToDelete(null)}
                            disabled={deleteMutation.isPending}
                            className="border-border text-foreground hover:bg-accent"
                        >
                            {tCommon("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {tCommon("delete")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}