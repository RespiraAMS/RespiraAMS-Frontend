// src/features/manager/clinical-variables/utils.ts

import { RangeRule } from "./types";

const DECIMAL_MAX_THRESHOLD = 79228162514264337593543950335;
const DECIMAL_MIN_THRESHOLD = -79228162514264337593543950335;

export function isInfiniteMax(val: number) {
    return val >= DECIMAL_MAX_THRESHOLD;
}

export function isInfiniteMin(val: number) {
    return val <= DECIMAL_MIN_THRESHOLD;
}

export function formatRangeDisplay(range?: RangeRule | null) {
    if (!range) return null;

    const hasMin = !isInfiniteMin(range.min);
    const hasMax = !isInfiniteMax(range.max);
    const unit = range.unit ? ` ${range.unit}` : "";

    if (!hasMin && !hasMax) return `Mọi giá trị${unit}`;
    
    if (!hasMin && hasMax) {
        const sign = range.isMaxExclusive ? "<" : "≤";
        return `${sign} ${range.max}${unit}`;
    }

    if (hasMin && !hasMax) {
        const sign = range.isMinExclusive ? ">" : "≥";
        return `${sign} ${range.min}${unit}`;
    }

    const minSign = range.isMinExclusive ? ">" : "≥";
    const maxSign = range.isMaxExclusive ? "<" : "≤";
    return `${minSign} ${range.min} và ${maxSign} ${range.max}${unit}`;
}