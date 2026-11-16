"use client";

import { useMemo } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { useTreatmentPlanDetail } from "../queries";
import { type ParsedDiagnosis } from "../types";
import { PlanMedicinesCard } from "./detail-sections/plan-medicines-card";
import { PlanClassificationCard } from "./detail-sections/plan-classification-card";
import { PlanSeverityMetricsCard } from "./detail-sections/plan-severity-metrics-card";
import { PlanPathogensCard } from "./detail-sections/plan-pathogens-card";
import { PlanProtocolsCard } from "./detail-sections/plan-protocols-card";

interface TreatmentPlanDetailDialogProps {
	planId: string | null;
	onClose: () => void;
}

export function TreatmentPlanDetailDialog({
	planId,
	onClose,
}: TreatmentPlanDetailDialogProps) {
	const t = useTranslations("doctor.patients.treatmentPlan.detailDialog");
	const { data: plan, isLoading } = useTreatmentPlanDetail(planId);

	const parsedDiagnosis = useMemo<ParsedDiagnosis | null>(() => {
		if (!plan?.diagnosis) return null;
		try {
			return JSON.parse(plan.diagnosis) as ParsedDiagnosis;
		} catch {
			return null;
		}
	}, [plan]);

	return (
		<Dialog open={!!planId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-4xl border-border bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl text-foreground">
						<FileText className="w-5 h-5 text-primary" />
						{t("title")}
						{plan && (
							<span className="text-xs font-mono font-normal text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
								#{plan.id.slice(0, 8)}
							</span>
						)}
					</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="flex justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
					</div>
				) : !plan ? (
					<div className="text-center py-10 text-destructive font-medium">
						{t("loadError")}
					</div>
				) : (
					<div className="space-y-5 text-sm text-foreground">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<PlanMedicinesCard
								medicines={plan.medicines}
								reasonForMedicineChoice={plan.reasonForMedicineChoice}
								status={plan.status}
								closeReason={plan.closeReason}
							/>

							{parsedDiagnosis && (
								<PlanClassificationCard diagnosis={parsedDiagnosis} />
							)}
						</div>

						{parsedDiagnosis && (
							<>
								<PlanSeverityMetricsCard
									metrics={parsedDiagnosis.metricsSeverityDiagnosis}
								/>

								<PlanPathogensCard
									heavySuspected={parsedDiagnosis.heavySuspected}
									worthSuspected={parsedDiagnosis.worthSuspected}
								/>

								<PlanProtocolsCard protocols={parsedDiagnosis.protocols} />
							</>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}