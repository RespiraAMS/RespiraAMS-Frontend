// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface TotalDecisionItem {
	severity: string;
	count: number;
}

export interface RecommendationAccuracyItem {
	month: number;
	accuracy: number;
}

export interface AntibioticConsumptionRateItem {
	category: string;
	count: number;
	rate: number;
}

export interface StatisticsData {
	totalDecision: TotalDecisionItem[];
	recommendationAccuracy: RecommendationAccuracyItem[];
	antibioticConsumptionRates: AntibioticConsumptionRateItem[];
}

export interface DoctorOption {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
}

// ─── Severity Labels & Colors ─────────────────────────────────────────────────

export const SEVERITY_LABELS: Record<string, string> = {
	mild: "Nhẹ",
	moderate: "Trung bình",
	severe: "Nặng",
	critical: "Nguy kịch",
};

export const SEVERITY_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

export const CHART_COLORS = [
	"#0c3660",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_DOCTORS: DoctorOption[] = [
	{
		id: "1",
		firstName: "Nguyễn",
		lastName: "Văn An",
		email: "nguyen.vanan@respira.vn",
		phoneNumber: "0901234567",
	},
	{
		id: "2",
		firstName: "Trần",
		lastName: "Thị Bình",
		email: "tran.thibinhh@respira.vn",
		phoneNumber: "0912345678",
	},
	{
		id: "3",
		firstName: "Lê",
		lastName: "Minh Cường",
		email: "le.minhcuong@respira.vn",
		phoneNumber: "0923456789",
	},
	{
		id: "4",
		firstName: "Phạm",
		lastName: "Thu Dung",
		email: "pham.thudung@respira.vn",
		phoneNumber: "0934567890",
	},
];

export const MOCK_STATISTICS: StatisticsData = {
	totalDecision: [
		{ severity: "mild", count: 42 },
		{ severity: "moderate", count: 78 },
		{ severity: "severe", count: 35 },
		{ severity: "critical", count: 12 },
	],
	recommendationAccuracy: [
		{ month: 1, accuracy: 0.82 },
		{ month: 2, accuracy: 0.85 },
		{ month: 3, accuracy: 0.79 },
		{ month: 4, accuracy: 0.88 },
		{ month: 5, accuracy: 0.91 },
		{ month: 6, accuracy: 0.87 },
		{ month: 7, accuracy: 0.93 },
		{ month: 8, accuracy: 0.89 },
		{ month: 9, accuracy: 0.0 },
		{ month: 10, accuracy: 0.0 },
		{ month: 11, accuracy: 0.0 },
		{ month: 12, accuracy: 0.0 },
	],
	antibioticConsumptionRates: [
		{ category: "Access", count: 89, rate: 0.53 },
		{ category: "Watch", count: 58, rate: 0.35 },
		{ category: "Reserve", count: 15, rate: 0.09 },
		{ category: "Unclassified", count: 5, rate: 0.03 },
	],
};
