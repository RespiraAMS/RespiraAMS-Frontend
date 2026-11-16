"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { DoctorsTable } from "./DoctorsTable";
import { DoctorDetailModal } from "./DoctorDetailModal";
import { DoctorSubordinateItem } from "../types";
import { formatDoctorFullName } from "../constants";
import { useAnalysisMutations } from "../../analysis/queries";
import { CreateAnalysisReportRequest } from "../../analysis/types";
import { CreateAnalysisReportForm } from "../../analysis/components/CreateAnalysisReportForm";


export function DoctorsView() {
    const router = useRouter();

    const [detailDoctor, setDetailDoctor] = useState<DoctorSubordinateItem | null>(null);
    const [reportDoctor, setReportDoctor] = useState<DoctorSubordinateItem | null>(null);

    const { createMutation } = useAnalysisMutations();

    const handleCreateReportSubmit = (payload: CreateAnalysisReportRequest) => {
        createMutation.mutate(payload, {
            onSuccess: (createdReport) => {
                toast.success(
                    `Đã tạo báo cáo phân tích cho ${
                        reportDoctor ? formatDoctorFullName(reportDoctor) : "bác sĩ"
                    }!`
                );
                setReportDoctor(null);
                if (createdReport?.analysisId) {
                    router.push(`/doctor/analysis/${createdReport.analysisId}`);
                }
            },
            onError: (error) => {
                toast.error("Lỗi khi tạo báo cáo: " + error.message);
            },
        });
    };

    return (
        <div className="space-y-6 text-foreground bg-background">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Danh sách Bác sĩ trực thuộc
                </h2>
                <p className="text-muted-foreground mt-1">
                    Quản lý đội ngũ bác sĩ trong khoa, xem thông tin hồ sơ chuyên môn và xuất báo cáo đánh giá kê đơn cá nhân.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground">
                <DoctorsTable
                    onViewDetail={(doctor) => setDetailDoctor(doctor)}
                    onCreateReport={(doctor) => setReportDoctor(doctor)}
                />
            </div>

            <DoctorDetailModal
                doctorItem={detailDoctor}
                isOpen={!!detailDoctor}
                onClose={() => setDetailDoctor(null)}
                onCreateReport={(doctor) => setReportDoctor(doctor)}
            />

            <Dialog
                open={!!reportDoctor}
                onOpenChange={(open) => !open && setReportDoctor(null)}
            >
                <DialogContent className="sm:max-w-lg border-border bg-popover text-popover-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-foreground">
                            Tạo Báo Cáo Phân Tích Cá Nhân
                        </DialogTitle>
                    </DialogHeader>
                    {reportDoctor && (
                        <CreateAnalysisReportForm
                            doctorId={reportDoctor.id}
                            doctorName={formatDoctorFullName(reportDoctor)}
                            onSubmit={handleCreateReportSubmit}
                            onCancel={() => setReportDoctor(null)}
                            isPending={createMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}