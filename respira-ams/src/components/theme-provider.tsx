"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Filter out React 19 false-positive script tag warning for next-themes
if (typeof console !== "undefined") {
	const originalError = console.error;
	console.error = (...args: unknown[]) => {
		const isScriptWarning = args.some((arg) => {
			const str = typeof arg === "string" ? arg : (arg as any)?.message || String(arg || "");
			return (
				str.includes("Encountered a script tag") ||
				str.includes("Scripts inside React components are never executed")
			);
		});
		if (isScriptWarning) {
			return;
		}
		originalError.apply(console, args);
	};
}

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
