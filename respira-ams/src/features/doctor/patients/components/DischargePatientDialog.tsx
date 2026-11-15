"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";
import { type TreatmentOutcome } from "../types";

interface DischargePatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientName: string;
    currentOutcome?: TreatmentOutcome;
    onConfirm: (outcome: TreatmentOutcome) => void;
    isPending?: boolean;
}

const OUTCOME_OPTIONS: { value: TreatmentOutcome; label: string; description: string }[] = [
    // { value: "InTreatment", label: "Đang điều trị", description: "Tiếp tục theo dõi điều trị" },
    { value: "Recovered", label: "Khỏi bệnh", description: "Bệnh nhân hồi phục và xuất viện" },
    { value: "Death", label: "Tử vong", description: "Bệnh nhân tử vong trong quá trình điều trị" },
    { value: "OutOfScope", label: "Ngoài phạm vi", description: "Chuyển cơ sở y tế khác hoặc ngừng theo dõi" },
];

export function DischargePatientDialog({
    open,
    onOpenChange,
    patientName,
    currentOutcome,
    onConfirm,
    isPending,
}: DischargePatientDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {open && (
                <DischargePatientDialogContent
                    patientName={patientName}
                    currentOutcome={currentOutcome}
                    onOpenChange={onOpenChange}
                    onConfirm={onConfirm}
                    isPending={isPending}
                />
            )}
        </Dialog>
    );
}

function DischargePatientDialogContent({
    patientName,
    currentOutcome,
    onOpenChange,
    onConfirm,
    isPending,
}: Omit<DischargePatientDialogProps, "open">) {
    const [outcome, setOutcome] = useState<TreatmentOutcome>(
        currentOutcome && currentOutcome !== "InTreatment" ? currentOutcome : "Recovered"
    );

    return (
        <DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
            <DialogHeader>
                <DialogTitle>Cập nhật Xuất viện</DialogTitle>
                <DialogDescription>
                    Chọn kết quả cho bệnh nhân <span className="font-semibold text-foreground">{patientName}</span>.
                </DialogDescription>
            </DialogHeader>

            <div className="py-2">
                <RadioGroup
                    value={outcome}
                    onValueChange={(val) => setOutcome(val as TreatmentOutcome)}
                    className="space-y-2.5"
                    disabled={isPending}
                >
                    {OUTCOME_OPTIONS.map((opt) => (
                        <div
                            key={opt.value}
                            className={cn(
                                "flex items-start space-x-3 rounded-lg border p-3 transition-colors",
                                outcome === opt.value ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                            )}
                        >
                            <RadioGroupItem value={opt.value} id={`outcome-${opt.value}`} className="mt-0.5" />
                            <Label htmlFor={`outcome-${opt.value}`} className="flex-1 cursor-pointer space-y-1">
                                <div className="font-medium text-sm text-foreground">{opt.label}</div>
                                {/* <div className="text-xs text-muted-foreground font-normal">{opt.description}</div> */}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                    Hủy
                </Button>
                <Button
                    type="button"
                    onClick={() => onConfirm(outcome)}
                    disabled={isPending}
                    className="bg-primary text-primary-foreground"
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Xác nhận
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}