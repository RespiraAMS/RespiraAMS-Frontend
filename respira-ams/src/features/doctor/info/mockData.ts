import { AntibioticResult, Pagination } from "./types";

export const FALLBACK_ANTIBIOTICS: AntibioticResult[] = [
	{
		id: "18a4ba5e-85a2-4a0b-93ff-18751ce30c01",
		name: "Amoxicilin",
		antibioticGroup: {
			id: "g1-beta-lactam",
			name: "B-lactam",
			description: "Penicillin phổ rộng diệt khuẩn bằng cách ức chế tổng hợp thành tế bào vi khuẩn.",
			parentId: null,
			parentName: null,
		},
		classification: "Access",
		dosages: [
			{
				id: "d1-standard",
				routeOfAdministration: "Oral",
				dose: "500 mg mỗi 8 giờ hoặc 875 mg mỗi 12 giờ (tối đa 3 g/ngày)",
				crcl: null, // Liều chuẩn
			},
			{
				id: "d1-gfr-normal",
				routeOfAdministration: "Oral",
				dose: "500 mg mỗi 8 giờ (liều chuẩn)",
				crcl: {
					min: 30,
					isMinExclusive: false,
					max: 999999,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
			{
				id: "d1-gfr-mod",
				routeOfAdministration: "Oral",
				dose: "250–500 mg mỗi 12 giờ",
				crcl: {
					min: 10,
					isMinExclusive: false,
					max: 29,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
			{
				id: "d1-gfr-severe",
				routeOfAdministration: "Oral",
				dose: "250–500 mg mỗi 24 giờ",
				crcl: {
					min: 0,
					isMinExclusive: false,
					max: 10,
					isMaxExclusive: true,
					unit: "mL/phút",
				},
			},
		],
	},
	{
		id: "28a4ba5e-85a2-4a0b-93ff-18751ce30c02",
		name: "Ceftazidime",
		antibioticGroup: {
			id: "g2-cephalosporin",
			name: "B-lactam",
			description: "Cephalosporin thế hệ 3 có hoạt tính kháng Pseudomonas aeruginosa.",
			parentId: null,
			parentName: null,
		},
		classification: "Watch",
		dosages: [
			{
				id: "d2-standard",
				routeOfAdministration: "Intravenous",
				dose: "1–2 g mỗi 8 giờ (tối đa 6 g/ngày)",
				crcl: null,
			},
			{
				id: "d2-gfr-normal",
				routeOfAdministration: "Intravenous",
				dose: "1–2 g mỗi 8 giờ",
				crcl: {
					min: 50,
					isMinExclusive: false,
					max: 999999,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
			{
				id: "d2-gfr-mod",
				routeOfAdministration: "Intravenous",
				dose: "1 g mỗi 12–24 giờ",
				crcl: {
					min: 10,
					isMinExclusive: false,
					max: 49,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
			{
				id: "d2-gfr-severe",
				routeOfAdministration: "Intravenous",
				dose: "500 mg mỗi 24–48 giờ",
				crcl: {
					min: 0,
					isMinExclusive: false,
					max: 10,
					isMaxExclusive: true,
					unit: "mL/phút",
				},
			},
		],
	},
	{
		id: "38a4ba5e-85a2-4a0b-93ff-18751ce30c03",
		name: "Linezolid",
		antibioticGroup: {
			id: "g3-oxazolidinone",
			name: "Oxazolidinone",
			description: "Kháng sinh nhóm Oxazolidinone đặc trị vi khuẩn Gram-dương kháng thuốc (MRSA, VRE).",
			parentId: null,
			parentName: null,
		},
		classification: "Reserve",
		dosages: [
			{
				id: "d3-standard",
				routeOfAdministration: "Intravenous",
				dose: "600 mg mỗi 12 giờ",
				crcl: null,
			},
			{
				id: "d3-standard-oral",
				routeOfAdministration: "Oral",
				dose: "600 mg mỗi 12 giờ",
				crcl: null,
			},
			{
				id: "d3-gfr-all",
				routeOfAdministration: "Intravenous",
				dose: "600 mg mỗi 12 giờ (Không cần chỉnh liều theo chức năng thận)",
				crcl: {
					min: 0,
					isMinExclusive: false,
					max: 999999,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
		],
	},
	{
		id: "48a4ba5e-85a2-4a0b-93ff-18751ce30c04",
		name: "Ceftriaxone",
		antibioticGroup: {
			id: "g2-cephalosporin",
			name: "B-lactam",
			description: "Cephalosporin thế hệ 3 phổ rộng dùng trong nhiễm khuẩn hô hấp nặng và viêm màng não.",
			parentId: null,
			parentName: null,
		},
		classification: "Watch",
		dosages: [
			{
				id: "d4-standard",
				routeOfAdministration: "Intravenous",
				dose: "1–2 g mỗi 24 giờ (tối đa 4 g/ngày)",
				crcl: null,
			},
			{
				id: "d4-gfr-normal",
				routeOfAdministration: "Intravenous",
				dose: "1–2 g mỗi 24 giờ (không cần giảm liều khi suy thận nhẹ/vừa)",
				crcl: {
					min: 10,
					isMinExclusive: false,
					max: 999999,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
			{
				id: "d4-gfr-severe",
				routeOfAdministration: "Intravenous",
				dose: "Tối đa 2 g mỗi 24 giờ",
				crcl: {
					min: 0,
					isMinExclusive: false,
					max: 10,
					isMaxExclusive: true,
					unit: "mL/phút",
				},
			},
		],
	},
	{
		id: "58a4ba5e-85a2-4a0b-93ff-18751ce30c05",
		name: "Meropenem",
		antibioticGroup: {
			id: "g4-carbapenem",
			name: "Carbapenem",
			description: "Kháng sinh nhóm Carbapenem phổ cực rộng dành cho nhiễm khuẩn bệnh viện nặng.",
			parentId: null,
			parentName: null,
		},
		classification: "Reserve",
		dosages: [
			{
				id: "d5-standard",
				routeOfAdministration: "Intravenous",
				dose: "1 g mỗi 8 giờ truyền tĩnh mạch trong 3 giờ",
				crcl: null,
			},
			{
				id: "d5-gfr-mod",
				routeOfAdministration: "Intravenous",
				dose: "1 g mỗi 12 giờ",
				crcl: {
					min: 26,
					isMinExclusive: false,
					max: 50,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
			{
				id: "d5-gfr-low",
				routeOfAdministration: "Intravenous",
				dose: "500 mg mỗi 12 giờ",
				crcl: {
					min: 10,
					isMinExclusive: false,
					max: 25,
					isMaxExclusive: false,
					unit: "mL/phút",
				},
			},
			{
				id: "d5-gfr-severe",
				routeOfAdministration: "Intravenous",
				dose: "500 mg mỗi 24 giờ",
				crcl: {
					min: 0,
					isMinExclusive: false,
					max: 10,
					isMaxExclusive: true,
					unit: "mL/phút",
				},
			},
		],
	},
];

export const FALLBACK_PAGINATION: Pagination<AntibioticResult> = {
	metadata: {
		currentPage: 1,
		pageSize: 8,
		pageCount: 1,
		totalItemCount: FALLBACK_ANTIBIOTICS.length,
		hasNextPage: false,
		hasPreviousPage: false,
	},
	items: FALLBACK_ANTIBIOTICS,
};

export function getAntibioticById(id: string): AntibioticResult | undefined {
	return FALLBACK_ANTIBIOTICS.find(
		(a) => a.id.toLowerCase() === id.toLowerCase()
	);
}

// Giữ lại alias để không làm gãy các component cũ nếu có import
export const LOOKUP_ANTIBIOTICS = FALLBACK_ANTIBIOTICS;
