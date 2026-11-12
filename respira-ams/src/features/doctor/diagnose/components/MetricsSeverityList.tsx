import { cn } from "@/lib/utils";
import { MetricsSeverityDiagnosis } from "../types";
import { formatSeverity, formatTreatmentSite, severityBadgeClass } from "../utils";

export function MetricsSeverityList({ metrics }: { metrics: MetricsSeverityDiagnosis[] }) {
	return (
		<div className="mt-5 pt-4 border-t border-dashed border-slate-200">
			<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
				Đánh giá mức độ nặng theo thang điểm
			</h3>

			{metrics.length === 0 ? (
				<div className="text-xs italic text-slate-400 py-1">
					Không có dữ liệu đánh giá theo thang điểm
				</div>
			) : (
				<div className="space-y-2">
					{metrics.map((m, idx) => {
						const code = m.code ?? m.Code ?? "Thang điểm";
						const severity = m.severity ?? m.Severity ?? "";
						const site = m.treatmentSite ?? m.TreatmentSite ?? "";
						const score = m.score ?? m.Score;
						const major = m.majorMatched ?? m.MajorMatched;
						const minor = m.minorMatched ?? m.MinorMatched;
						const hasCriteria =
							major !== undefined && major !== null && minor !== undefined && minor !== null;

						return (
							<div
								key={`${code}-${idx}`}
								className="flex items-center justify-between gap-2.5 flex-wrap p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl"
							>
								<div className="flex items-center gap-2">
									<span className="font-extrabold text-sm text-slate-900">{code}</span>
									{severity && (
										<span
											className={cn(
												"px-2 py-0.5 rounded-full text-[0.7rem] font-extrabold uppercase tracking-wider",
												severityBadgeClass(severity)
											)}
										>
											{formatSeverity(severity)}
										</span>
									)}
								</div>

								<div className="flex items-center gap-1.5 flex-wrap">
									<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-slate-100 text-slate-600">
										Nơi điều trị: {formatTreatmentSite(site)}
									</span>
									{score !== undefined && score !== null && (
										<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-[#F0F9FF] text-[#0284C7]">
											Điểm: {score}
										</span>
									)}
									{hasCriteria && (
										<>
											<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-[#F0F9FF] text-[#0284C7]">
												Tiêu chuẩn chính: {major}
											</span>
											<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-slate-100 text-slate-600">
												Tiêu chuẩn phụ: {minor}
											</span>
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
