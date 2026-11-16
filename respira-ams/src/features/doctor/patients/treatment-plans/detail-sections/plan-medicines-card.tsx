"use client";

import { Pill } from "lucide-react";
import { useTranslations } from "next-intl";

import { type PlanMedicineItem } from "../../types";
import { AwareBadge } from "../treatment-plan-utils";

interface PlanMedicinesCardProps {
	medicines: PlanMedicineItem[];
	reasonForMedicineChoice?: string | null;
	status: number;
	closeReason?: string | null;
}

export function PlanMedicinesCard({
	medicines,
	reasonForMedicineChoice,
	status,
	closeReason,
}: PlanMedicinesCardProps) {
	const t = useTranslations("doctor.patients.treatmentPlan.medicines");

	return (
		<div className="rounded-xl border border-border bg-card text-card-foreground p-4 space-y-3">
			<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
				<Pill className="w-4 h-4 text-primary" /> {t("title")}
			</h4>

			{medicines.length === 0 ? (
				<p className="text-muted-foreground text-xs italic">{t("empty")}</p>
			) : (
				<div className="flex flex-wrap gap-2">
					{medicines.map((med) => (
						<div
							key={med.id}
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 dark:bg-muted/25"
						>
							<span className="font-semibold text-foreground">{med.name}</span>
							<AwareBadge classification={med.classification} />
						</div>
					))}
				</div>
			)}

			{reasonForMedicineChoice && (
				<div className="pt-2 border-t border-border">
					<span className="text-xs text-muted-foreground block">
						{t("choiceReasonLabel")}
					</span>
					<p className="font-medium text-foreground mt-0.5">
						{reasonForMedicineChoice}
					</p>
				</div>
			)}

			{status === 1 && closeReason && (
				<div className="pt-2 border-t border-border">
					<span className="text-xs text-muted-foreground block">
						{t("closeReasonLabel")}
					</span>
					<p className="font-medium text-foreground mt-0.5">{closeReason}</p>
				</div>
			)}
		</div>
	);
}