import { DoctorPathogenItem } from "./types";

export const MOCK_DOCTOR_PATHOGENS: DoctorPathogenItem[] = [
	{
		id: "1",
		name: "Haemophilus influenzae",
		description:
			"Chlamydia pneumoniae là một loại vi khuẩn nội bào bắt buộc gây nhiễm trùng đường hô hấp ở người như viêm họng, viêm phế quản và viêm phổi không điển hình",
		classification: "typical",
		characteristics: "Trực khuẩn Gram-âm nhỏ, đa hình thái, hiếu khí hoặc kỵ khí tùy tiện.",
		commonDiseases: ["Viêm phổi cộng đồng", "Đợt cấp COPD", "Viêm tai giữa", "Viêm xoang cấp"],
		recommendedAntibiotics: ["Amoxicillin/Clavulanate", "Ceftriaxone", "Cefuroxime", "Azithromycin"],
	},
	{
		id: "2",
		name: "Chlamydia pnuemoniae",
		description:
			"Haemophilus influenzae là một loài trực khuẩn Gram-âm, ký sinh chủ yếu ở đường hô hấp trên của người và có khả năng gây ra nhiều bệnh nhiễm trùng cấp tính nguy hiểm",
		classification: "atypical",
		characteristics: "Vi khuẩn nội bào bắt buộc, không bắt màu nhuộm Gram thông thường.",
		commonDiseases: ["Viêm phổi không điển hình", "Viêm phế quản", "Viêm họng"],
		recommendedAntibiotics: ["Azithromycin", "Clarithromycin", "Doxycycline", "Levofloxacin"],
	},
	{
		id: "3",
		name: "Legionella spp",
		description:
			"Legionella spp. (các loài Legionella) là một chi trực khuẩn Gram-âm, ký sinh nội bào bắt buộc, thường cư trú trong môi trường nước và là tác nhân gây ra bệnh nhiễm trùng hô hấp cấp tính nghiêm trọng ở người.",
		classification: "typical",
		characteristics: "Trực khuẩn Gram-âm, ký sinh nội bào trong đại thực bào phế nang.",
		commonDiseases: ["Bệnh Legionnaires (viêm phổi nặng)", "Sốt Pontiac"],
		recommendedAntibiotics: ["Levofloxacin", "Moxifloxacin", "Azithromycin"],
	},
	{
		id: "4",
		name: "Streptococcus pneumoniae",
		description:
			"Vi khuẩn Gram-dương hình cầu xếp đôi, là tác nhân vi khuẩn hàng đầu gây viêm phổi mắc phải tại cộng đồng (CAP) và viêm màng não.",
		classification: "typical",
		characteristics: "Song cầu Gram-dương hình ngọn nến, tan máu alpha trên thạch máu.",
		commonDiseases: ["Viêm phổi thùy", "Nhiễm khuẩn huyết", "Viêm màng não", "Viêm tai giữa"],
		recommendedAntibiotics: ["Amoxicillin liều cao", "Ceftriaxone", "Levofloxacin", "Vancomycin"],
	},
	{
		id: "5",
		name: "Mycoplasma pneumoniae",
		description:
			"Vi khuẩn không có vách tế bào, là nguyên nhân phổ biến gây viêm phổi không điển hình ở trẻ em, thanh thiếu niên và người trưởng thành trẻ tuổi.",
		classification: "atypical",
		characteristics: "Vi khuẩn nhỏ nhất có thể sống tự do, không có vách tế bào peptidoglycan.",
		commonDiseases: ["Viêm phổi không điển hình (Walking pneumonia)", "Viêm khí phế quản"],
		recommendedAntibiotics: ["Azithromycin", "Clarithromycin", "Doxycycline", "Moxifloxacin"],
	},
];

export function getPathogenById(id: string): DoctorPathogenItem | undefined {
	return MOCK_DOCTOR_PATHOGENS.find((p) => p.id === id);
}
