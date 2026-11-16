export const severityLabels: Record<string, string> = {
	mild: "Nhẹ",
	moderate: "Trung bình",
	severe: "Nặng",
	critical: "Nguy kịch",
};

export const treatmentSiteLabels: Record<string, string> = {
	outpatient: "Ngoại trú",
	inpatient: "Nội trú",
	intensivecareunit: "Khoa ICU",
};

/** Case-insensitive lookup (backend returns PascalCase enum names). */
export function labelOf(map: Record<string, string>, value: string): string {
	return map[value?.toLowerCase() ?? ""] ?? value;
}
