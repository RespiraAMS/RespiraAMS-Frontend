"use client";

import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_STATISTICS } from "../types";
import { DashboardFilterBar } from "./DashboardFilterBar";
import { RecommendationAccuracyChart } from "./RecommendationAccuracyChart";
import { DecisionSeverityChart } from "./DecisionSeverityChart";
import { AntibioticConsumptionChart } from "./AntibioticConsumptionChart";

export function DashboardView() {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;

	const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
	const [selectedYear, setSelectedYear] = useState<number>(currentYear);
	const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

	// UI-only: dùng mock data, không gọi API
	const isLoading = false;
	const isError = false;
	const stats = useMemo(() => MOCK_STATISTICS, []);

	return (
		<div className="container mx-auto pb-10 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<h1 className="text-2xl font-bold text-primary">
					Bảng Thống kê
				</h1>
			</div>

			{/* Filter Bar */}
			<DashboardFilterBar
				selectedDoctorId={selectedDoctorId}
				selectedYear={selectedYear}
				selectedMonth={selectedMonth}
				onDoctorChange={setSelectedDoctorId}
				onYearChange={setSelectedYear}
				onMonthChange={setSelectedMonth}
			/>

			{/* Charts */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Skeleton className="h-[400px] w-full rounded-xl" />
					<Skeleton className="h-[400px] w-full rounded-xl" />
				</div>
			) : isError ? (
				<div className="bg-red-50 text-red-600 p-4 rounded-lg font-bold border border-red-200">
					Không thể tải dữ liệu thống kê.
				</div>
			) : (
				<div className="space-y-6">
					{/* Line Chart – full width */}
					<RecommendationAccuracyChart
						stats={stats}
						selectedYear={selectedYear}
					/>

					{/* Pie Charts – side by side */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<DecisionSeverityChart stats={stats} />
						<AntibioticConsumptionChart
							stats={stats}
							selectedMonth={selectedMonth}
							selectedYear={selectedYear}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
