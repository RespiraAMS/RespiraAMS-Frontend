"use client";

import { useState } from "react";
import { StatisticsTimeFilter } from "./StatisticsTimeFilter";
import { StatisticsKpiCards } from "./StatisticsKpiCards";
import { WeeklyDiagnosisChart } from "./WeeklyDiagnosisChart";
import { CommonPathogensCard } from "./CommonPathogensCard";
import {
	MOCK_KPIS,
	MOCK_WEEKLY_DIAGNOSES,
	MOCK_PATHOGENS,
} from "../data/mockStatistics";
import { TimeRange, KpiMetric } from "../types";

export function DoctorStatisticsView() {
	const [timeRange, setTimeRange] = useState<TimeRange>("30d");

	// Multipliers to make filter tabs interactive and responsive
	const getAdjustedMetrics = (range: TimeRange): KpiMetric[] => {
		switch (range) {
			case "quarter":
				return MOCK_KPIS.map((k) => ({
					...k,
					value: Math.round(k.value * 2.8),
					changePercent: Math.round(k.changePercent * 1.2),
				}));
			case "year":
				return MOCK_KPIS.map((k) => ({
					...k,
					value: Math.round(k.value * 11.2),
					changePercent: Math.round(k.changePercent * 1.5),
				}));
			case "30d":
			default:
				return MOCK_KPIS;
		}
	};

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-6">
			{/* Time Range Filter Bar */}
			<div className="w-full">
				<StatisticsTimeFilter
					selectedRange={timeRange}
					onRangeChange={setTimeRange}
				/>
			</div>

			{/* 3 KPI Summary Cards */}
			<StatisticsKpiCards metrics={getAdjustedMetrics(timeRange)} />

			{/* Main Content Grid: Chart + Common Pathogens */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
				{/* Left: Weekly Diagnosis Chart (7 cols) */}
				<div className="lg:col-span-7 flex flex-col">
					<WeeklyDiagnosisChart data={MOCK_WEEKLY_DIAGNOSES} />
				</div>

				{/* Right: Common Pathogens Card (5 cols) */}
				<div className="lg:col-span-5 flex flex-col">
					<CommonPathogensCard pathogens={MOCK_PATHOGENS} />
				</div>
			</div>
		</div>
	);
}

export default DoctorStatisticsView;
