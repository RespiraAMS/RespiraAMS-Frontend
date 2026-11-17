"use client";

import { ShieldAlert, Stethoscope } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { type ParsedDiagnosis } from "../../types";
import { translateSeverity, translateSite } from "../treatment-plan-utils";

const KNOWN_SEVERITIES = new Set(["Mild", "Moderate", "Severe", "Critical"]);
const KNOWN_SITES = new Set(["Outpatient", "Inpatient", "ICU"]);

interface PlanClassificationCardProps {
	diagnosis: ParsedDiagnosis;
}

export function PlanClassificationCard({ diagnosis }: PlanClassificationCardProps) {
	const t = useTranslations("doctor.patients.treatmentPlan");

	const hasAllergies =
		diagnosis.allergy?.type === "Yes" &&
		diagnosis.allergy.allergicAntibiotics.length > 0;

	const severityLabel = KNOWN_SEVERITIES.has(diagnosis.severity)
		? t(`severity.${diagnosis.severity}`)
		: translateSeverity(diagnosis.severity);

	const siteLabel = KNOWN_SITES.has(diagnosis.treatmentSite)
		? t(`treatmentSite.${diagnosis.treatmentSite}`)
		: translateSite(diagnosis.treatmentSite);

	return (
		<div className="rounded-xl border border-border bg-card text-card-foreground p-4 space-y-3">
			<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
				<Stethoscope className="w-4 h-4 text-primary" /> {t("classification.title")}
			</h4>

			<div className="grid grid-cols-2 gap-2.5">
				<div className="p-2.5 rounded-lg bg-muted/50 dark:bg-muted/30 border border-border">
					<span className="text-xs text-muted-foreground block">
						{t("classification.severityLabel")}
					</span>
					<span className="font-bold text-foreground">{severityLabel}</span>
				</div>
				<div className="p-2.5 rounded-lg bg-muted/50 dark:bg-muted/30 border border-border">
					<span className="text-xs text-muted-foreground block">
						{t("classification.treatmentSiteLabel")}
					</span>
					<span className="font-bold text-foreground">{siteLabel}</span>
				</div>
			</div>

			{hasAllergies && (
				<div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
					<ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
					<div className="text-xs">
						<span className="font-semibold text-rose-700 dark:text-rose-400">
							{t("classification.antibioticAllergyLabel")}{" "}
						</span>
						<span className="text-foreground font-medium">
							{diagnosis.allergy.allergicAntibiotics
								.map((a) => a.name)
								.join(", ")}
						</span>
					</div>
				</div>
			)}

			{diagnosis.otherInfections?.length > 0 && (
				<div className="text-xs">
					<span className="text-muted-foreground block mb-1">
						{t("classification.otherInfectionsLabel")}
					</span>
					<div className="flex flex-wrap gap-1.5">
						{diagnosis.otherInfections.map((inf) => (
							<Badge
								key={inf}
								variant="secondary"
								className="text-[11px] bg-secondary text-secondary-foreground"
							>
								{inf}
							</Badge>
						))}
					</div>
				</div>
			)}
		</div>
	);
}