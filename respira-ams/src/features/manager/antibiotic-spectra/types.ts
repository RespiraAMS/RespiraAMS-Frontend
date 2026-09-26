// ─── Types ────────────────────────────────────────────────────────────────────

export interface AntibioticSpectrumItem {
	id: string;
	name: string;
	description: string;
}

export interface CreateAntibioticSpectrumRequest {
	name: string;
	description: string;
}

export interface UpdateAntibioticSpectrumRequest {
	id: string;
	name: string;
	description: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_ANTIBIOTIC_SPECTRA: AntibioticSpectrumItem[] = [
	{
		id: "1",
		name: "Gram-dương (Gram-positive)",
		description:
			"Bao gồm các vi khuẩn có lớp peptidoglycan dày giữ màu crystal violet, như Staphylococcus, Streptococcus và Enterococcus.",
	},
	{
		id: "2",
		name: "Gram-âm (Gram-negative)",
		description:
			"Bao gồm các vi khuẩn có lớp peptidoglycan mỏng và màng ngoài, như Escherichia coli, Klebsiella, Pseudomonas và Acinetobacter.",
	},
	{
		id: "3",
		name: "Phổ rộng (Broad-spectrum)",
		description:
			"Có hiệu quả đối với cả vi khuẩn gram-dương và gram-âm. Bao gồm carbapenem, fluoroquinolone và cephalosporin thế hệ 3–4.",
	},
	{
		id: "4",
		name: "Kỵ khí (Anaerobic)",
		description:
			"Nhắm vào vi khuẩn kỵ khí phát triển trong môi trường không có oxy, như Bacteroides fragilis và Clostridium difficile.",
	},
	{
		id: "5",
		name: "Tác nhân không điển hình (Atypical pathogens)",
		description:
			"Bao gồm các vi sinh vật không phân loại theo gram truyền thống: Mycoplasma pneumoniae, Chlamydophila pneumoniae, Legionella pneumophila.",
	},
	{
		id: "6",
		name: "Phổ hẹp – chỉ gram-dương",
		description:
			"Chỉ nhắm vào vi khuẩn gram-dương. Bao gồm vancomycin và penicillin G, dùng khi chỉ cần điều trị gram-dương để giảm áp lực kháng thuốc.",
	},
	{
		id: "7",
		name: "Kháng MRSA (Anti-MRSA)",
		description:
			"Đặc hiệu với Staphylococcus aureus kháng methicillin (MRSA), bao gồm vancomycin, linezolid, daptomycin và ceftaroline.",
	},
];
