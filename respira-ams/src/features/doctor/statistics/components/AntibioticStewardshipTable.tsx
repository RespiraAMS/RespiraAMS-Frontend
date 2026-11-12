"use client";

import { MedicineAnalysisSummary } from "../types";
import { Pill, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface AntibioticStewardshipTableProps {
	medicines: MedicineAnalysisSummary[];
	totalPlans: number;
}

export function AntibioticStewardshipTable({
	medicines,
	totalPlans,
}: AntibioticStewardshipTableProps) {
	if (!medicines || medicines.length === 0) {
		return null;
	}

	return (
		<div
			style={{ borderRadius: "14px" }}
			className="bg-white rounded-[14px] border border-slate-100/90 p-6 shadow-2xs space-y-4"
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
				<div>
					<h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
						<Pill className="w-5 h-5 text-[#0EA5E9]" />
						<span>Giám sát Chỉ định &amp; Tuân thủ Sử dụng Kháng sinh (AMR)</span>
					</h3>
					<p className="text-xs text-slate-500 mt-1">
						Dữ liệu phân tích mức độ tuân thủ phác đồ điều trị kinh nghiệm và nguy cơ đề kháng kháng sinh
					</p>
				</div>
				<div className="text-xs font-semibold px-3 py-1 bg-sky-50 text-[#0284C7] rounded-full self-start sm:self-auto border border-sky-100">
					Tổng phác đồ: {totalPlans} ca
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left text-xs sm:text-sm">
					<thead>
						<tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
							<th className="py-3 px-3 font-semibold">Tên kháng sinh</th>
							<th className="py-3 px-3 font-semibold">Nhóm dược lý</th>
							<th className="py-3 px-3 font-semibold text-center">Số ca chỉ định</th>
							<th className="py-3 px-3 font-semibold text-center">Tuân thủ phác đồ</th>
							<th className="py-3 px-3 font-semibold text-center">Không tuân thủ</th>
							<th className="py-3 px-3 font-semibold text-center">Tỷ lệ tuân thủ</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{medicines.map((med) => {
							const adherenceRate =
								med.totalTreatmentPlans > 0
									? Math.round((med.totalAdherentPlans / med.totalTreatmentPlans) * 100)
									: 0;

							return (
								<tr key={med.medicineId} className="hover:bg-slate-50/60 transition-colors">
									<td className="py-3.5 px-3 font-bold text-slate-900">
										{med.name}
									</td>
									<td className="py-3.5 px-3 text-slate-600 font-medium">
										<span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
											{med.classification || "Kháng sinh"}
										</span>
									</td>
									<td className="py-3.5 px-3 text-center font-extrabold text-slate-900">
										{med.totalTreatmentPlans}
									</td>
									<td className="py-3.5 px-3 text-center">
										<span className="inline-flex items-center gap-1 font-bold text-emerald-600">
											<CheckCircle2 className="w-3.5 h-3.5" />
											{med.totalAdherentPlans}
										</span>
									</td>
									<td className="py-3.5 px-3 text-center">
										{med.totalNonAdherentPlans > 0 ? (
											<span className="inline-flex items-center gap-1 font-bold text-rose-500">
												<AlertTriangle className="w-3.5 h-3.5" />
												{med.totalNonAdherentPlans}
											</span>
										) : (
											<span className="text-slate-400">0</span>
										)}
									</td>
									<td className="py-3.5 px-3 text-center">
										<div className="flex items-center justify-center gap-2">
											<div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
												<div
													className={`h-full rounded-full ${
														adherenceRate >= 70
															? "bg-emerald-500"
															: adherenceRate >= 50
															? "bg-amber-500"
															: "bg-rose-500"
													}`}
													style={{ width: `${adherenceRate}%` }}
												/>
											</div>
											<span className="font-extrabold text-xs text-slate-800 min-w-[32px] text-right">
												{adherenceRate}%
											</span>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

