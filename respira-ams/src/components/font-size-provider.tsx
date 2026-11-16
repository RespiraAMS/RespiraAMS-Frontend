"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
	DEFAULT_FONT_SCALE,
	applyFontScale,
	readStoredFontScale,
	storeFontScale,
	type FontScale,
} from "@/lib/font-size";

interface FontScaleContextValue {
	scale: FontScale;
	setScale: (scale: FontScale) => void;
}

const FontScaleContext = createContext<FontScaleContextValue | null>(null);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
	const [scale, setScaleState] = useState<FontScale>(DEFAULT_FONT_SCALE);

	useEffect(() => {
		let cancelled = false;
		// Defer to the next task so the preference applies after hydration.
		void Promise.resolve().then(() => {
			if (cancelled) return;
			const stored = readStoredFontScale();
			setScaleState(stored);
			applyFontScale(stored);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const setScale = useCallback((next: FontScale) => {
		setScaleState(next);
		storeFontScale(next);
		applyFontScale(next);
	}, []);

	const value = useMemo(() => ({ scale, setScale }), [scale, setScale]);

	return <FontScaleContext.Provider value={value}>{children}</FontScaleContext.Provider>;
}

export function useFontScale(): FontScaleContextValue {
	const context = useContext(FontScaleContext);
	if (!context) {
		throw new Error("useFontScale must be used inside FontSizeProvider");
	}
	return context;
}
