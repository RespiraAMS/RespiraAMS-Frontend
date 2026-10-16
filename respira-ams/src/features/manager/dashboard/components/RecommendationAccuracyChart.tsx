"use client";

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type StatisticsData } from "../types";

interface RecommendationAccuracyChartProps {
	stats: StatisticsData;
	selectedYear: number;
}

export function RecommendationAccuracyChart({
	stats,
	selectedYear,
}: RecommendationAccuracyChartProps) {
	const totalCases = stats.totalDecision.reduce((s, d) => s + d.count, 0);

	const lineData = Array.from({ length: 12 }, (_, i) => {
		const month = i + 1;
		const acc = stats.recommendationAccuracy.find((a) => a.month === month);
		return {
			month: `Th${month}`,
			accuracy: acc ? Number((acc.accuracy * 100).toFixed(1)) : 0,
		};
	});

	return (
		<Card className="shadow-sm border">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Độ chính xác Khuyến nghị</CardTitle>
					<CardDescription>
						Biểu đồ đường thể hiện độ chính xác từng tháng trong năm{" "}
						{selectedYear}
					</CardDescription>
				</div>
				<span className="text-base font-semibold">
					Tổng: {totalCases} ca
				</span>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={lineData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="month"
							interval={0}
							tick={{ fontSize: 11 }}
						/>
						<YAxis
							domain={[0, 100]}
							tickFormatter={(v) => `${v}%`}
							tick={{ fontSize: 11 }}
						/>
						<Tooltip formatter={(v) => `${v}%`} />
						<Legend />
						<Line
							type="monotone"
							dataKey="accuracy"
							name="Độ chính xác"
							stroke="#2563eb"
							strokeWidth={2}
							dot={{ r: 4 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
