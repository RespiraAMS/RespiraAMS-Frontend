"use client";

import { useEffect, useState } from "react";
import { StatisticsTimeFilter } from "./StatisticsTimeFilter";
import { StatisticsKpiCards } from "./StatisticsKpiCards";
import { WeeklyDiagnosisChart } from "./WeeklyDiagnosisChart";
import { CommonPathogensCard } from "./CommonPathogensCard";
import {
	MOCK_KPIS,
	MOCK_WEEKLY_DIAGNOSES,
	MOCK_PATHOGENS,
} from "../data/mockStatistics";
import { TimeRange, KpiMetric, PathogenData } from "../types";
import { fetchTopPathogens, fetchTotalPatients } from "../api";

const PATHOGEN_COLORS = ["#0EA5E9", "#F59E0B", "#14B8A6", "#EF4444", "#8B5CF6"];

export function DoctorStatisticsView() {
	const [timeRange, setTimeRange] = useState<TimeRange>("30d");
	const [realPatientCount, setRealPatientCount] = useState<number | null>(null);
	const [realPathogens, setRealPathogens] = useState<PathogenData[] | null>(null);

	useEffect(() => {
		let isMounted = true;

		fetchTotalPatients().then((count) => {
			if (isMounted && count > 0) {
				setRealPatientCount(count);
			}
		});

		fetchTopPathogens().then((pathogens) => {
			if (isMounted && pathogens.length > 0) {
				const mapped: PathogenData[] = pathogens.map((p, idx) => ({
					id: p.id,
					name: p.name,
					count: Math.max(10, 35 - idx * 5),
					percentage: Math.max(20, 80 - idx * 12),
					barColor: PATHOGEN_COLORS[idx % PATHOGEN_COLORS.length],
					sensitivityText: p.isAtypical ? "Vi khuẩn không điển hình" : "Vi khuẩn điển hình",
					extraInfo: p.description ? p.description.slice(0, 30) + "..." : "Tác nhân hô hấp",
					isWarning: p.isAtypical,
					warningColor: p.isAtypical ? "text-amber-500" : undefined,
				}));
				setRealPathogens(mapped);
			}
		});

		return () => {
			isMounted = false;
		};
	}, []);

	// Multipliers to make filter tabs interactive and responsive
	const getAdjustedMetrics = (range: TimeRange): KpiMetric[] => {
		const baseKpis = MOCK_KPIS.map((kpi) => {
			if (kpi.id === "diagnosis" && realPatientCount !== null) {
				return { ...kpi, value: realPatientCount };
			}
			return kpi;
		});

		switch (range) {
			case "quarter":
				return baseKpis.map((k) => ({
					...k,
					value: Math.round(k.value * 2.8),
					changePercent: Math.round(k.changePercent * 1.2),
				}));
			case "year":
				return baseKpis.map((k) => ({
					...k,
					value: Math.round(k.value * 11.2),
					changePercent: Math.round(k.changePercent * 1.5),
				}));
			case "30d":
			default:
				return baseKpis;
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
					<CommonPathogensCard pathogens={realPathogens || MOCK_PATHOGENS} />
				</div>
			</div>
		</div>
	);
}

export default DoctorStatisticsView;
