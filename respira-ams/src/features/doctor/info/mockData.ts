import { AntibioticLookupItem } from "./types";

export const LOOKUP_ANTIBIOTICS: AntibioticLookupItem[] = [
	{
		id: "1",
		name: "Amoxicilin",
		subtitle: "Penicillin phổ rộng",
		group: "B-lactam",
		aware: "Access",
		dosage: { route: "Đường uống", standard: "500 mg mỗi 8 giờ", max: "3 g/ngày" },
		gfr: [
			{ range: "GFR ≥ 30 mL/phút", route: "Đường uống", label: "Chuẩn" },
			{ range: "GFR 10–29 mL/phút", route: "Đường uống", label: "Theo dõi" },
			{ range: "GFR < 10 mL/phút", route: "Đường uống", label: "Giảm liều" },
		],
	},
	{
		id: "2",
		name: "Cefazidim",
		subtitle: "Cephalosporin thế hệ 3",
		group: "B-lactam",
		aware: "Watch",
		dosage: { route: "Tiêm tĩnh mạch", standard: "2 g mỗi 8 giờ", max: "6 g/ngày" },
		gfr: [
			{ range: "GFR ≥ 50 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Chuẩn" },
			{ range: "GFR 10–49 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Theo dõi" },
			{ range: "GFR < 10 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Giảm liều" },
		],
	},
	{
		id: "3",
		name: "Linezolit",
		subtitle: "Oxazolidinone",
		group: "Other",
		aware: "Reserve",
		dosage: { route: "Tiêm tĩnh mạch", standard: "600 mg mỗi 12 giờ", max: "1.200 mg/ngày" },
		gfr: [
			{ range: "GFR ≥ 30 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Chuẩn" },
			{ range: "GFR 10–29 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Chuẩn" },
			{ range: "GFR < 10 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Theo dõi" },
		],
	},
	{
		id: "4",
		name: "Ceftriaxone",
		subtitle: "Cephalosporin thế hệ 3",
		group: "B-lactam",
		aware: "Watch",
		dosage: { route: "Tiêm tĩnh mạch", standard: "2 g mỗi 24 giờ", max: "4 g/ngày" },
		gfr: [
			{ range: "GFR ≥ 50 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Chuẩn" },
			{ range: "GFR 10–49 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Theo dõi" },
			{ range: "GFR < 10 mL/phút", route: "Đường tiêm tĩnh mạch", label: "Giảm liều" },
		],
	},
];

export function getAntibioticById(id: string) {
	return LOOKUP_ANTIBIOTICS.find((a) => a.id === id);
}
