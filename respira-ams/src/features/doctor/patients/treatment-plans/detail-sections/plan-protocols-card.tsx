"use client";

import { useTranslations } from "next-intl";

import { type ParsedDiagnosis } from "../../types";
import { translateSeverity, translateSite } from "../treatment-plan-utils";

const KNOWN_SEVERITIES = new Set(["Mild", "Moderate", "Severe", "Critical"]);
const KNOWN_SITES = new Set(["Outpatient", "Inpatient", "ICU"]);

interface PlanProtocolsCardProps {
	protocols: ParsedDiagnosis["protocols"];
}

export function PlanProtocolsCard({ protocols }: PlanProtocolsCardProps) {
	const t = useTranslations("doctor.patients.treatmentPlan");

	if (!protocols?.length) return null;

	return (
		<div className="rounded-xl border border-border bg-card text-card-foreground p-4 space-y-3">
			<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{t("protocols.title", { count: protocols.length })}
			</h4>

			<div className="space-y-3">
				{protocols.map((proto, idx) => {
					const severityLabel = KNOWN_SEVERITIES.has(proto.severity)
						? t(`severity.${proto.severity}`)
						: translateSeverity(proto.severity);

					const siteLabel = KNOWN_SITES.has(proto.treatmentSite)
						? t(`treatmentSite.${proto.treatmentSite}`)
						: translateSite(proto.treatmentSite);

					return (
						<div
							key={proto.id}
							className="p-3 rounded-lg border border-border bg-muted/20 dark:bg-muted/15 space-y-2"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<span className="font-semibold text-xs text-foreground">
									{t("protocols.groupHeader", {
										index: idx + 1,
										severity: severityLabel,
										site: siteLabel,
									})}
								</span>
								{proto.criteria.length > 0 && (
									<span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
										{t("protocols.criteriaLabel", {
											criteria: proto.criteria.map((c) => c.name).join("; "),
										})}
									</span>
								)}
							</div>
							<div className="flex flex-wrap gap-1.5">
								{proto.medicines.map((combo, cIdx) => (
									<span
										key={cIdx}
										className="inline-flex items-center px-2 py-1 rounded bg-background text-foreground border border-border text-xs font-medium"
									>
										{combo.map((m) => m.name).join(" + ")}
									</span>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}