"use client";

import { CheckCircle2 } from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { WeeklyDiagnosisData } from "../types";

interface WeeklyDiagnosisChartProps {
	data: WeeklyDiagnosisData[];
}

function CustomTooltip({ active, payload }: any) {
	if (active && payload && payload.length) {
		const item = payload[0].payload as WeeklyDiagnosisData;
		return (
			<div
				style={{ borderRadius: "10px" }}
				className="bg-slate-900 text-white text-xs rounded-[10px] px-3 py-2 shadow-xl border border-slate-800"
			>
				<p className="font-semibold text-sky-400">{item.fullLabel}</p>
				<p className="mt-1 text-slate-200">
					Số lượng: <span className="font-bold text-white">{item.count}</span> ca bệnh
				</p>
			</div>
		);
	}
	return null;
}

export function WeeklyDiagnosisChart({ data }: WeeklyDiagnosisChartProps) {
	return (
		<div
			style={{ borderRadius: "14px" }}
			className="h-full min-h-[460px] bg-white rounded-[14px] border border-slate-100/90 p-6 shadow-2xs flex flex-col justify-between"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-base font-bold text-slate-900">
						Chẩn đoán theo tuần
					</h3>
					<p className="text-xs text-slate-400 mt-0.5">
						Biểu đồ tần suất chẩn đoán theo tuần (T1 - T6)
					</p>
				</div>

				<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0EA5E9] text-xs font-semibold shrink-0">
					<span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
					<span>Số lượng chẩn đoán</span>
				</div>
			</div>

			{/* Chart Body */}
			<div className="w-full h-[300px] my-auto pt-4">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="#F1F5F9"
						/>
						<XAxis
							dataKey="week"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
							dy={10}
						/>
						<YAxis
							orientation="right"
							axisLine={false}
							tickLine={false}
							domain={[0, 100]}
							ticks={[0, 25, 50, 75, 100]}
							tick={{ fill: "#94A3B8", fontSize: 11 }}
						/>
						<Tooltip
							cursor={{ fill: "rgba(14, 165, 233, 0.04)" }}
							content={<CustomTooltip />}
						/>
						<Bar
							dataKey="count"
							fill="#0EA5E9"
							radius={[16, 16, 16, 16]}
							barSize={32}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Footer */}
			<div className="border-t border-slate-100 pt-4 mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
				<div className="flex items-center gap-2 text-slate-600">
					<CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
					<span>
						Cao điểm tuần T6: 94 ca ghi nhận từ phân khoa hồi sức hô hấp
					</span>
				</div>
				<span className="text-slate-400 font-medium shrink-0">
					Đơn vị: Ca bệnh
				</span>
			</div>
		</div>
	);
}
