"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { type AdherenceState } from "../types";

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

    const selectedState =
        selectedStateOverride ??
        (currentAdherence === "NotAdhereValid" || currentAdherence === "NotAdhereInvalid"
            ? currentAdherence
            : "NotAdhereValid");

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setSelectedStateOverride(null);
        onOpenChange(nextOpen);
    };

    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setSelectedStateOverride(null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>Đánh giá tuân thủ phác đồ</DialogTitle>
                    <DialogDescription>
                        Phân loại mức độ hợp lệ cho điều trị{" "}
                        <span className="font-mono font-semibold text-foreground">
                            #{planId?.slice(0, 8)}
                        </span>
                        .
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
                                <RadioGroupItem
                                    value={opt.value}
                                    id={`review-${opt.value}`}
                                    className="mt-0.5"
                                />
                                <Label
                                    htmlFor={`review-${opt.value}`}
                                    className="flex-1 cursor-pointer space-y-1"
                                >
                                    <div className="font-medium text-sm text-foreground">
                                        {opt.label}
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            if (planId) onConfirm(planId, selectedState);
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