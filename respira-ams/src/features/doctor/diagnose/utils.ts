import { RawValueRange, ValueRange } from "./types";

const UNBOUNDED = 1e20;

export interface FieldMeta {
	id: string;
	name: string;
	valueType: string;
	isRequired: boolean;
	unit: string | null;
	acceptedRange: ValueRange | null;
	normalRange: ValueRange | null;
}

export interface FieldStatus {
	error: string | null;
	warning: string | null;
}

export function normalizeRange(raw?: RawValueRange | ValueRange | null): ValueRange | null {
	if (!raw) return null;
	const r = raw as Record<string, unknown>;
	const pick = (a: unknown, b: unknown) => (a !== undefined && a !== null ? a : b);
	const minVal = pick(r.min, r.Min);
	const maxVal = pick(r.max, r.Max);

	const range: ValueRange = {
		min: minVal !== undefined && minVal !== null && minVal !== "" ? Number(minVal) : null,
		max: maxVal !== undefined && maxVal !== null && maxVal !== "" ? Number(maxVal) : null,
		isMinExclusive: !!pick(r.isMinExclusive, r.IsMinExclusive),
		isMaxExclusive: !!pick(r.isMaxExclusive, r.IsMaxExclusive),
		unit: (pick(r.unit, r.Unit) as string) || null,
	};

	if (range.min !== null) {
		if (!Number.isFinite(range.min) || range.min < -UNBOUNDED) range.min = null;
	}
	if (range.max !== null) {
		if (!Number.isFinite(range.max) || range.max > UNBOUNDED) range.max = null;
	}
	if (range.min === null && range.max === null) return null;
	return range;
}

export function inRange(value: number, range?: ValueRange | null): boolean {
	if (!range) return true;
	if (range.min !== null) {
		if (range.isMinExclusive ? value <= range.min : value < range.min) return false;
	}
	if (range.max !== null) {
		if (range.isMaxExclusive ? value >= range.max : value > range.max) return false;
	}
	return true;
}

export function describeRange(range?: ValueRange | null, unit?: string | null): string {
	if (!range) return "";
	const u = unit || range.unit;
	const suffix = u ? ` ${u}` : "";
	const minOp = range.isMinExclusive ? ">" : "≥";
	const maxOp = range.isMaxExclusive ? "<" : "≤";
	if (range.min !== null && range.max !== null) {
		return `${minOp} ${range.min} và ${maxOp} ${range.max}${suffix}`;
	}
	if (range.min !== null) return `${minOp} ${range.min}${suffix}`;
	if (range.max !== null) return `${maxOp} ${range.max}${suffix}`;
	return "";
}

export function normalPlaceholder(range?: ValueRange | null): string {
	if (!range) return "Nhập giá trị";
	if (range.min !== null && range.max !== null) return `Bình thường: ${range.min} - ${range.max}`;
	if (range.min !== null) return `Bình thường: ≥ ${range.min}`;
	return `Bình thường: ≤ ${range.max}`;
}

const CATEGORY_ENUM_ORDER = ["PersonalInformation", "Paraclinical", "Clinical"];
const CATEGORY_DISPLAY_ORDER = ["PersonalInformation", "Clinical", "Paraclinical"];
export const CATEGORY_LABELS: Record<string, string> = {
	PersonalInformation: "Thông tin hành chính & Nhân thân",
	Clinical: "Dấu hiệu & Triệu chứng lâm sàng",
	Paraclinical: "Chỉ số cận lâm sàng & Xét nghiệm",
};

export function normalizeCategoryKey(raw?: unknown): string {
	if (raw === undefined || raw === null || raw === "") return "Khác";
	const text = String(raw).trim();
	if (/^\d+$/.test(text)) {
		return CATEGORY_ENUM_ORDER[Number(text)] || "Khác";
	}
	const match = Object.keys(CATEGORY_LABELS).find(
		(key) => key.toLowerCase() === text.toLowerCase()
	);
	return match || text;
}

export function categoryRank(key: string): number {
	const idx = CATEGORY_DISPLAY_ORDER.indexOf(key);
	return idx === -1 ? CATEGORY_DISPLAY_ORDER.length : idx;
}

export function formatTreatmentSite(site?: string): string {
	if (!site) return "Chưa xác định";
	const s = site.toLowerCase();
	if (s === "outpatient") return "Ngoại trú";
	if (s === "inpatient") return "Nội trú";
	if (s === "intensivecareunit" || s === "icu") return "Khoa Hồi sức tích cực (ICU)";
	return site;
}

export function formatSeverity(severity?: string): string {
	if (!severity) return "Chưa xác định";
	const s = severity.toLowerCase();
	if (s === "mild") return "Nhẹ";
	if (s === "moderate") return "Trung bình";
	if (s === "severe") return "Nặng";
	return severity;
}

/** Giá trị mặc định cho trường Boolean / Categorical khi mở form hoặc đặt lại. */
export function buildInitialValues(
	variables: import("./types").ClinicalVariable[]
): Record<string, string> {
	const initial: Record<string, string> = {};
	variables.forEach((v) => {
		const id = String(v.id || v.Id);
		const vt = v.valueType || v.ValueType;
		if (vt === "Boolean") {
			initial[id] = "false";
		} else if (vt === "Categorical") {
			const options = v.acceptedValues || v.AcceptedValues || [];
			if (options.length > 0) initial[id] = options[0];
		}
	});
	return initial;
}

export function severityBadgeClass(severity?: string): string {
	const s = (severity || "").toLowerCase();
	if (s === "mild") return "bg-emerald-100 text-emerald-800";
	if (s === "moderate") return "bg-amber-100 text-amber-800";
	return "bg-red-100 text-red-800";
}

