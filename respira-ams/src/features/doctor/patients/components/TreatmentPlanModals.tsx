"use client";

import { useState, useMemo } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    Loader2,
    Pill,
    ShieldAlert,
    Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";
import { useTreatmentPlanDetail } from "../queries";
import {
    type AdherenceState,
    type ParsedDiagnosis,
    type PlanMedicineItem,
} from "../types";

interface CloseTreatmentPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planId: string | null;
    onConfirm: (planId: string, reason: string) => void;
    isPending?: boolean;
}

export function CloseTreatmentPlanDialog({
    open,
    onOpenChange,
    planId,
    onConfirm,
    isPending,
}: CloseTreatmentPlanDialogProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setReason("");
            setError("");
        }
        onOpenChange(nextOpen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError("Vui lòng nhập lý do đóng kế hoạch điều trị.");
            return;
        }
        if (planId) {
            onConfirm(planId, reason.trim());
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>Đóng kế hoạch điều trị</DialogTitle>
                    <DialogDescription>
                        Kế hoạch <span className="font-mono font-semibold text-foreground">#{planId?.slice(0, 8)}</span> sẽ chuyển sang trạng thái đã đóng và không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>
                            Lý do đóng phác đồ <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="Nhập lý do kết thúc / thay đổi phác đồ điều trị..."
                            rows={3}
                            disabled={isPending}
                        />
                        {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" variant="destructive" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xác nhận đóng
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ReviewTreatmentPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planId: string | null;
    currentAdherence?: AdherenceState;
    onConfirm: (planId: string, adherenceState: AdherenceState) => void;
    isPending?: boolean;
}

const REVIEW_OPTIONS: { value: AdherenceState; label: string; description: string }[] = [
    {
        value: "NotAdhereValid",
        label: "Không tuân thủ hợp lệ",
        description: "Bác sĩ chỉ định khác phác đồ nhưng có lý do hợp lý.",
    },
    {
        value: "NotAdhereInvalid",
        label: "Không tuân thủ không hợp lệ",
        description: "Bác sĩ chỉ định khác phác đồ có lý do không hợp lý.",
    },
];

export function ReviewTreatmentPlanDialog({
    open,
    onOpenChange,
    planId,
    currentAdherence,
    onConfirm,
    isPending,
}: ReviewTreatmentPlanDialogProps) {
    const [selectedStateOverride, setSelectedStateOverride] = useState<AdherenceState | null>(null);
    const selectedState = selectedStateOverride ??
        (currentAdherence === "NotAdhereValid" || currentAdherence === "NotAdhereInvalid"
            ? currentAdherence
            : "NotAdhereValid");

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setSelectedStateOverride(null);
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>Đánh giá tuân thủ phác đồ</DialogTitle>
                    <DialogDescription>
                        Phân loại mức độ hợp lệ cho điều trị {" "}
                        <span className="font-mono font-semibold text-foreground">#{planId?.slice(0, 8)}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <RadioGroup
                        value={selectedState}
                        onValueChange={(val) => setSelectedStateOverride(val as AdherenceState)}
                        className="space-y-2.5"
                        disabled={isPending}
                    >
                        {REVIEW_OPTIONS.map((opt) => (
                            <div
                                key={opt.value}
                                className={cn(
                                    "flex items-start space-x-3 rounded-lg border p-3 transition-colors",
                                    selectedState === opt.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-muted/30"
                                )}
                            >
                                <RadioGroupItem value={opt.value} id={`review-${opt.value}`} className="mt-0.5" />
                                <Label htmlFor={`review-${opt.value}`} className="flex-1 cursor-pointer space-y-1">
                                    <div className="font-medium text-sm text-foreground">{opt.label}</div>
                                    {/* <div className="text-xs text-muted-foreground font-normal">{opt.description}</div> */}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            if (planId) onConfirm(planId, selectedState);
                            setSelectedStateOverride(null);
                        }}
                        disabled={isPending}
                        className="bg-primary"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu đánh giá
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function renderAwareBadge(classification: string) {
    switch (classification) {
        case "Access":
            return (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Access
                </span>
            );
        case "Watch":
            return (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    Watch
                </span>
            );
        case "Reserve":
            return (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                    Reserve
                </span>
            );
        default:
            return (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {classification}
                </span>
            );
    }
}

function translateSeverity(severity: string) {
    switch (severity) {
        case "Mild":
            return "Nhẹ";
        case "Moderate":
            return "Trung bình";
        case "Severe":
            return "Nặng";
        default:
            return severity;
    }
}

function translateSite(site: string) {
    switch (site) {
        case "Outpatient":
            return "Ngoại trú";
        case "Inpatient":
            return "Nội trú";
        case "ICU":
            return "Hồi sức tích cực";
        default:
            return site;
    }
}

interface TreatmentPlanDetailDialogProps {
    planId: string | null;
    onClose: () => void;
}

export function TreatmentPlanDetailDialog({ planId, onClose }: TreatmentPlanDetailDialogProps) {
    const { data: plan, isLoading } = useTreatmentPlanDetail(planId);

    const parsedDiagnosis = useMemo<ParsedDiagnosis | null>(() => {
        if (!plan?.diagnosis) return null;
        try {
            return JSON.parse(plan.diagnosis) as ParsedDiagnosis;
        } catch {
            return null;
        }
    }, [plan]);

    return (
        <Dialog open={!!planId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl border-border bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-primary" />
                        Chi tiết Kế hoạch điều trị
                        {plan && (
                            <span className="text-xs font-mono font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                #{plan.id.slice(0, 8)}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : !plan ? (
                    <div className="text-center py-10 text-destructive">
                        Không thể tải dữ liệu chi tiết kế hoạch điều trị.
                    </div>
                ) : (
                    <div className="space-y-5 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Pill className="w-4 h-4 text-primary" /> Kháng sinh đã chỉ định
                                </h4>
                                {plan.medicines.length === 0 ? (
                                    <p className="text-muted-foreground text-xs italic">Không có kháng sinh được chỉ định.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {plan.medicines.map((med: PlanMedicineItem) => (
                                            <div
                                                key={med.id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40"
                                            >
                                                <span className="font-semibold text-foreground">{med.name}</span>
                                                {renderAwareBadge(med.classification)}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {plan.reasonForMedicineChoice && (
                                    <div className="pt-2 border-t border-border">
                                        <span className="text-xs text-muted-foreground block">Lý do lựa chọn thuốc:</span>
                                        <p className="font-medium text-foreground mt-0.5">{plan.reasonForMedicineChoice}</p>
                                    </div>
                                )}

                                {plan.status === 1 && plan.closeReason && (
                                    <div className="pt-2 border-t border-border">
                                        <span className="text-xs text-muted-foreground block">Lý do đóng phác đồ: </span>
                                        <p className="font-medium text-foreground mt-0.5">{plan.closeReason}</p>
                                    </div>
                                )}
                            </div>

                            {parsedDiagnosis && (
                                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Stethoscope className="w-4 h-4 text-primary" /> Phân loại
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                                            <span className="text-xs text-muted-foreground block">Mức độ nặng</span>
                                            <span className="font-bold text-foreground">
                                                {translateSeverity(parsedDiagnosis.severity)}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                                            <span className="text-xs text-muted-foreground block">Nơi điều trị</span>
                                            <span className="font-bold text-foreground">
                                                {translateSite(parsedDiagnosis.treatmentSite)}
                                            </span>
                                        </div>
                                    </div>

                                    {parsedDiagnosis.allergy?.type === "Yes" &&
                                        parsedDiagnosis.allergy.allergicAntibiotics.length > 0 && (
                                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
                                                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                                <div className="text-xs">
                                                    <span className="font-semibold text-rose-700 dark:text-rose-400">
                                                        Dị ứng kháng sinh:{" "}
                                                    </span>
                                                    <span className="text-foreground font-medium">
                                                        {parsedDiagnosis.allergy.allergicAntibiotics
                                                            .map((a) => a.name)
                                                            .join(", ")}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {parsedDiagnosis.otherInfections?.length > 0 && (
                                        <div className="text-xs">
                                            <span className="text-muted-foreground block mb-1">Nhiễm trùng kèm theo:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {parsedDiagnosis.otherInfections.map((inf) => (
                                                    <Badge key={inf} variant="secondary" className="text-[11px]">
                                                        {inf}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {parsedDiagnosis && (
                            <>
                                {parsedDiagnosis.metricsSeverityDiagnosis?.length > 0 && (
                                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <ClipboardCheck className="w-4 h-4 text-primary" /> Thang điểm đánh giá mức độ nặng
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {parsedDiagnosis.metricsSeverityDiagnosis.map((metric) => {
                                                const totalScore = metric.evidences.reduce(
                                                    (acc, ev) => acc + (ev.score || 0),
                                                    0
                                                );
                                                const matchedCriteria = metric.evidences.filter(
                                                    (ev) => ev.evaluatedValue === true
                                                );

                                                return (
                                                    <div
                                                        key={metric.code}
                                                        className="p-3 rounded-lg border border-border bg-muted/30 space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-foreground">{metric.code}</span>
                                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                                                                {totalScore} điểm
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Kết luận: <strong className="text-foreground">{translateSeverity(metric.severity)}</strong>
                                                        </div>
                                                        {matchedCriteria.length > 0 && (
                                                            <ul className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border">
                                                                {matchedCriteria.map((c, i) => (
                                                                    <li key={i} className="flex items-start gap-1">
                                                                        <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                                                        <span>{c.source.replace(/^.*?- /, "")}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Tác nhân gây bệnh nghi ngờ
                                    </h4>
                                    {parsedDiagnosis.heavySuspected?.length > 0 && (
                                        <div className="space-y-1.5">
                                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Nguy cơ cao:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {parsedDiagnosis.heavySuspected.map((p) => (
                                                    <span
                                                        key={p.id}
                                                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                                                    >
                                                        {p.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {parsedDiagnosis.worthSuspected?.length > 0 && (
                                        <div className="space-y-1.5 pt-2">
                                            <span className="text-xs font-medium text-muted-foreground block">
                                                Tác nhân nghi ngờ khác (Worth Suspected):
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {parsedDiagnosis.worthSuspected.map((p) => (
                                                    <Badge key={p.id} variant="outline" className="font-normal text-xs">
                                                        {p.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {parsedDiagnosis.protocols?.length > 0 && (
                                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Phác đồ hệ thống khuyến cáo ({parsedDiagnosis.protocols.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {parsedDiagnosis.protocols.map((proto, idx) => (
                                                <div
                                                    key={proto.id}
                                                    className="p-3 rounded-lg border border-border bg-muted/20 space-y-2"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className="font-semibold text-xs text-foreground">
                                                            Nhóm phác đồ #{idx + 1} • {translateSeverity(proto.severity)} ({translateSite(proto.treatmentSite)})
                                                        </span>
                                                        {proto.criteria.length > 0 && (
                                                            <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                                                Tiêu chí: {proto.criteria.map((c) => c.name).join("; ")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {proto.medicines.map((combo, cIdx) => (
                                                            <span
                                                                key={cIdx}
                                                                className="inline-flex items-center px-2 py-1 rounded bg-background border border-border text-xs font-medium"
                                                            >
                                                                {combo.map((m) => m.name).join(" + ")}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}