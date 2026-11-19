import {
	ALLERGY_TYPE_OPTIONS,
	type AllergyType,
	AWARE_LABELS,
	type AwareClassification,
	CATEGORY_LABELS,
	type ClinicalVariableDto,
	type DiagnosisResultDto,
	INFECTION_TYPES,
	MIC_CATEGORIES,
	type MicCategory,
	type NormalizedRange,
	type RangeDto,
	SAMPLE_TYPES,
	type SeverityLevel,
	type TreatmentSite,
	type VariableCategory,
} from "./types";

const UNBOUNDED = 1e20;

export type DiagnoseTranslateFn = (
	key: string,
	values?: Record<string, string | number>
) => string;

/**
 * Clinical variables whose values are sourced from the patient profile
 * (age, gender, weight, height). They are shown in the assessment form for
 * context but must not be edited there — the patient record is the source of
 * truth.
 */
export const PATIENT_PROFILE_VARIABLE_CODES = [
	"AGE",
	"GENDER",
	"WEIGHT",
	"HEIGHT",
] as const;

export function isPatientProfileVariable(
	variable: Pick<ClinicalVariableDto, "code">
): boolean {
	const code = (variable.code || "").trim().toUpperCase();
	return (PATIENT_PROFILE_VARIABLE_CODES as readonly string[]).includes(code);
}

export function calculateAge(dateOfBirth?: string): number | undefined {
	if (!dateOfBirth) return undefined;
	const dob = new Date(dateOfBirth);
	if (Number.isNaN(dob.getTime())) return undefined;
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();
	const monthDiff = today.getMonth() - dob.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
		age--;
	}
	return age >= 0 ? age : undefined;
}

export function parseDiagnosisJson(rawDiagnosis?: string | null): DiagnosisResultDto | null {
	if (!rawDiagnosis || typeof rawDiagnosis !== "string") return null;
	try {
		return JSON.parse(rawDiagnosis) as DiagnosisResultDto;
	} catch {
		return null;
	}
}

/**
 * Normalize the `detail` payload of a diagnose API error into a map of
 * clinical variable id -> validation message.
 *
 * The backend returns a JSON object (`Dictionary<Guid, string>`), but be
 * defensive about arrays/other shapes so an unexpected payload never breaks
 * the form.
 */
export function normalizeObservationErrorDetails(
	detail: unknown
): Record<string, string> {
	if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
		return {};
	}

	const normalized: Record<string, string> = {};
	for (const [key, value] of Object.entries(detail as Record<string, unknown>)) {
		if (typeof value === "string" && value.trim()) {
			normalized[key] = value.trim();
		} else if (Array.isArray(value)) {
			const joined = value
				.filter((item): item is string => typeof item === "string" && item.trim() !== "")
				.join(", ");
			if (joined) normalized[key] = joined;
		}
	}
	return normalized;
}

export function extractPreviousObservations(
	previousDiagnosis: DiagnosisResultDto | null,
	variables: ClinicalVariableDto[]
): Record<string, string | boolean> {
	if (!previousDiagnosis) return {};

	const byId = new Map<string, string | number | boolean>();
	const byCode = new Map<string, string | number | boolean>();

	const collectFromEvidences = (evidences?: DiagnosisResultDto["evidences"]) => {
		if (!Array.isArray(evidences)) return;
		for (const ev of evidences) {
			if (!Array.isArray(ev.relatedObservations)) continue;
			for (const obs of ev.relatedObservations) {
				if (!obs?.variable) continue;
				if (obs.variable.id) byId.set(obs.variable.id, obs.value);
				if (obs.variable.code) byCode.set(obs.variable.code, obs.value);
			}
		}
	};

	collectFromEvidences(previousDiagnosis.evidences);
	if (Array.isArray(previousDiagnosis.metricsSeverityDiagnosis)) {
		for (const metric of previousDiagnosis.metricsSeverityDiagnosis) {
			collectFromEvidences(metric.evidences);
		}
	}

	const mapped: Record<string, string | boolean> = {};
	for (const v of variables) {
		const rawVal = byId.has(v.id) ? byId.get(v.id) : byCode.get(v.code);
		if (rawVal === undefined || rawVal === null) continue;

		if (v.valueType === "Boolean") {
			mapped[v.id] =
				typeof rawVal === "boolean"
					? rawVal
					: String(rawVal).toLowerCase() === "true";
		} else if (v.valueType === "Categorical") {
			const strVal = String(rawVal);
			const matchedOption = v.acceptedValues?.find(
				(opt) => opt.toLowerCase() === strVal.toLowerCase()
			);
			mapped[v.id] = matchedOption || strVal;
		} else {
			mapped[v.id] = plainNumber(String(rawVal));
		}
	}

	return mapped;
}

export function normalizeRange(raw?: RangeDto | null): NormalizedRange | null {
	if (!raw) return null;

	const minRaw = raw.min !== undefined && raw.min !== null ? Number(raw.min) : null;
	const maxRaw = raw.max !== undefined && raw.max !== null ? Number(raw.max) : null;

	const min =
		minRaw !== null && Number.isFinite(minRaw) && minRaw >= -UNBOUNDED ? minRaw : null;
	const max =
		maxRaw !== null && Number.isFinite(maxRaw) && maxRaw <= UNBOUNDED ? maxRaw : null;

	if (min === null && max === null) return null;

	return {
		min,
		max,
		isMinExclusive: Boolean(raw.isMinExclusive),
		isMaxExclusive: Boolean(raw.isMaxExclusive),
		unit: raw.unit || null,
	};
}

export function inRange(value: number, range: NormalizedRange | null): boolean {
	if (!range) return true;
	if (range.min !== null) {
		if (range.isMinExclusive ? value <= range.min : value < range.min) return false;
	}
	if (range.max !== null) {
		if (range.isMaxExclusive ? value >= range.max : value > range.max) return false;
	}
	return true;
}

export function describeRange(
	range: NormalizedRange | null,
	unit?: string | null,
	t?: DiagnoseTranslateFn
): string {
	if (!range) return "";
	const suffix = unit || range.unit ? ` ${unit || range.unit}` : "";
	const minOp = range.isMinExclusive ? ">" : "≥";
	const maxOp = range.isMaxExclusive ? "<" : "≤";
	const andWord = t ? t("range.and") : "và";

	if (range.min !== null && range.max !== null) {
		return `${minOp} ${range.min} ${andWord} ${maxOp} ${range.max}${suffix}`;
	}
	if (range.min !== null) return `${minOp} ${range.min}${suffix}`;
	if (range.max !== null) return `${maxOp} ${range.max}${suffix}`;
	return "";
}

export function getNormalPlaceholder(
	variable: ClinicalVariableDto,
	t?: DiagnoseTranslateFn
): string {
	const range = normalizeRange(variable.normalRange);
	if (!range) {
		return t ? t("range.placeholderDefault") : "Nhập giá trị...";
	}
	if (range.min !== null && range.max !== null) {
		return t
			? t("range.placeholderBetween", { min: range.min, max: range.max })
			: `Bình thường: ${range.min} – ${range.max}`;
	}
	if (range.min !== null) {
		return t
			? t("range.placeholderMin", { min: range.min })
			: `Bình thường: ≥ ${range.min}`;
	}
	return t
		? t("range.placeholderMax", { max: range.max as number })
		: `Bình thường: ≤ ${range.max}`;
}

export function plainNumber(value: string | number): string {
	const text = String(value ?? "").trim();
	if (!/[eE]/.test(text)) return text;
	const num = Number(text);
	if (!Number.isFinite(num)) return text;
	return num.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 20 });
}

export interface VariableValidationResult {
	error: string | null;
	warning: string | null;
}

export function validateVariableValue(
	variable: ClinicalVariableDto,
	rawValue: string | boolean | undefined,
	t?: DiagnoseTranslateFn
): VariableValidationResult {
	const isEmpty =
		rawValue === undefined || rawValue === null || String(rawValue).trim() === "";

	if (isEmpty) {
		if (variable.isRequired) {
			return {
				error: t
					? t("validation.required", { name: variable.name })
					: `Vui lòng nhập "${variable.name}".`,
				warning: null,
			};
		}
		return { error: null, warning: null };
	}

	if (variable.valueType === "Numeric") {
		const num = Number(rawValue);
		if (!Number.isFinite(num)) {
			return {
				error: t
					? t("validation.invalidNumber")
					: "Giá trị phải là một số hợp lệ.",
				warning: null,
			};
		}

		const accepted = normalizeRange(variable.acceptedRange);
		if (!inRange(num, accepted)) {
			const rangeText = describeRange(accepted, variable.canonicalUnit, t);
			return {
				error: t
					? t("validation.outOfAcceptedRange", { range: rangeText })
					: `Giá trị nằm ngoài ngưỡng cho phép (${rangeText}).`,
				warning: null,
			};
		}

		const normal = normalizeRange(variable.normalRange);
		if (!inRange(num, normal)) {
			const rangeText = describeRange(normal, variable.canonicalUnit, t);
			return {
				error: null,
				warning: t
					? t("validation.outOfNormalRange", { range: rangeText })
					: `Ngoài khoảng bình thường (${rangeText}). Hệ thống vẫn chấp nhận.`,
			};
		}
	}

	return { error: null, warning: null };
}

export function getCategoryLabel(
	category: VariableCategory | string,
	t?: DiagnoseTranslateFn
): string {
	if (category in CATEGORY_LABELS) {
		return t
			? t(`categories.${category}`)
			: CATEGORY_LABELS[category as VariableCategory];
	}
	return category;
}

export function getAllergyTypeLabel(
	type: AllergyType | string,
	t?: DiagnoseTranslateFn
): string {
	const found = ALLERGY_TYPE_OPTIONS.find((item) => item.value === type);
	if (found) {
		return t ? t(`allergyTypes.${found.value}`) : found.label;
	}
	return type;
}

export function getMicCategoryLabel(
	mic: MicCategory | string,
	t?: DiagnoseTranslateFn
): string {
	const found = MIC_CATEGORIES.find((item) => item.value === mic);
	if (found) {
		return t ? t(`micCategories.${found.value}`) : found.label;
	}
	return mic;
}

export function getAwareLabel(
	classification: AwareClassification | string,
	t?: DiagnoseTranslateFn
): string {
	if (classification in AWARE_LABELS) {
		return t
			? t(`awareClassifications.${classification}`)
			: AWARE_LABELS[classification as AwareClassification];
	}
	return classification;
}

export function formatSeverityLabel(
	severity: SeverityLevel | string,
	t?: DiagnoseTranslateFn
): string {
	switch (severity) {
		case "Mild":
			return t ? t("severity.Mild") : "Nhẹ (Mild)";
		case "Moderate":
			return t ? t("severity.Moderate") : "Trung bình (Moderate)";
		case "Severe":
			return t ? t("severity.Severe") : "Nặng (Severe)";
		default:
			return severity;
	}
}

export function formatTreatmentSiteLabel(
	site: TreatmentSite | string,
	t?: DiagnoseTranslateFn
): string {
	switch (site) {
		case "Outpatient":
			return t ? t("treatmentSite.Outpatient") : "Ngoại trú (Outpatient)";
		case "Inpatient":
			return t ? t("treatmentSite.Inpatient") : "Nội trú (Inpatient)";
		case "IntensiveCareUnit":
			return t
				? t("treatmentSite.IntensiveCareUnit")
				: "Hồi sức tích cực (ICU)";
		default:
			return site;
	}
}

export function getSampleTypeLabel(
	sampleType: number | string | undefined,
	t?: DiagnoseTranslateFn
): string {
	if (sampleType === undefined || sampleType === null) {
		return t ? t("sampleTypes.Unknown") : "Không rõ";
	}
	const found = SAMPLE_TYPES.find(
		(s) => s.value === Number(sampleType) || s.name === String(sampleType)
	);
	if (found) {
		return t ? t(`sampleTypes.${found.name}`) : found.label;
	}
	return String(sampleType);
}

export function getInfectionTypeLabel(
	infectionName: string,
	t?: DiagnoseTranslateFn
): string {
	const found = INFECTION_TYPES.find((item) => item.name === infectionName);
	if (found) {
		return t ? t(`infectionTypes.${found.name}`) : found.label;
	}
	return infectionName;
}