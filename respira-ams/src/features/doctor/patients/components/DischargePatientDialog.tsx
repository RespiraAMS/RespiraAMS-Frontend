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
import { type TreatmentOutcome } from "../types";

interface DischargePatientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	patientName: string;
	currentOutcome?: TreatmentOutcome;
	onConfirm: (outcome: TreatmentOutcome) => void;
	isPending?: boolean;
}

const DISCHARGE_OUTCOME_VALUES: Exclude<TreatmentOutcome, "InTreatment">[] = [
	"Recovered",
	"Death",
	"OutOfScope",
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
	const tDischarge = useTranslations("doctor.patients.discharge");
	const tOutcome = useTranslations("doctor.patients.outcomes");
	const tCommon = useTranslations("common");

	const [outcome, setOutcome] = useState<TreatmentOutcome>(
		currentOutcome && currentOutcome !== "InTreatment" ? currentOutcome : "Recovered"
	);

	return (
		<DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
			<DialogHeader>
				<DialogTitle className="text-foreground">{tDischarge("title")}</DialogTitle>
				<DialogDescription className="text-muted-foreground">
					{tDischarge.rich("description", {
						name: patientName,
						bold: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
					})}
				</DialogDescription>
			</DialogHeader>

			<div className="py-2">
				<RadioGroup
					value={outcome}
					onValueChange={(val) => setOutcome(val as TreatmentOutcome)}
					className="space-y-2.5"
					disabled={isPending}
				>
					{DISCHARGE_OUTCOME_VALUES.map((val) => {
						const isSelected = outcome === val;
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
								<RadioGroupItem value={val} id={`outcome-${val}`} className="mt-0.5" />
								<Label htmlFor={`outcome-${val}`} className="flex-1 cursor-pointer space-y-1">
									<div className="font-medium text-sm text-foreground">{tOutcome(val)}</div>
									{/* <div className="text-xs text-muted-foreground font-normal">
										{tDischarge(`descriptions.${val}`)}
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
					onClick={() => onOpenChange(false)}
					disabled={isPending}
					className="border-border text-foreground hover:bg-accent"
				>
					{tCommon("cancel")}
				</Button>
				<Button
					type="button"
					onClick={() => onConfirm(outcome)}
					disabled={isPending}
					className="bg-primary text-primary-foreground hover:bg-primary/90"
				>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{tDischarge("confirmButton")}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}