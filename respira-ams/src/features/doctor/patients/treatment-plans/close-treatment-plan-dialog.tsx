"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setReason("");
            setError("");
        }
    }

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
                        Kế hoạch{" "}
                        <span className="font-mono font-semibold text-foreground">
                            #{planId?.slice(0, 8)}
                        </span>{" "}
                        sẽ chuyển sang trạng thái đã đóng và không thể hoàn tác.
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
                            onClick={() => handleOpenChange(false)}
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