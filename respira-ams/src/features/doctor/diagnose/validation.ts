import {
    type ClinicalVariableDto,
    type DiagnosisResultDto,
    type NormalizedRange,
    type RangeDto,
    SAMPLE_TYPES,
    type SeverityLevel,
    type TreatmentSite,
} from "./types";

const UNBOUNDED = 1e20;

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

    const min = minRaw !== null && Number.isFinite(minRaw) && minRaw >= -UNBOUNDED ? minRaw : null;
    const max = maxRaw !== null && Number.isFinite(maxRaw) && maxRaw <= UNBOUNDED ? maxRaw : null;

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

export function describeRange(range: NormalizedRange | null, unit?: string | null): string {
    if (!range) return "";
    const suffix = unit || range.unit ? ` ${unit || range.unit}` : "";
    const minOp = range.isMinExclusive ? ">" : "≥";
    const maxOp = range.isMaxExclusive ? "<" : "≤";

    if (range.min !== null && range.max !== null) {
        return `${minOp} ${range.min} và ${maxOp} ${range.max}${suffix}`;
    }
    if (range.min !== null) return `${minOp} ${range.min}${suffix}`;
    if (range.max !== null) return `${maxOp} ${range.max}${suffix}`;
    return "";
}

export function getNormalPlaceholder(variable: ClinicalVariableDto): string {
    const range = normalizeRange(variable.normalRange);
    if (!range) return "Nhập giá trị...";
    if (range.min !== null && range.max !== null) return `Bình thường: ${range.min} – ${range.max}`;
    if (range.min !== null) return `Bình thường: ≥ ${range.min}`;
    return `Bình thường: ≤ ${range.max}`;
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
    rawValue: string | boolean | undefined
): VariableValidationResult {
    const isEmpty = rawValue === undefined || rawValue === null || String(rawValue).trim() === "";

    if (isEmpty) {
        if (variable.isRequired) {
            return { error: `Vui lòng nhập "${variable.name}".`, warning: null };
        }
        return { error: null, warning: null };
    }

    if (variable.valueType === "Numeric") {
        const num = Number(rawValue);
        if (!Number.isFinite(num)) {
            return { error: "Giá trị phải là một số hợp lệ.", warning: null };
        }

        const accepted = normalizeRange(variable.acceptedRange);
        if (!inRange(num, accepted)) {
            return {
                error: `Giá trị nằm ngoài ngưỡng cho phép (${describeRange(accepted, variable.canonicalUnit)}).`,
                warning: null,
            };
        }

        const normal = normalizeRange(variable.normalRange);
        if (!inRange(num, normal)) {
            return {
                error: null,
                warning: `Ngoài khoảng bình thường (${describeRange(normal, variable.canonicalUnit)}). Hệ thống vẫn chấp nhận.`,
            };
        }
    }

    return { error: null, warning: null };
}

export function formatSeverityLabel(severity: SeverityLevel | string): string {
    switch (severity) {
        case "Mild":
            return "Nhẹ (Mild)";
        case "Moderate":
            return "Trung bình (Moderate)";
        case "Severe":
            return "Nặng (Severe)";
        default:
            return severity;
    }
}

export function formatTreatmentSiteLabel(site: TreatmentSite | string): string {
    switch (site) {
        case "Outpatient":
            return "Ngoại trú (Outpatient)";
        case "Inpatient":
            return "Nội trú (Inpatient)";
        case "IntensiveCareUnit":
            return "Hồi sức tích cực (ICU)";
        default:
            return site;
    }
}

export function getSampleTypeLabel(sampleType: number | string | undefined): string {
    if (sampleType === undefined || sampleType === null) return "Không rõ";
    const found = SAMPLE_TYPES.find(
        (s) => s.value === Number(sampleType) || s.name === String(sampleType)
    );
    return found ? found.label : String(sampleType);
}