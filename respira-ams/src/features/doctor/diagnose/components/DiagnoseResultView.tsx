"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    AWARE_LABELS,
    type AwareClassification,
    type DiagnoseAntibioticDto,
    type DiagnosisResultDto,
    INFECTION_TYPES,
} from "../types";
import { diagnoseApi } from "../api";
import {
    formatSeverityLabel,
    formatTreatmentSiteLabel,
    getSampleTypeLabel,
} from "../validation";

interface DiagnoseResultViewProps {
    patientId: string;
    diagnosis: DiagnosisResultDto;
    allAntibiotics: DiagnoseAntibioticDto[];
    onResetDiagnosis: () => void;
}

const AWARE_BADGE_STYLES: Record<AwareClassification, string> = {
    Access: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    AccessWatch: "bg-teal-100 text-teal-800 hover:bg-teal-100",
    Watch: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    Reserve: "bg-red-100 text-red-800 hover:bg-red-100",
    Others: "bg-sky-100 text-sky-800 hover:bg-sky-100",
    Unclassified: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

export function DiagnoseResultView({
    patientId,
    diagnosis,
    allAntibiotics,
    onResetDiagnosis,
}: DiagnoseResultViewProps) {
    const router = useRouter();

    const [selectedProtocolKey, setSelectedProtocolKey] = useState<string | null>(null);
    const [selectedProtocolMedicineIds, setSelectedProtocolMedicineIds] = useState<string[]>([]);

    const [customSearch, setCustomSearch] = useState("");
    const [customMedicineIds, setCustomMedicineIds] = useState<Set<string>>(new Set());
    const [customReason, setCustomReason] = useState("");
    const [customError, setCustomError] = useState<string | null>(null);

    const [showGroupWarningModal, setShowGroupWarningModal] = useState(false);

    const [showWorthSuspected, setShowWorthSuspected] = useState(false);
    const [showEvidences, setShowEvidences] = useState(false);
    const [showMicrobial, setShowMicrobial] = useState(false);

    const [isConfirming, setIsConfirming] = useState(false);

    const filteredCustomAntibiotics = useMemo(() => {
        const q = customSearch.trim().toLowerCase();
        if (!q) return allAntibiotics;
        return allAntibiotics.filter(
            (ab) =>
                ab.name.toLowerCase().includes(q) ||
                ab.antibioticGroupName.toLowerCase().includes(q) ||
                ab.classification.toLowerCase().includes(q)
        );
    }, [allAntibiotics, customSearch]);

    const selectedCustomAntibiotics = useMemo(
        () => allAntibiotics.filter((ab) => customMedicineIds.has(ab.id)),
        [allAntibiotics, customMedicineIds]
    );

    const hasReserveSelected = useMemo(
        () => selectedCustomAntibiotics.some((ab) => ab.classification === "Reserve"),
        [selectedCustomAntibiotics]
    );

    const executeConfirmTreatment = async (medicineIds: string[], reason: string | null) => {
        setIsConfirming(true);
        setCustomError(null);
        try {
            await diagnoseApi.confirmTreatment({
                patientId,
                diagnosis,
                medicines: medicineIds,
                reasonForMedicineChoice: reason,
            });

            router.push(`/doctor/patients/${patientId}`);
            router.refresh();
        } catch (err) {
            setCustomError(err instanceof Error ? err.message : "Xác nhận phác đồ thất bại.");
            setIsConfirming(false);
        }
    };

    const handleConfirmProtocol = async () => {
        if (selectedProtocolMedicineIds.length === 0) return;
        await executeConfirmTreatment(selectedProtocolMedicineIds, null);
    };

    const handleConfirmCustom = async () => {
        const ids = Array.from(customMedicineIds);
        if (ids.length === 0) {
            setCustomError("Vui lòng chọn ít nhất một kháng sinh.");
            return;
        }
        if (!customReason.trim()) {
            setCustomError("Bắt buộc nhập lý do khi bác sĩ tự chọn phác đồ kháng sinh.");
            return;
        }

        setIsConfirming(true);
        setCustomError(null);
        try {
            const warnRes = await diagnoseApi.warnAntibioticCombination(ids);
            if (warnRes.needWarning) {
                setIsConfirming(false);
                setShowGroupWarningModal(true);
                return;
            }
            await executeConfirmTreatment(ids, customReason.trim());
        } catch (err) {
            setIsConfirming(false);
            setCustomError(
                err instanceof Error
                    ? err.message
                    : "Không thể kiểm tra cảnh báo phối hợp kháng sinh."
            );
        }
    };

    const severityBadgeColor =
        diagnosis.severity === "Severe"
            ? "bg-red-100 text-red-800 hover:bg-red-100"
            : diagnosis.severity === "Moderate"
              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";

    return (
        <div className="space-y-4">
            <Tabs defaultValue="protocol" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="protocol">Theo phác đồ khuyến cáo</TabsTrigger>
                    <TabsTrigger value="custom">Bác sĩ tự chọn kháng sinh</TabsTrigger>
                </TabsList>

                <TabsContent value="protocol" className="mt-4 space-y-4">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                        <h3 className="border-b border-border pb-2.5 text-base font-bold">
                            Kết quả phân tầng mức độ nặng & nơi điều trị
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3.5">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">
                                    Mức độ nặng
                                </span>
                                <Badge className={severityBadgeColor}>
                                    {formatSeverityLabel(diagnosis.severity)}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3.5">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">
                                    Nơi điều trị
                                </span>
                                <Badge variant="secondary">
                                    {formatTreatmentSiteLabel(diagnosis.treatmentSite)}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3.5">
                                <span className="text-xs font-semibold uppercase text-muted-foreground">
                                    eGFR (mL/phút/1.73m²)
                                </span>
                                <span className="text-sm font-bold">
                                    {diagnosis.egfr !== undefined && diagnosis.egfr !== null
                                        ? Number(diagnosis.egfr).toFixed(2)
                                        : "—"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            <div
                                className={cn(
                                    "rounded-lg border p-3 text-xs",
                                    diagnosis.isPatientPregnantOrInLactationPhase
                                        ? "border-destructive/50 bg-destructive/10 text-destructive"
                                        : "border-border bg-muted/20"
                                )}
                            >
                                <div className="font-bold uppercase text-[11px]">
                                    Thai kỳ / Cho con bú
                                </div>
                                <div className="mt-0.5 font-medium">
                                    {diagnosis.isPatientPregnantOrInLactationPhase
                                        ? "Có (Lưu ý chống chỉ định)"
                                        : "Không"}
                                </div>
                            </div>

                            <div
                                className={cn(
                                    "rounded-lg border p-3 text-xs",
                                    diagnosis.allergy?.type !== "No"
                                        ? "border-amber-300 bg-amber-50 text-amber-900"
                                        : "border-border bg-muted/20"
                                )}
                            >
                                <div className="font-bold uppercase text-[11px]">
                                    Dị ứng kháng sinh
                                </div>
                                <div className="mt-0.5 font-medium">
                                    {diagnosis.allergy?.type === "Yes"
                                        ? diagnosis.allergy.allergicAntibiotics
                                              .map((a) => a.name)
                                              .join(", ")
                                        : diagnosis.allergy?.otherAllergy || "Không dị ứng"}
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
                                <div className="font-bold uppercase text-[11px]">
                                    Nhiễm khuẩn đi kèm
                                </div>
                                <div className="mt-0.5 font-medium">
                                    {diagnosis.otherInfections?.length > 0
                                        ? diagnosis.otherInfections
                                              .map(
                                                  (code) =>
                                                      INFECTION_TYPES.find((i) => i.name === code)
                                                          ?.label || code
                                              )
                                              .join(", ")
                                        : "Không có"}
                                </div>
                            </div>
                        </div>

                        {diagnosis.metricsSeverityDiagnosis?.length > 0 && (
                            <div className="border-t border-dashed border-border pt-4 space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Chi tiết thang điểm đánh giá
                                </div>
                                {diagnosis.metricsSeverityDiagnosis.map((m) => {
                                    const totalScore = m.evidences.reduce(
                                        (sum, ev) => sum + (ev.score || 0),
                                        0
                                    );
                                    return (
                                        <div
                                            key={m.code}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3.5 py-2.5 text-xs"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">{m.code}</span>
                                                <Badge variant="secondary">
                                                    {formatSeverityLabel(m.severity)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 font-semibold text-muted-foreground">
                                                <span>Tổng điểm: {totalScore}</span>
                                                <span>•</span>
                                                <span>
                                                    {formatTreatmentSiteLabel(m.treatmentSite)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {diagnosis.missingVariables?.length > 0 && (
                        <div className="rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-card p-5 shadow-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold">
                                    Biến lâm sàng/cận lâm sàng chưa nhập
                                </h3>
                                <Badge variant="secondary">{diagnosis.missingVariables.length}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {diagnosis.missingVariables.map((mv) => (
                                    <Badge
                                        key={mv.id}
                                        variant="outline"
                                        className="border-amber-200 bg-amber-50 text-amber-900"
                                    >
                                        {mv.name || mv.code} ({mv.code})
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                        <h3 className="text-base font-bold">Tác nhân gây bệnh nghi ngờ</h3>

                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3.5">
                            <div className="text-xs font-bold uppercase text-destructive">
                                Nguy cơ cao (Heavy suspected) (
                                {diagnosis.heavySuspected?.length || 0})
                            </div>
                            {diagnosis.heavySuspected?.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {diagnosis.heavySuspected.map((p) => (
                                        <Badge key={p.id} variant="outline" className="bg-background">
                                            {p.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Không ghi nhận yếu tố nguy cơ đặc hiệu vượt ngưỡng cảnh báo cao.
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg border border-border bg-muted/20 p-3.5">
                            <button
                                type="button"
                                onClick={() => setShowWorthSuspected((prev) => !prev)}
                                className="flex w-full items-center justify-between text-xs font-bold"
                            >
                                <span>
                                    Tác nhân cần cân nhắc (Worth suspected) (
                                    {diagnosis.worthSuspected?.length || 0})
                                </span>
                                {showWorthSuspected ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </button>
                            {showWorthSuspected && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                    {diagnosis.worthSuspected.map((p) => (
                                        <Badge key={p.id} variant="secondary">
                                            {p.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2.5">
                            <div>
                                <h3 className="text-base font-bold">
                                    Phác đồ kháng sinh khuyến cáo
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Chọn 1 phương án phối hợp hoàn chỉnh để xác nhận điều trị.
                                </p>
                            </div>
                            <Badge variant="secondary">{diagnosis.protocols?.length || 0} phác đồ</Badge>
                        </div>

                        {!diagnosis.protocols || diagnosis.protocols.length === 0 ? (
                            <p className="text-xs italic text-muted-foreground">
                                Không có phác đồ tự động phù hợp. Vui lòng chuyển sang tab &ldquo;Bác sĩ tự chọn kháng sinh&rdquo;.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {diagnosis.protocols.map((protocol, pIdx) => (
                                    <div
                                        key={protocol.id}
                                        className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-sm font-bold">
                                                {protocol.name || `Phác đồ #${pIdx + 1}`}
                                            </span>
                                            <div className="flex gap-1.5">
                                                <Badge className={severityBadgeColor}>
                                                    {formatSeverityLabel(protocol.severity)}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {formatTreatmentSiteLabel(protocol.treatmentSite)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {protocol.medicines.map((combo, cIdx) => {
                                                const optionKey = `${protocol.id}-${cIdx}`;
                                                const isSelected = selectedProtocolKey === optionKey;
                                                const comboIds = combo.map((m) => m.id);

                                                return (
                                                    <button
                                                        key={optionKey}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProtocolKey(optionKey);
                                                            setSelectedProtocolMedicineIds(comboIds);
                                                        }}
                                                        className={cn(
                                                            "w-full rounded-lg border p-3 text-left transition",
                                                            isSelected
                                                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                                : "border-border bg-background hover:border-primary/50"
                                                        )}
                                                    >
                                                        <div className="mb-1.5 flex items-center justify-between">
                                                            <span className="text-[11px] font-bold uppercase text-primary">
                                                                Lựa chọn #{cIdx + 1}
                                                            </span>
                                                            <span className="text-xs font-semibold text-primary">
                                                                {isSelected
                                                                    ? "● Đã chọn"
                                                                    : "○ Chọn phác đồ này"}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {combo.map((med, mIdx) => (
                                                                <React.Fragment key={`${med.id}-${mIdx}`}>
                                                                    {mIdx > 0 && (
                                                                        <span className="text-xs font-bold text-muted-foreground">
                                                                            +
                                                                        </span>
                                                                    )}
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold">
                                                                        {med.name}
                                                                        <Badge
                                                                            className={cn(
                                                                                "text-[10px] uppercase",
                                                                                AWARE_BADGE_STYLES[
                                                                                    med.classification
                                                                                ] ||
                                                                                    AWARE_BADGE_STYLES.Unclassified
                                                                            )}
                                                                        >
                                                                            {AWARE_LABELS[
                                                                                med.classification
                                                                            ] || med.classification}
                                                                        </Badge>
                                                                    </span>
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {customError && <p className="text-xs text-destructive">{customError}</p>}

                        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs text-muted-foreground">
                                {selectedProtocolMedicineIds.length > 0
                                    ? `Đã chọn tổ hợp gồm ${selectedProtocolMedicineIds.length} kháng sinh.`
                                    : "Chọn một lựa chọn phác đồ ở trên để xác nhận."}
                            </span>
                            <Button
                                type="button"
                                disabled={selectedProtocolMedicineIds.length === 0 || isConfirming}
                                onClick={handleConfirmProtocol}
                                className="gap-2 bg-primary"
                            >
                                {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isConfirming ? "Đang lưu phác đồ..." : "Xác nhận phác đồ đã chọn"}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2.5">
                        <h3 className="text-sm font-bold">Chi tiết lập luận hệ thống (CDSS)</h3>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowEvidences((prev) => !prev)}
                            className="w-full justify-between text-xs"
                        >
                            <span>Bằng chứng đánh giá ({diagnosis.evidences?.length || 0})</span>
                            {showEvidences ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>

                        {showEvidences && (
                            <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-dashed border-border bg-muted/20 p-3">
                                {diagnosis.evidences.map((ev, i) => (
                                    <div
                                        key={i}
                                        className="rounded-md border border-border bg-background p-3 text-xs space-y-1"
                                    >
                                        <div className="font-semibold">{ev.source}</div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
                                            <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                                                {ev.formula}
                                            </code>
                                            <span>
                                                Kết quả:{" "}
                                                <strong className="text-foreground">
                                                    {ev.evaluatedValue === undefined
                                                        ? "Thiếu dữ liệu"
                                                        : ev.evaluatedValue
                                                          ? "Đạt"
                                                          : "Không đạt"}
                                                </strong>
                                                {ev.score !== undefined && ` (+${ev.score} điểm)`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMicrobial((prev) => !prev)}
                            className="w-full justify-between text-xs"
                        >
                            <span>
                                Kết quả vi sinh ({diagnosis.microbialTestResults?.length || 0})
                            </span>
                            {showMicrobial ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>

                        {showMicrobial && (
                            <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
                                {diagnosis.microbialTestResults?.length === 0 ? (
                                    <p className="text-xs italic text-muted-foreground">
                                        Không có mẫu vi sinh.
                                    </p>
                                ) : (
                                    diagnosis.microbialTestResults.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-md border border-border bg-background p-3 text-xs font-medium"
                                        >
                                            {item.pathogen?.name} —{" "}
                                            {getSampleTypeLabel(item.sampleType)} ({item.micCategory})
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="custom" className="mt-4">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                        <div className="border-b border-border pb-3">
                            <h3 className="text-base font-bold">
                                Bác sĩ tự chọn phác đồ kháng sinh
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Bắt buộc ghi rõ lý do chỉ định. Hệ thống sẽ tự động kiểm tra cảnh báo nếu chọn nhiều thuốc cùng nhóm kháng sinh.
                            </p>
                        </div>

                        <Input
                            type="search"
                            value={customSearch}
                            onChange={(e) => setCustomSearch(e.target.value)}
                            placeholder="Tìm theo tên thuốc, nhóm kháng sinh hoặc phân loại AWaRe..."
                        />

                        <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
                            {filteredCustomAntibiotics.map((ab) => {
                                const checked = customMedicineIds.has(ab.id);
                                return (
                                    <label
                                        key={ab.id}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition",
                                            checked
                                                ? "border-primary bg-primary/10"
                                                : "border-border bg-muted/20 hover:border-primary/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => {
                                                    setCustomMedicineIds((prev) => {
                                                        const next = new Set(prev);
                                                        if (next.has(ab.id)) next.delete(ab.id);
                                                        else next.add(ab.id);
                                                        return next;
                                                    });
                                                    setCustomError(null);
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold">
                                                    {ab.name}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {ab.antibioticGroupName}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            className={cn(
                                                "shrink-0 text-[10px] uppercase",
                                                AWARE_BADGE_STYLES[ab.classification] ||
                                                    AWARE_BADGE_STYLES.Unclassified
                                            )}
                                        >
                                            {AWARE_LABELS[ab.classification] || ab.classification}
                                        </Badge>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs uppercase text-muted-foreground">
                                Kháng sinh đã chọn ({selectedCustomAntibiotics.length})
                            </Label>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedCustomAntibiotics.map((ab) => (
                                    <Badge key={ab.id} variant="secondary" className="gap-1.5 pr-1.5">
                                        {ab.name}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCustomMedicineIds((prev) => {
                                                    const next = new Set(prev);
                                                    next.delete(ab.id);
                                                    return next;
                                                })
                                            }
                                            className="hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {hasReserveSelected && (
                            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-medium text-amber-900">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                                <span>
                                    Lưu ý: Bạn đang chọn kháng sinh thuộc nhóm{" "}
                                    <strong>Reserve</strong> (kháng sinh dự trữ ưu tiên quản lý nghiêm ngặt).
                                </span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label>
                                Lý do không sử dụng phác đồ khuyến cáo{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                rows={3}
                                value={customReason}
                                onChange={(e) => {
                                    setCustomReason(e.target.value);
                                    setCustomError(null);
                                }}
                                placeholder="VD: Nghi ngờ vi khuẩn đa kháng, tiền sử thất bại điều trị trước đó..."
                            />
                        </div>

                        {customError && <p className="text-xs text-destructive">{customError}</p>}

                        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs text-muted-foreground">
                                Cần chọn ít nhất 1 kháng sinh và nhập đầy đủ lý do.
                            </span>
                            <Button
                                type="button"
                                disabled={
                                    customMedicineIds.size === 0 ||
                                    !customReason.trim() ||
                                    isConfirming
                                }
                                onClick={handleConfirmCustom}
                                className="gap-2 bg-primary"
                            >
                                {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isConfirming ? "Đang kiểm tra & lưu..." : "Xác nhận điều trị tự chọn"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* <Button
                type="button"
                variant="outline"
                onClick={onResetDiagnosis}
                disabled={isConfirming}
                className="w-full"
            >
                Chỉnh sửa dữ liệu / Thực hiện chẩn đoán mới
            </Button> */}

            <Dialog open={showGroupWarningModal} onOpenChange={setShowGroupWarningModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                            Cảnh báo phối hợp kháng sinh cùng nhóm
                        </DialogTitle>
                        <DialogDescription className="pt-1 text-foreground">
                            Các kháng sinh bạn vừa chọn có thuốc thuộc{" "}
                            <strong>cùng một nhóm kháng sinh</strong>. Việc phối hợp cùng nhóm thường không làm tăng phổ tác dụng mà có thể tăng độc tính. Bạn có chắc chắn muốn tiếp tục xác nhận không?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowGroupWarningModal(false)}
                        >
                            Hủy & chọn lại
                        </Button>
                        <Button
                            type="button"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={async () => {
                                setShowGroupWarningModal(false);
                                await executeConfirmTreatment(
                                    Array.from(customMedicineIds),
                                    customReason.trim()
                                );
                            }}
                        >
                            Vẫn tiếp tục xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}