// ─── Types ────────────────────────────────────────────────────────────────────

export interface PathogenItem {
	id: string;
	name: string;
	description: string;
}

export interface CreatePathogenRequest {
	name: string;
	description: string;
}

export interface UpdatePathogenRequest {
	id: string;
	name: string;
	description: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_PATHOGENS: PathogenItem[] = [
	{
		id: "1",
		name: "Streptococcus pneumoniae",
		description:
			"Vi khuẩn gram dương hình cầu, là tác nhân hàng đầu gây viêm phổi cộng đồng, viêm màng não và nhiễm khuẩn huyết.",
	},
	{
		id: "2",
		name: "Klebsiella pneumoniae",
		description:
			"Vi khuẩn gram âm thuộc họ Enterobacteriaceae, gây viêm phổi bệnh viện, nhiễm khuẩn đường tiết niệu và nhiễm khuẩn huyết.",
	},
	{
		id: "3",
		name: "Pseudomonas aeruginosa",
		description:
			"Trực khuẩn gram âm không lên men, hay gặp ở bệnh nhân thở máy, bỏng và suy giảm miễn dịch.",
	},
	{
		id: "4",
		name: "Staphylococcus aureus",
		description:
			"Vi khuẩn gram dương hình cầu, bao gồm chủng MRSA kháng methicillin, gây viêm phổi, nhiễm khuẩn da và mô mềm.",
	},
	{
		id: "5",
		name: "Acinetobacter baumannii",
		description:
			"Cầu trực khuẩn gram âm, đa kháng thuốc, thường gây nhiễm khuẩn bệnh viện ở bệnh nhân nặng.",
	},
	{
		id: "6",
		name: "Haemophilus influenzae",
		description:
			"Trực khuẩn gram âm nhỏ, gây viêm phổi, viêm phế quản và nhiễm khuẩn đường hô hấp trên.",
	},
	{
		id: "7",
		name: "Mycoplasma pneumoniae",
		description:
			"Vi khuẩn không có vách tế bào, gây viêm phổi không điển hình, đặc biệt ở người trẻ và trẻ em.",
	},
	{
		id: "8",
		name: "Escherichia coli",
		description:
			"Trực khuẩn gram âm, tác nhân phổ biến gây nhiễm khuẩn đường tiết niệu, nhiễm khuẩn huyết và viêm phổi.",
	},
];
