import { AntibioticGroupItem } from "./types";

export const MOCK_ANTIBIOTIC_GROUPS: AntibioticGroupItem[] = [
	{
		id: "1",
		name: "B-lactam",
		description:
			"Nhóm kháng sinh có vòng beta-lactam trong cấu trúc, gồm penicillin, cephalosporin, carbapenem và monobactam. Là nhóm được sử dụng rộng rãi nhất trong điều trị nhiễm khuẩn hô hấp.",
		mechanism: "Ức chế tổng hợp vách tế bào vi khuẩn bằng cách gắn vào protein gắn penicillin (PBP).",
		antibiotics: ["Amoxicilin", "Cefazidim", "Ceftriaxone", "Meropenem"],
	},
	{
		id: "2",
		name: "Macrolid",
		description:
			"Nhóm kháng sinh có vòng lacton lớn, hiệu quả trên các tác nhân không điển hình như Mycoplasma, Chlamydia và Legionella, thường dùng thay thế khi dị ứng penicillin.",
		mechanism: "Gắn vào tiểu đơn vị 50S của ribosome, ức chế tổng hợp protein của vi khuẩn.",
		antibiotics: ["Azithromycin", "Clarithromycin", "Erythromycin"],
	},
	{
		id: "3",
		name: "Fluoroquinolon",
		description:
			"Nhóm kháng sinh phổ rộng, thấm tốt vào mô phổi. Các thế hệ mới (levofloxacin, moxifloxacin) có hoạt tính tốt trên phế cầu và tác nhân không điển hình.",
		mechanism: "Ức chế enzym DNA gyrase và topoisomerase IV, ngăn cản sao chép DNA.",
		antibiotics: ["Levofloxacin", "Moxifloxacin", "Ciprofloxacin"],
	},
	{
		id: "4",
		name: "Glycopeptid",
		description:
			"Nhóm kháng sinh phân tử lớn, chỉ tác dụng trên vi khuẩn Gram dương, là lựa chọn quan trọng trong điều trị nhiễm khuẩn do MRSA.",
		mechanism: "Gắn vào tiền chất D-Ala-D-Ala, ức chế tổng hợp peptidoglycan của vách tế bào.",
		antibiotics: ["Vancomycin", "Teicoplanin"],
	},
	{
		id: "5",
		name: "Oxazolidinon",
		description:
			"Nhóm kháng sinh tổng hợp, có hoạt tính trên vi khuẩn Gram dương đa kháng như MRSA và VRE. Được xếp vào nhóm dự trữ.",
		mechanism: "Gắn vào tiểu đơn vị 50S, ngăn hình thành phức hợp khởi đầu tổng hợp protein.",
		antibiotics: ["Linezolit", "Tedizolid"],
	},
	{
		id: "6",
		name: "Tetracyclin",
		description:
			"Nhóm kháng sinh phổ rộng kìm khuẩn, có tác dụng trên tác nhân nội bào và không điển hình như Chlamydia và Mycoplasma.",
		mechanism: "Gắn vào tiểu đơn vị 30S của ribosome, ngăn gắn aminoacyl-tRNA.",
		antibiotics: ["Doxycycline", "Tigecycline"],
	},
];

export function getGroupCount(): number {
	return MOCK_ANTIBIOTIC_GROUPS.length;
}
