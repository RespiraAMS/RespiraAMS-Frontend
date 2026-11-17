"use client";

import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { type ParsedDiagnosis } from "../../types";
import { translateSeverity } from "../treatment-plan-utils";

const KNOWN_SEVERITIES = new Set(["Mild", "Moderate", "Severe", "Critical"]);

interface PlanSeverityMetricsCardProps {
	metrics: ParsedDiagnosis["metricsSeverityDiagnosis"];
}

export function PlanSeverityMetricsCard({ metrics }: PlanSeverityMetricsCardProps) {
	const t = useTranslations("doctor.patients.treatmentPlan");

	if (!metrics?.length) return null;

	return (
		<div className="rounded-xl border border-border bg-card text-card-foreground p-4 space-y-3">
			<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
				<ClipboardCheck className="w-4 h-4 text-primary" /> {t("metrics.title")}
			</h4>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{metrics.map((metric) => {
					const totalScore = metric.evidences.reduce(
						(acc, ev) => acc + (ev.score || 0),
						0
					);
					const matchedCriteria = metric.evidences.filter(
						(ev) => ev.evaluatedValue === true
					);

					const severityLabel = KNOWN_SEVERITIES.has(metric.severity)
						? t(`severity.${metric.severity}`)
						: translateSeverity(metric.severity);

					return (
						<div
							key={metric.code}
							className="p-3 rounded-lg border border-border bg-muted/30 dark:bg-muted/20 space-y-2"
						>
							<div className="flex items-center justify-between">
								<span className="font-bold text-foreground">{metric.code}</span>
								<span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
									{t("metrics.scoreBadge", { score: totalScore })}
								</span>
							</div>
							<div className="text-xs text-muted-foreground">
								{t("metrics.conclusionLabel")}{" "}
								<strong className="text-foreground">{severityLabel}</strong>
							</div>
							{matchedCriteria.length > 0 && (
								<ul className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border">
									{matchedCriteria.map((c, i) => (
										<li key={i} className="flex items-start gap-1">
											<CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
											<span>{c.source}</span>
										</li>
									))}
								</ul>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}