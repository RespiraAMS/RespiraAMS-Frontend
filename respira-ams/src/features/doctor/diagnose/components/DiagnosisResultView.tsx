import { useState } from "react";
import { cn } from "@/lib/utils";
import { DiagnoseResponse, Evidence, MetricsSeverityDiagnosis } from "../types";
import { formatSeverity, formatTreatmentSite, severityBadgeClass } from "../utils";
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

	// Lấy danh sách dị ứng từ allergicAntibiotics hoặc allergies
	const allergicList =
		result.allergy?.allergicAntibiotics ||
		result.allergy?.AllergicAntibiotics ||
		result.allergies ||
		result.Allergies ||
		[];

	const allergyNames = allergicList
		.map((a) => a.name || a.Name || "")
		.filter(Boolean);

	const allergyText =
		allergyNames.length > 0
			? allergyNames.join(", ")
			: result.allergy?.otherAllergy || result.allergy?.OtherAllergy || "Không ghi nhận dị ứng";

	const metrics = (result.metricsSeverityDiagnosis ||
		result.MetricsSeverityDiagnosis ||
		[]) as MetricsSeverityDiagnosis[];
	const evidences = (result.evidences || result.Evidences || []) as (Evidence | string)[];
	const missingVars = result.missingVariables || result.MissingVariables || [];
	const heavy = result.heavySuspected || result.HeavySuspected || [];
	const worth = result.worthSuspected || result.WorthSuspected || [];

	return (
		<div className="space-y-5 animate-in fade-in duration-200">
			<ResultCard step={1} title="Kết quả chẩn đoán mức độ nặng">
				<div className="space-y-2.5">
					<ResultRow label="Mức độ nặng">
						<span
							className={cn(
								"px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider",
								severityBadgeClass(severity)
							)}
						>
							{formatSeverity(severity)}
						</span>
					</ResultRow>

					<ResultRow label="Nơi điều trị">
						<span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
							{formatTreatmentSite(treatmentSite)}
						</span>
					</ResultRow>

					<ResultRow label="Mang thai / Cho con bú">
						<span className="text-sm font-semibold text-slate-900">
							{pregnant ? "Có" : "Không"}
						</span>
					</ResultRow>

					<ResultRow label="Tiền sử dị ứng">
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

			<ResultCard step={2} title="Các chỉ số lâm sàng còn thiếu" headingClassName="mb-3">
				{missingVars.length === 0 ? (
					<div className="text-xs italic text-slate-400 py-1">
						Đã cung cấp đầy đủ tất cả các chỉ số cần thiết
					</div>
				) : (
					<div className="space-y-2">
						{missingVars.map((v, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between gap-3 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl font-semibold text-sm"
							>
								<span className="font-extrabold text-slate-900">
									{v.code || v.Code || "Chỉ số"}
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
				Thực hiện chẩn đoán mới
			</button>
		</div>
	);
}
