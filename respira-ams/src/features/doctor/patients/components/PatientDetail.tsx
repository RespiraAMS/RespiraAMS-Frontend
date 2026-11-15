"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Copy,
    Edit,
    Loader2,
    LogOut,
    Phone,
    Plus,
    ShieldCheck,
    Trash,
    XCircle,
} from "lucide-react";
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

import { cn } from "@/lib/utils";
import {
    usePatientDetail,
    usePatientMutations,
    useNextOfKinMutations,
    useTreatmentPlanMutations,
} from "../queries";
import { PatientForm } from "./PatientForm";
import { DischargePatientDialog } from "./DischargePatientDialog";
import { NextOfKinFormDialog } from "./NextOfKinFormDialog";
import {
    type UpdatePatientRequest,
    type TreatmentOutcome,
    type NextOfKinItem,
    type NextOfKinRequest,
    type PatientTreatmentPlanItem,
    type AdherenceState,
} from "../types";
import { CloseTreatmentPlanDialog, ReviewTreatmentPlanDialog, TreatmentPlanDetailDialog } from "../treatment-plans";

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function calculateAge(dobString: string): number {
    const dob = new Date(dobString);
    if (Number.isNaN(dob.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

function formatDateVN(dateString: string | null | undefined): string {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatDateTimeVN(isoString: string | null | undefined, emptyText = "Chưa xuất viện"): string {
    if (!isoString) return emptyText;
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    const time = d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
    });
    const date = d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
    });
    return `${time} - ${date}`;
}

function calculateBMI(heightCm: number, weightKg: number) {
    if (!heightCm || heightCm <= 0) {
        return {
            value: "0.0",
            label: "Chưa xác định",
            color: "text-muted-foreground bg-muted border-border",
        };
    }
    const h = heightCm / 100;
    const bmiNum = weightKg / (h * h);
    const value = bmiNum.toFixed(1);

    if (bmiNum < 18.5) {
        return {
            value,
            label: "Thiếu cân",
            color: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
        };
    }
    if (bmiNum < 23) {
        return {
            value,
            label: "Bình thường",
            color: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        };
    }
    return {
        value,
        label: "Thừa cân",
        color: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
    };
}

function renderAdherenceBadge(state: AdherenceState) {
    switch (state) {
        case "Adhere":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tuân thủ
                </span>
            );        
        case "NotAdhere":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Không tuân thủ
                </span>
            );
        case "NotAdhereValid":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Không tuân thủ hợp lệ
                </span>
            );
        case "NotAdhereInvalid":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                    <XCircle className="w-3.5 h-3.5" />
                    Không tuân thủ không hợp lệ
                </span>
            );
        default:
            return null;
    }
}

function renderHeaderOutcomeBadge(outcome: TreatmentOutcome) {
    switch (outcome) {
        case "InTreatment":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-semibold rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    Đang điều trị
                </span>
            );
        case "Recovered":
            return (
                <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Khỏi bệnh
                </span>
            );
        case "Death":
            return (
                <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                    Tử vong
                </span>
            );
        case "OutOfScope":
            return (
                <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    Ngoài phạm vi
                </span>
            );
    }
}

interface PatientDetailProps {
    id: string;
    isHeadDepartmentDoctor?: boolean;
}

export function PatientDetail({ id, isHeadDepartmentDoctor = false }: PatientDetailProps) {
    const router = useRouter();
    const tCommon = useTranslations("common");

    const { data: patient, isLoading } = usePatientDetail(id);
    const { updateMutation, deleteMutation, dischargeMutation } = usePatientMutations();
    const { addKinMutation, updateKinMutation, deleteKinMutation } = useNextOfKinMutations(id);
    const { closePlanMutation, reviewPlanMutation } = useTreatmentPlanMutations(id);

    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDischargeOpen, setIsDischargeOpen] = useState(false);

    const [kinModalOpen, setKinModalOpen] = useState(false);
    const [editingKin, setEditingKin] = useState<NextOfKinItem | null>(null);
    const [kinToDelete, setKinToDelete] = useState<NextOfKinItem | null>(null);

    const [planFilter, setPlanFilter] = useState<"ALL" | "IN_PROGRESS" | "NOT_ADHERE">("ALL");
    const [detailPlanId, setDetailPlanId] = useState<string | null>(null);
    const [closingPlanId, setClosingPlanId] = useState<string | null>(null);
    const [reviewingPlan, setReviewingPlan] = useState<PatientTreatmentPlanItem | null>(null);

    const treatmentPlans = patient?.treatmentPlans;
    const sortedPlans = useMemo(() => {
        if (!treatmentPlans) return [];
        // return [...treatmentPlans].sort(
        //     (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        // );
        return treatmentPlans;
    }, [treatmentPlans]);

    const inProgressCount = useMemo(
        () => sortedPlans.filter((p) => p.treatmentPlanStatus === 0).length,
        [sortedPlans]
    );

    const notAdhereCount = useMemo(
        () => sortedPlans.filter((p) => p.adherenceState === "NotAdhere").length,
        [sortedPlans]
    );

    const filteredPlans = useMemo(() => {
        return sortedPlans.filter((plan) => {
            if (planFilter === "IN_PROGRESS") return plan.treatmentPlanStatus === 0;
            if (planFilter === "NOT_ADHERE") return plan.adherenceState === "NotAdhere";
            return true;
        });
    }, [sortedPlans, planFilter]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép ${label}: ${text}`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-16 text-destructive font-medium">
                Không tìm thấy thông tin bệnh nhân.
            </div>
        );
    }

    const age = calculateAge(patient.dateOfBirth);
    const genderLabel = patient.gender === "Male" ? "Nam" : "Nữ";
    const bmi = calculateBMI(patient.height, patient.weight);

    const handleUpdateSubmit = (data: UpdatePatientRequest) => {
        updateMutation.mutate(
            { id, data },
            {
                onSuccess: () => {
                    setIsUpdateOpen(false);
                    toast.success("Cập nhật thông tin bệnh nhân thành công!");
                },
                onError: (err) => toast.error("Lỗi cập nhật: " + err.message),
            }
        );
    };

    const handleDeletePatient = () => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Xóa hồ sơ bệnh nhân thành công!");
                router.push("/doctor/patients");
            },
            onError: (err) => toast.error("Lỗi xóa: " + err.message),
        });
    };

    const handleDischargeConfirm = (outcome: TreatmentOutcome) => {
        dischargeMutation.mutate(
            { id, outcome },
            {
                onSuccess: () => {
                    setIsDischargeOpen(false);
                    toast.success("Cập nhật xuất viện thành công!");
                },
                onError: (err) => toast.error("Lỗi cập nhật xuất viện: " + err.message),
            }
        );
    };

    const openAddKin = () => {
        setEditingKin(null);
        setKinModalOpen(true);
    };

    const openEditKin = (kin: NextOfKinItem) => {
        setEditingKin(kin);
        setKinModalOpen(true);
    };

    const handleKinSubmit = (data: NextOfKinRequest) => {
        if (editingKin) {
            updateKinMutation.mutate(
                { nextOfKinId: editingKin.id, data },
                {
                    onSuccess: () => {
                        setKinModalOpen(false);
                        setEditingKin(null);
                        toast.success("Cập nhật người thân thành công!");
                    },
                    onError: (err) => toast.error("Lỗi cập nhật người thân: " + err.message),
                }
            );
        } else {
            addKinMutation.mutate(data, {
                onSuccess: () => {
                    setKinModalOpen(false);
                    toast.success("Thêm người thân liên hệ thành công!");
                },
                onError: (err) => toast.error("Lỗi thêm người thân: " + err.message),
            });
        }
    };

    const handleDeleteKin = () => {
        if (!kinToDelete) return;
        deleteKinMutation.mutate(kinToDelete.id, {
            onSuccess: () => {
                setKinToDelete(null);
                toast.success("Đã xóa người thân liên hệ!");
            },
            onError: (err) => toast.error("Lỗi xóa người thân: " + err.message),
        });
    };

    const handleClosePlan = (planId: string, reason: string) => {
        closePlanMutation.mutate(
            { planId, data: { reason } },
            {
                onSuccess: () => {
                    setClosingPlanId(null);
                    toast.success("Đã đóng kế hoạch điều trị!");
                },
                onError: (err) => toast.error("Lỗi đóng phác đồ: " + err.message),
            }
        );
    };

    const handleReviewPlan = (planId: string, adherenceState: AdherenceState) => {
        reviewPlanMutation.mutate(
            { planId, data: { adherenceState } },
            {
                onSuccess: () => {
                    setReviewingPlan(null);
                    toast.success("Cập nhật đánh giá tuân thủ thành công!");
                },
                onError: (err) => toast.error("Lỗi đánh giá phác đồ: " + err.message),
            }
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 text-foreground">
            <section className="bg-card rounded-xl border border-border shadow-sm p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="hover:bg-accent rounded-full shrink-0"
                            title="Quay lại"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>

                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl font-bold text-foreground">{patient.fullName}</h1>
                                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
                                    {genderLabel} • {age} tuổi
                                </span>
                                {renderHeaderOutcomeBadge(patient.treatmentOutcome)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Ngày sinh: {formatDateVN(patient.dateOfBirth)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDischargeOpen(true)}
                            className="border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                        >
                            <LogOut className="w-4 h-4 mr-1.5" /> Xuất viện
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsUpdateOpen(true)}
                        >
                            <Edit className="w-4 h-4 mr-1.5 text-blue-600" /> Chỉnh sửa
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash className="w-4 h-4 mr-1.5" /> Xóa
                        </Button>
                    </div>
                </div>

                {/* Metadata Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 text-sm">
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 px-3.5 py-2 rounded-lg border border-border">
                        <span className="text-muted-foreground">Mã bệnh án:</span>
                        <span className="font-semibold text-foreground font-mono">
                            {patient.medicalRecordCode}
                        </span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(patient.medicalRecordCode, "Mã BA")}
                            title="Sao chép mã bệnh án"
                            className="text-muted-foreground hover:text-primary ml-auto sm:ml-1 transition-colors"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 px-3.5 py-2 rounded-lg border border-border">
                        <span className="text-muted-foreground">Thẻ BHYT:</span>
                        <span className="font-semibold text-foreground font-mono">
                            {patient.healthInsuranceCard}
                        </span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(patient.healthInsuranceCard, "Số BHYT")}
                            title="Sao chép số thẻ BHYT"
                            className="text-muted-foreground hover:text-primary ml-auto sm:ml-1 transition-colors"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 px-3.5 py-2 rounded-lg border border-border">
                        <span className="text-muted-foreground">Nhập viện:</span>
                        <span className="font-semibold text-foreground">
                            {formatDateTimeVN(patient.admission)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 px-3.5 py-2 rounded-lg border border-border">
                        <span className="text-muted-foreground">Xuất viện:</span>
                        <span className="font-semibold text-foreground">
                            {formatDateTimeVN(patient.discharge)}
                        </span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Chỉ số sinh trắc
                        </h2>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="p-3 rounded-lg bg-muted/40 border border-border">
                                <div className="text-xs text-muted-foreground">Chiều cao</div>
                                <div className="text-xl font-bold text-foreground mt-0.5">
                                    {patient.height}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">cm</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/40 border border-border">
                                <div className="text-xs text-muted-foreground">Cân nặng</div>
                                <div className="text-xl font-bold text-foreground mt-0.5">
                                    {patient.weight}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">kg</span>
                                </div>
                            </div>
                        </div>
                        <div className={cn("flex items-center justify-between p-3 rounded-lg border", bmi.color)}>
                            <div>
                                <div className="text-xs opacity-80">Chỉ số BMI</div>
                                <div className="text-lg font-bold">
                                    {bmi.value} <span className="text-xs font-normal">kg/m²</span>
                                </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/50">
                                {bmi.label}
                            </span>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Thông tin liên hệ
                        </h2>
                        <dl className="space-y-3.5 text-sm">
                            <div className="flex items-center justify-between">
                                <dt className="text-muted-foreground">Điện thoại</dt>
                                <dd>
                                    <a
                                        href={`tel:${patient.phoneNumber}`}
                                        className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline font-mono"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        {patient.phoneNumber}
                                    </a>
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-muted-foreground shrink-0">Địa chỉ</dt>
                                <dd className="font-medium text-foreground text-right">
                                    {patient.address}, {patient.city}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Người thân liên hệ
                                </h2>
                                <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                    {patient.nextOfKins.length}
                                </span>
                            </div>

                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={openAddKin}
                                className="h-7 px-2.5 text-xs gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Thêm
                            </Button>
                        </div>

                        {patient.nextOfKins.length === 0 ? (
                            <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                                Chưa có thông tin người thân liên hệ.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {patient.nextOfKins.map((kin) => (
                                    <div
                                        key={kin.id}
                                        className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between gap-2"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="font-semibold text-sm text-foreground truncate">
                                                    {kin.fullName}
                                                </span>
                                                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                                                    {kin.relationship}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                                                {kin.phoneNumber}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <a
                                                href={`tel:${kin.phoneNumber}`}
                                                title={`Gọi cho ${kin.fullName}`}
                                                className="p-1.5 rounded-md bg-background border border-border text-emerald-600 hover:bg-emerald-500/10 transition"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                            </a>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditKin(kin)}
                                                title="Chỉnh sửa"
                                                className="h-7 w-7 text-blue-600 hover:bg-accent"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setKinToDelete(kin)}
                                                title="Xóa"
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8 bg-card rounded-xl border border-border shadow-sm p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Lịch sử & Kế hoạch điều trị
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Sắp xếp theo thời gian cập nhật gần nhất
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="inline-flex p-1 bg-muted rounded-lg text-xs font-medium self-start border border-border">
                            <button
                                type="button"
                                onClick={() => setPlanFilter("ALL")}
                                className={cn(
                                    "px-3 py-1.5 rounded-md transition",
                                    planFilter === "ALL"
                                        ? "bg-background text-foreground shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Tất cả ({sortedPlans.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlanFilter("IN_PROGRESS")}
                                className={cn(
                                    "px-3 py-1.5 rounded-md transition",
                                    planFilter === "IN_PROGRESS"
                                        ? "bg-background text-foreground shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Đang tiến hành ({inProgressCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlanFilter("NOT_ADHERE")}
                                className={cn(
                                    "px-3 py-1.5 rounded-md transition",
                                    planFilter === "NOT_ADHERE"
                                        ? "bg-background text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Không tuân thủ ({notAdhereCount})
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {filteredPlans.length === 0 ? (
                            <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                                Không có kế hoạch điều trị nào phù hợp với bộ lọc hiện tại.
                            </div>
                        ) : (
                            filteredPlans.map((plan) => {
                                const isInProgress = plan.treatmentPlanStatus === 0;

                                return (
                                    <div
                                        key={plan.id}
                                        className={cn(
                                            "p-4 rounded-xl border transition",
                                            isInProgress
                                                ? "border-blue-500/40 bg-blue-500/[0.03] shadow-xs"
                                                : "border-border bg-card opacity-85 hover:opacity-100"
                                        )}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {isInProgress ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                                        Đang tiến hành
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground border border-border">
                                                        Đã đóng
                                                    </span>
                                                )}

                                                {renderAdherenceBadge(plan.adherenceState)}

                                                {isHeadDepartmentDoctor && plan.adherenceState==="NotAdhere" && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setReviewingPlan(plan)}
                                                        className="h-7 px-2.5 text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                                                    >
                                                        <Edit/>
                                                    </Button>
                                                )}
                                            </div>

                                            <span
                                                className="text-xs font-mono text-muted-foreground"
                                                title={plan.id}
                                            >
                                                ID: #{plan.id.slice(0, 8)}
                                            </span>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>
                                                    Cập nhật lúc:{" "}
                                                    <strong className="text-foreground font-medium">
                                                        {formatDateTimeVN(plan.updatedAt)}
                                                    </strong>
                                                </span>
                                            </div>

                                            {/* Actions cho từng Treatment Plan */}
                                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                                {isInProgress && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setClosingPlanId(plan.id)}
                                                        className="h-7 px-2.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                                                    >
                                                        Đóng phác đồ
                                                    </Button>
                                                )}

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDetailPlanId(plan.id)}
                                                    className="h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 font-semibold"
                                                >
                                                    Xem chi tiết phác đồ →
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* 1. Update Patient Modal */}
            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent className="sm:max-w-2xl border-border bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cập Nhật Hồ Sơ Bệnh Nhân</DialogTitle>
                    </DialogHeader>
                    {isUpdateOpen && (
                        <PatientForm
                            initialData={patient}
                            onSubmit={handleUpdateSubmit}
                            onCancel={() => setIsUpdateOpen(false)}
                            isPending={updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* 2. Discharge Patient Modal */}
            <DischargePatientDialog
                open={isDischargeOpen}
                onOpenChange={setIsDischargeOpen}
                patientName={patient.fullName}
                currentOutcome={patient.treatmentOutcome}
                onConfirm={handleDischargeConfirm}
                isPending={dischargeMutation.isPending}
            />

            {/* 3. Delete Patient Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="border-border bg-popover text-popover-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive font-semibold">
                            Xác nhận xóa bệnh nhân
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân{" "}
                            <span className="font-bold text-foreground">&quot;{patient.fullName}&quot;</span>{" "}
                            không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            {tCommon("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeletePatient}
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

            {/* 4. Add / Edit Next of Kin Modal */}
            <NextOfKinFormDialog
                open={kinModalOpen}
                onOpenChange={(open) => {
                    setKinModalOpen(open);
                    if (!open) setEditingKin(null);
                }}
                initialData={editingKin}
                existingKins={patient.nextOfKins}
                onSubmit={handleKinSubmit}
                isPending={addKinMutation.isPending || updateKinMutation.isPending}
            />

            {/* 5. Delete Next of Kin Alert */}
            <AlertDialog
                open={!!kinToDelete}
                onOpenChange={(open) => !open && setKinToDelete(null)}
            >
                <AlertDialogContent className="border-border bg-popover text-popover-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive font-semibold">
                            Xác nhận xóa người thân
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Bạn có chắc chắn muốn xóa thông tin liên hệ của{" "}
                            <span className="font-bold text-foreground">&quot;{kinToDelete?.fullName}&quot;</span>{" "}
                            không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setKinToDelete(null)}>
                            {tCommon("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteKin}
                            disabled={deleteKinMutation.isPending}
                        >
                            {deleteKinMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {tCommon("delete")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 6. Close Treatment Plan Modal */}
            <CloseTreatmentPlanDialog
                open={!!closingPlanId}
                onOpenChange={(open) => !open && setClosingPlanId(null)}
                planId={closingPlanId}
                onConfirm={handleClosePlan}
                isPending={closePlanMutation.isPending}
            />

            {/* 7. Review Treatment Plan Modal (HeadDepartmentDoctor) */}
            <ReviewTreatmentPlanDialog
                open={!!reviewingPlan}
                onOpenChange={(open) => !open && setReviewingPlan(null)}
                planId={reviewingPlan?.id ?? null}
                currentAdherence={reviewingPlan?.adherenceState}
                onConfirm={handleReviewPlan}
                isPending={reviewPlanMutation.isPending}
            />

            {/* 8. Treatment Plan Detail Modal */}
            <TreatmentPlanDetailDialog
                planId={detailPlanId}
                onClose={() => setDetailPlanId(null)}
            />
        </div>
    );
}