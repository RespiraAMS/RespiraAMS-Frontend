"use client";

import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
} from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type StatisticsData,
	SEVERITY_LABELS,
	SEVERITY_COLORS,
} from "../types";

interface DecisionSeverityChartProps {
	stats: StatisticsData;
}

export function DecisionSeverityChart({ stats }: DecisionSeverityChartProps) {
	const hasData = stats.totalDecision.length > 0;

	return (
		<Card className="shadow-sm border">
			<CardHeader>
				<CardTitle>Tổng Quyết định theo Mức độ Nặng</CardTitle>
			</CardHeader>
			<CardContent className="flex justify-center">
				{hasData ? (
					<PieChart width={320} height={280}>
						<Pie
							data={stats.totalDecision.map((d) => ({
								name: SEVERITY_LABELS[d.severity] ?? d.severity,
								value: d.count,
							}))}
							cx="50%"
							cy="50%"
							innerRadius={55}
							outerRadius={100}
							paddingAngle={3}
							dataKey="value"
						>
							{stats.totalDecision.map((_, i) => (
								<Cell
									key={i}
									fill={SEVERITY_COLORS[i % SEVERITY_COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip />
						<Legend
							formatter={(value) => (
								<span className="text-sm text-muted-foreground">{value}</span>
							)}
						/>
					</PieChart>
				) : (
					<p className="text-sm text-muted-foreground py-10">
						Không có dữ liệu quyết định trong tháng này.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
