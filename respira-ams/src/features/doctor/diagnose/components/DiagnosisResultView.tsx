import { useState } from "react";
import { cn } from "@/lib/utils";
import { DiagnoseResponse, Evidence, MetricsSeverityDiagnosis } from "../types";
import { formatTreatmentSite, severityBadgeClass } from "../utils";
import { ResultCard, ResultRow } from "./ResultCard";
import { MetricsSeverityList } from "./MetricsSeverityList";
import { EvidencesPanel } from "./EvidencesPanel";
import { InfectionAssessmentCard } from "./InfectionAssessmentCard";

interface DiagnosisResultViewProps {
	result: DiagnoseResponse;
	onReset: () => void;
}

export function DiagnosisResultView({ result, onReset }: DiagnosisResultViewProps) {
	const [showEvidences, setShowEvidences] = useState(false);

	const severity = result.severity || result.Severity || "";
	const treatmentSite = result.treatmentSite || result.TreatmentSite;
	const pregnant = !!(
		result.isPatientPregnantOrInLactationPhase || result.IsPatientPregnantOrInLactationPhase
	);
	const allergies = result.allergies || result.Allergies || [];
	const allergyText =
		allergies.length > 0
			? allergies
					.map((a) => a.name || a.Name || "")
					.filter(Boolean)
					.join(", ")
			: "None";

	const metrics = (result.metricsSeverityDiagnosis ||
		result.MetricsSeverityDiagnosis ||
		[]) as MetricsSeverityDiagnosis[];
	const evidences = (result.evidences || result.Evidences || []) as (Evidence | string)[];
	const missingVars = result.missingVariables || result.MissingVariables || [];
	const heavy = result.heavySuspected || result.HeavySuspected || [];
	const worth = result.worthSuspected || result.WorthSuspected || [];

	return (
		<div className="space-y-5 animate-in fade-in duration-200">
			<ResultCard step={1} title="Diagnosis Result">
				<div className="space-y-2.5">
					<ResultRow label="Severity">
						<span
							className={cn(
								"px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider",
								severityBadgeClass(severity)
							)}
						>
							{severity || "Unknown"}
						</span>
					</ResultRow>

					<ResultRow label="Treatment Site">
						<span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
							{formatTreatmentSite(treatmentSite)}
						</span>
					</ResultRow>

					<ResultRow label="Pregnant / Lactating">
						<span className="text-sm font-semibold text-slate-900">
							{pregnant ? "Yes" : "No"}
						</span>
					</ResultRow>

					<ResultRow label="Allergies">
						<span className="text-sm font-semibold text-slate-900 text-right">
							{allergyText}
						</span>
					</ResultRow>
				</div>

				<MetricsSeverityList metrics={metrics} />

				<EvidencesPanel
					evidences={evidences}
					expanded={showEvidences}
					onToggle={() => setShowEvidences((prev) => !prev)}
				/>
			</ResultCard>

			<ResultCard step={2} title="Missing Variables" headingClassName="mb-3">
				{missingVars.length === 0 ? (
					<div className="text-xs italic text-slate-400 py-1">All variables were provided</div>
				) : (
					<div className="space-y-2">
						{missingVars.map((v, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between gap-3 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl font-semibold text-sm"
							>
								<span className="font-extrabold text-slate-900">
									{v.code || v.Code || "Variable"}
								</span>
								<span className="text-slate-500 text-xs">{v.name || v.Name || ""}</span>
							</div>
						))}
					</div>
				)}
			</ResultCard>

			<InfectionAssessmentCard heavy={heavy} worth={worth} />

			<button
				type="button"
				onClick={onReset}
				className="w-full py-3.5 px-6 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-[0_4px_12px_rgba(14,165,233,0.25)] transition-all cursor-pointer"
			>
				New Diagnosis
			</button>
		</div>
	);
}

