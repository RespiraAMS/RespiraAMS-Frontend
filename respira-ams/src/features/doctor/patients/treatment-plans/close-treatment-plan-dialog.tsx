"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
	const t = useTranslations("doctor.patients.treatmentPlan.closeDialog");
	const tCommon = useTranslations("common");

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
			setError(t("reasonRequired"));
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
					<DialogTitle className="text-foreground">{t("title")}</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{t.rich("description", {
							planId: planId?.slice(0, 8) ?? "",
							mono: (chunks) => (
								<span className="font-mono font-semibold text-foreground">
									{chunks}
								</span>
							),
						})}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 text-foreground">
					<div className="space-y-1.5">
						<Label className="text-foreground">
							{t("reasonLabel")} <span className="text-destructive">*</span>
						</Label>
						<Textarea
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								if (error) setError("");
							}}
							placeholder={t("reasonPlaceholder")}
							rows={3}
							disabled={isPending}
							className="bg-background text-foreground border-input"
						/>
						{error && (
							<p className="text-xs text-destructive font-medium">{error}</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
							className="border-border text-foreground hover:bg-accent"
						>
							{tCommon("cancel")}
						</Button>
						<Button
							type="submit"
							variant="destructive"
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{t("confirmButton")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}