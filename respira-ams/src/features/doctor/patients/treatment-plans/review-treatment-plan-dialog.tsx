"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

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

type ReviewableAdherenceState = Extract<
	AdherenceState,
	"NotAdhereValid" | "NotAdhereInvalid"
>;

const REVIEW_STATE_VALUES: ReviewableAdherenceState[] = [
	"NotAdhereValid",
	"NotAdhereInvalid",
];

export function ReviewTreatmentPlanDialog({
	open,
	onOpenChange,
	planId,
	currentAdherence,
	onConfirm,
	isPending,
}: ReviewTreatmentPlanDialogProps) {
	const t = useTranslations("doctor.patients.treatmentPlan.reviewDialog");
	const tCommon = useTranslations("common");

	const [selectedStateOverride, setSelectedStateOverride] =
		useState<AdherenceState | null>(null);

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

				<div className="py-2">
					<RadioGroup
						value={selectedState}
						onValueChange={(val) =>
							setSelectedStateOverride(val as AdherenceState)
						}
						className="space-y-2.5"
						disabled={isPending}
					>
						{REVIEW_STATE_VALUES.map((val) => {
							const isSelected = selectedState === val;
							return (
								<div
									key={val}
									className={cn(
										"flex items-start space-x-3 rounded-lg border p-3 transition-colors",
										isSelected
											? "border-primary bg-primary/10 dark:bg-primary/15"
											: "border-border bg-muted/30 hover:bg-muted/50"
									)}
								>
									<RadioGroupItem
										value={val}
										id={`review-${val}`}
										className="mt-0.5"
									/>
									<Label
										htmlFor={`review-${val}`}
										className="flex-1 cursor-pointer space-y-1"
									>
										<div className="font-medium text-sm text-foreground">
											{t(`options.${val}.label`)}
										</div>
										{/* <div className="text-xs text-muted-foreground font-normal">
											{t(`options.${val}.description`)}
										</div> */}
									</Label>
								</div>
							);
						})}
					</RadioGroup>
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
						type="button"
						onClick={() => {
							if (planId) onConfirm(planId, selectedState);
						}}
						disabled={isPending}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t("confirmButton")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}