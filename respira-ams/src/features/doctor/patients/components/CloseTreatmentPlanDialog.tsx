"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { closeTreatmentPlan } from "@/features/doctor/patients/api";

interface CloseTreatmentPlanDialogProps {
	planId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function CloseTreatmentPlanDialog({
	planId,
	open,
	onOpenChange,
	onSuccess,
}: CloseTreatmentPlanDialogProps) {
	const t = useTranslations("doctor.patients");
	const [reason, setReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setReason("");
			setError(null);
		}
	}, [open]);

	if (!planId) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const trimmedReason = reason.trim();
		if (!trimmedReason) {
			setError(t("closeReasonRequired", { defaultMessage: "Vui lòng nhập lý do đóng phác đồ." }));
			return;
		}

		setIsSubmitting(true);
		try {
			await closeTreatmentPlan(planId, trimmedReason);
			onOpenChange(false);
			onSuccess?.();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "";
			let friendly = "Không thể đóng phác đồ điều trị.";
			if (msg.includes("already closed")) {
				friendly = "Phác đồ điều trị này đã được đóng trước đó.";
			} else if (msg.includes("not found")) {
				friendly = "Không tìm thấy thông tin phác đồ điều trị.";
			} else if (msg) {
				friendly = msg;
			}
			setError(friendly);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[460px] rounded-[18px] bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
				<DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
							<AlertCircle className="w-5 h-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
								{t("closePlanTitle", { defaultMessage: "Đóng phác đồ điều trị" })}
							</DialogTitle>
							<DialogDescription className="text-xs text-slate-400 mt-0.5">
								{t("closePlanSubtitle", {
									defaultMessage: "Xác nhận kết thúc và ghi nhận lý do đóng phác đồ này",
								})}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 pt-2">
					{error && (
						<div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs">
							{error}
						</div>
					)}

					<div className="space-y-1.5">
						<Label htmlFor="closeReason" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							{t("closeReasonLabel", { defaultMessage: "Lý do đóng phác đồ" })}{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Textarea
							id="closeReason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder={t("closeReasonPlaceholder", {
								defaultMessage: "VD: Bệnh nhân đã khỏi bệnh, chuyển phác đồ khác, v.v.",
							})}
							rows={4}
							className="text-xs leading-relaxed"
							disabled={isSubmitting}
							autoFocus
						/>
					</div>

					<DialogFooter className="pt-3 gap-2 border-t border-slate-100 dark:border-slate-800">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="h-9 px-4 text-xs font-semibold"
						>
							{t("btnCancel", { defaultMessage: "Hủy" })}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-9 px-5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
									{t("btnSubmitting", { defaultMessage: "Đang xử lý..." })}
								</>
							) : (
								t("btnClosePlanConfirm", { defaultMessage: "Đóng phác đồ" })
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

