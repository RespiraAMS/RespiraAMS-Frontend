"use client";

import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type StatisticsData, CHART_COLORS } from "../types";

interface AntibioticConsumptionChartProps {
	stats: StatisticsData;
	selectedMonth: number;
	selectedYear: number;
}

export function AntibioticConsumptionChart({
	stats,
	selectedMonth,
	selectedYear,
}: AntibioticConsumptionChartProps) {
	const hasData = stats.antibioticConsumptionRates.length > 0;

	return (
		<Card className="shadow-sm border">
			<CardHeader>
				<CardTitle>Tỷ lệ Sử dụng Kháng sinh</CardTitle>
				<CardDescription>
					Theo danh mục AWaRe cho {selectedMonth}/{selectedYear}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="h-[300px] w-full mt-4 flex justify-center items-center relative">
					{hasData ? (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={stats.antibioticConsumptionRates}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={5}
									dataKey="rate"
									nameKey="category"
								>
									{stats.antibioticConsumptionRates.map((_, index) => (
										<Cell
											key={`cell-${index}`}
											fill={CHART_COLORS[index % CHART_COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip
									formatter={(value, name, props) => {
										const numericValue =
											typeof value === "number" ? value : Number(value);
										const rateLabel = Number.isFinite(numericValue)
											? `${(numericValue * 100).toFixed(1)}% (${props?.payload?.count ?? 0} ca)`
											: "N/A";
										return [rateLabel, name ?? ""];
									}}
								/>
								<Legend
									verticalAlign="bottom"
									height={36}
									iconType="circle"
								/>
							</PieChart>
						</ResponsiveContainer>
					) : (
						<p className="text-zinc-400 italic text-sm absolute">
							Không có dữ liệu tiêu thụ trong tháng này.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
