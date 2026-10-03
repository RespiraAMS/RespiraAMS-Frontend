// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiseaseItem {
	id: string;
	name: string;
	description: string;
	requiredIcuMainCriteria: number;
	requiredIcuSecondaryCriteria: number;
}

export interface CreateDiseaseRequest {
	name: string;
	description: string;
	requiredIcuMainCriteria: number;
	requiredIcuSecondaryCriteria: number;
}

export interface UpdateDiseaseRequest extends CreateDiseaseRequest {
	id: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_DISEASES: DiseaseItem[] = [
	{
		id: "1",
		name: "Viêm phổi cộng đồng (CAP)",
		description:
			"Viêm phổi mắc phải tại cộng đồng, do nhiều tác nhân vi khuẩn và virus gây ra, thường gặp nhất ở người cao tuổi và trẻ em.",
		requiredIcuMainCriteria: 1,
		requiredIcuSecondaryCriteria: 3,
	},
	{
		id: "2",
		name: "Viêm phổi bệnh viện (HAP)",
		description:
			"Viêm phổi xuất hiện sau 48 giờ nhập viện, thường do vi khuẩn đa kháng thuốc như Pseudomonas aeruginosa, Acinetobacter baumannii.",
		requiredIcuMainCriteria: 1,
		requiredIcuSecondaryCriteria: 2,
	},
	{
		id: "3",
		name: "Viêm phổi liên quan thở máy (VAP)",
		description:
			"Viêm phổi phát triển sau 48 giờ thở máy xâm lấn, biến chứng nghiêm trọng ở bệnh nhân ICU.",
		requiredIcuMainCriteria: 2,
		requiredIcuSecondaryCriteria: 2,
	},
	{
		id: "4",
		name: "Áp xe phổi",
		description:
			"Tình trạng hoại tử nhu mô phổi tạo thành ổ mủ, thường do vi khuẩn kị khí hoặc Staphylococcus aureus.",
		requiredIcuMainCriteria: 1,
		requiredIcuSecondaryCriteria: 3,
	},
	{
		id: "5",
		name: "Viêm phế quản cấp",
		description:
			"Viêm cấp tính niêm mạc phế quản, chủ yếu do virus (70-80%), triệu chứng chính là ho có đờm kéo dài 1-3 tuần.",
		requiredIcuMainCriteria: 1,
		requiredIcuSecondaryCriteria: 4,
	},
	{
		id: "6",
		name: "Tràn mủ màng phổi",
		description:
			"Tích tụ dịch mủ trong khoang màng phổi, thường là biến chứng của viêm phổi hoặc chấn thương lồng ngực.",
		requiredIcuMainCriteria: 1,
		requiredIcuSecondaryCriteria: 2,
	},
	{
		id: "7",
		name: "Lao phổi",
		description:
			"Bệnh nhiễm khuẩn do Mycobacterium tuberculosis, lây qua đường hô hấp, có thể tiến triển mạn tính và gây tổn thương phổi nặng.",
		requiredIcuMainCriteria: 1,
		requiredIcuSecondaryCriteria: 3,
	},
	{
		id: "8",
		name: "COPD đợt cấp",
		description:
			"Đợt bùng phát cấp tính của bệnh phổi tắc nghẽn mạn tính, đặc trưng bởi tăng khó thở, ho và khạc đờm đột ngột.",
		requiredIcuMainCriteria: 1,
		requiredIcuSecondaryCriteria: 3,
	},
];
