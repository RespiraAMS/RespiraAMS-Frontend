import { KpiMetric, PathogenData, WeeklyDiagnosisData } from "../types";

export const MOCK_KPIS: KpiMetric[] = [
	{
		id: "diagnosis",
		title: "Chẩn đoán lâm sàng",
		value: 128,
		changePercent: 12,
		subtitle: "Tổng số hồ sơ chẩn đoán đợt này",
		type: "diagnosis",
	},
	{
		id: "treatment",
		title: "Đã lưu / Điều trị",
		value: 116,
		changePercent: 9,
		subtitle: "Phác đồ áp dụng thành công",
		type: "treatment",
	},
	{
		id: "microbiology",
		title: "Vi sinh",
		value: 34,
		changePercent: 5,
		subtitle: "Mẫu cấy dương tính vi khuẩn",
		type: "microbiology",
	},
];

export const MOCK_WEEKLY_DIAGNOSES: WeeklyDiagnosisData[] = [
	{ week: "T1", fullLabel: "Tuần 1", count: 48 },
	{ week: "T2", fullLabel: "Tuần 2", count: 62 },
	{ week: "T3", fullLabel: "Tuần 3", count: 53 },
	{ week: "T4", fullLabel: "Tuần 4", count: 82 },
	{ week: "T5", fullLabel: "Tuần 5", count: 68 },
	{ week: "T6", fullLabel: "Tuần 6", count: 94 },
];

export const MOCK_PATHOGENS: PathogenData[] = [
	{
		id: "spn",
		name: "Streptococcus pneumoniae",
		count: 32,
		percentage: 78,
		barColor: "#0EA5E9",
		sensitivityText: "Độ nhạy Cefotaxime: 84%",
		extraInfo: "Tỷ lệ phân lập: 42%",
	},
	{
		id: "kpn",
		name: "Klebsiella pneumoniae (ESBL+)",
		count: 24,
		percentage: 58,
		barColor: "#F59E0B",
		sensitivityText: "Độ nhạy Meropenem: 71%",
		extraInfo: "Cảnh báo ESBL",
		isWarning: true,
		warningColor: "text-amber-500",
	},
	{
		id: "pae",
		name: "Pseudomonas aeruginosa",
		count: 18,
		percentage: 44,
		barColor: "#14B8A6",
		sensitivityText: "Độ nhạy Piperacillin/Tazo: 66%",
		extraInfo: "Trực khuẩn mủ xanh",
	},
	{
		id: "aba",
		name: "Acinetobacter baumannii (CRAB)",
		count: 14,
		percentage: 34,
		barColor: "#EF4444",
		sensitivityText: "Độ nhạy Colistin: 92%",
		extraInfo: "Kháng Carbapenem",
		isWarning: true,
		warningColor: "text-rose-500",
	},
	{
		id: "sau",
		name: "Staphylococcus aureus (MRSA)",
		count: 11,
		percentage: 27,
		barColor: "#8B5CF6",
		sensitivityText: "Độ nhạy Vancomycin: 100%",
		extraInfo: "MRSA 68%",
	},
];
