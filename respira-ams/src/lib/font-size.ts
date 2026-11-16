export const FONT_SCALE_STORAGE_KEY = "respira_font_scale";

export type FontScale = "small" | "medium" | "large";

export const DEFAULT_FONT_SCALE: FontScale = "medium";

export const FONT_SCALE_OPTIONS: Array<{ value: FontScale; px: number }> = [
	{ value: "small", px: 14 },
	{ value: "medium", px: 16 },
	{ value: "large", px: 18 },
];

export function isFontScale(value: unknown): value is FontScale {
	return value === "small" || value === "medium" || value === "large";
}

export function fontScaleToPx(scale: FontScale): number {
	return FONT_SCALE_OPTIONS.find((option) => option.value === scale)?.px ?? 16;
}

export function readStoredFontScale(): FontScale {
	if (typeof window === "undefined") return DEFAULT_FONT_SCALE;
	try {
		const stored = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
		return isFontScale(stored) ? stored : DEFAULT_FONT_SCALE;
	} catch {
		return DEFAULT_FONT_SCALE;
	}
}

export function applyFontScale(scale: FontScale): void {
	if (typeof document === "undefined") return;
	document.documentElement.style.fontSize = `${fontScaleToPx(scale)}px`;
}

export function storeFontScale(scale: FontScale): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, scale);
	} catch {
		// Storage can be blocked; the preference simply does not persist.
	}
}
