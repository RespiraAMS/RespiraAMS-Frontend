export type TimeRange = "30d" | "quarter" | "year";

export interface KpiMetric {
	id: string;
	title: string;
	value: number;
	changePercent: number;
	subtitle: string;
	type: "diagnosis" | "treatment" | "microbiology";
}

export interface WeeklyDiagnosisData {
	week: string; // e.g. "T1", "T2", ...
	fullLabel: string;
	count: number;
}

export interface PathogenData {
	id: string;
	name: string;
	count: number;
	percentage: number; // width in %
	barColor: string;
	sensitivityText: string;
	extraInfo: string;
	isWarning?: boolean;
	warningColor?: string;
}
