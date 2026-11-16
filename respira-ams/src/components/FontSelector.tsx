"use client";

import { useFont, FontOption } from "@/providers/FontContext";
import { cn } from "@/lib/utils";

const FONT_OPTIONS: { id: FontOption; label: string; previewStyle: string }[] = [
	{
		id: "sans",
		label: "Default (Inter)",
		previewStyle: "var(--font-inter)",
	},
	{
		id: "serif",
		label: "Merriweather",
		previewStyle: "var(--font-merriweather)",
	},
	{
		id: "mono",
		label: "JetBrains Mono",
		previewStyle: "var(--font-mono)",
	},
];

export function FontSelector() {
	const { font, setFont } = useFont();

	return (
		<div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/60 p-1">
			{FONT_OPTIONS.map((option) => {
				const isActive = font === option.id;
				return (
					<button
						key={option.id}
						type="button"
						onClick={() => setFont(option.id)}
						aria-pressed={isActive}
						style={{ fontFamily: option.previewStyle }}
						className={cn(
							"cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
							isActive
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:bg-background/60 hover:text-foreground"
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}