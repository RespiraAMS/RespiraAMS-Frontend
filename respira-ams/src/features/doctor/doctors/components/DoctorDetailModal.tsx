"use client";

import Image from "next/image";
import {
    Loader2,
    User,
    GraduationCap,
    Briefcase,
    ShieldCheck,
    CreditCard,
    Calendar,
    MapPin,
    Mail,
    Phone,
    FileBarChart2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useDoctorDetailModal } from "../queries";
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

interface DoctorDetailModalProps {
    doctorItem: DoctorSubordinateItem | null;
    isOpen: boolean;
    onClose: () => void;
    onCreateReport: (doctor: DoctorSubordinateItem) => void;
}

function formatDate(isoString?: string | null): string {
    if (!isoString) return "Chưa cập nhật";
    return new Date(isoString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function DoctorDetailModal({
    doctorItem,
    isOpen,
    onClose,
    onCreateReport,
}: DoctorDetailModalProps) {
    const doctorId = doctorItem?.id ?? null;
    const { data: detailData, isLoading } = useDoctorDetailModal(doctorId, {
        enabled: isOpen && !!doctorId,
    });

    const info = detailData ?? doctorItem;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl border-border bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        Thông tin chi tiết Bác sĩ
                    </DialogTitle>
                </DialogHeader>

                {isLoading && !info ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !info ? (
                    <div className="py-8 text-center text-sm text-destructive">
                        Không thể tải thông tin bác sĩ.
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-3.5">
                                {doctorItem?.avatarUrl ? (
                                    <Image
                                        src={doctorItem.avatarUrl}
                                        alt={formatDoctorFullName(info)}
                                        width={56}
                                        height={56}
                                        unoptimized
                                        className="h-14 w-14 rounded-full object-cover border border-border"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-lg border border-primary/25">
                                        {info.lastName?.[0]}
                                        {info.firstName?.[0]}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-foreground">
                                        {formatDoctorFullName(info)}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/25 px-2 py-0.5 text-xs font-semibold text-primary">
                                            {ROLE_LABELS[info.role as DoctorRole] || info.role}
                                        </span>

                                        {doctorItem?.accountStatus && (
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${
                                                    doctorItem.accountStatus === "Active"
                                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                                        : "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400"
                                                }`}
                                            >
                                                {ACCOUNT_STATUS_LABELS[
                                                    doctorItem.accountStatus as AccountStatus
                                                ] || doctorItem.accountStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {doctorItem && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        onClose();
                                        onCreateReport(doctorItem);
                                    }}
                                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-center"
                                >
                                    <FileBarChart2 className="h-4 w-4" />
                                    Tạo báo cáo
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                Bằng cấp / Học vị
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {info.degrees && info.degrees.length > 0 ? (
                                    info.degrees.map((deg, index) => (
                                        <span
                                            key={`${deg}-${index}`}
                                            className="inline-flex items-center rounded-md bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300"
                                        >
                                            {DEGREE_LABELS[deg as DoctorDegree] || deg}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">
                                        Chưa cập nhật học vị
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5" /> Chức vụ
                                </span>
                                <p className="font-semibold text-foreground">
                                    {POSITION_LABELS[info.position as DoctorPosition] || info.position}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Học hàm
                                </span>
                                <p className="font-semibold text-foreground">
                                    {ACADEMIC_TITLE_LABELS[info.academicTitle as AcademicTitle] ||
                                        info.academicTitle}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" /> Giới tính
                                </span>
                                <p className="font-medium text-foreground">
                                    {GENDER_LABELS[info.gender as DoctorGender] || info.gender}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Ngày sinh
                                </span>
                                <p className="font-medium text-foreground">
                                    {formatDate(info.dateOfBirth)}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <CreditCard className="h-3.5 w-3.5" /> Số CCCD / CMND
                                </span>
                                <p className="font-mono font-medium text-foreground">
                                    {info.citizenIdentificationNumber || "Chưa cập nhật"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Ngày tham gia hệ thống
                                </span>
                                <p className="font-medium text-foreground">
                                    {formatDate(info.createdAt)}
                                </p>
                            </div>

                            {doctorItem?.email && (
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </span>
                                    <p className="font-medium text-foreground break-all">
                                        {doctorItem.email}
                                    </p>
                                </div>
                            )}

                            {doctorItem?.phone && (
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5" /> Số điện thoại
                                    </span>
                                    <p className="font-medium text-foreground">{doctorItem.phone}</p>
                                </div>
                            )}

                            <div className="space-y-1 sm:col-span-2">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" /> Địa chỉ
                                </span>
                                <p className="font-medium text-foreground">
                                    {info.address || "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}