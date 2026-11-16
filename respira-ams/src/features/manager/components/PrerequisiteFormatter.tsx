"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface PrerequisiteFormatterProps {
	formula: string | null | undefined;
}

export function PrerequisiteFormatter({ formula }: PrerequisiteFormatterProps) {
	const t = useTranslations("manager.prerequisite");

	if (!formula) {
		return <span className="text-muted-foreground italic">{t("formatter.noCondition")}</span>;
	}

	const tokenRegex =
		/("[^"]*"|\b(?:AND|OR|NOT|If|then|else|true|false)\b|\d+(?:\.\d+)?|[=><≥≤≠\+\-×÷]|[\(\)]|[A-Za-z_][A-Za-z0-9_\-]*|\s+)/g;

	const tokens = formula.split(tokenRegex).filter(Boolean);

	return (
		<div className="flex flex-wrap items-center gap-1.5 text-[15px] leading-relaxed text-foreground">
			{tokens.map((token, index) => {
				const trimmed = token.trim();
				if (!trimmed) return <span key={index}> </span>;

				// String Literals ("FEMALE")
				if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
					return (
						<span
							key={index}
							className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono font-semibold"
						>
							{trimmed}
						</span>
					);
				}

				// Logic Keywords
				if (["AND", "OR", "If", "then", "else"].includes(trimmed)) {
					return (
						<span
							key={index}
							className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold text-xs mx-1 tracking-wide sm:flex-auto lg:flex-none max-sm:w-full max-sm:my-1"
						>
							{trimmed}
						</span>
					);
				}

				if (trimmed === "NOT") {
					return (
						<span
							key={index}
							className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold text-xs mx-1 tracking-wide"
						>
							{trimmed}
						</span>
					);
				}

				// Booleans & Numbers
				if (trimmed === "true" || trimmed === "false" || !isNaN(Number(trimmed))) {
					return (
						<span
							key={index}
							className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md font-semibold font-mono"
						>
							{trimmed}
						</span>
					);
				}

				// Operators
				if (/^[=><≥≤≠\+\-×÷]$/.test(trimmed)) {
					return (
						<span key={index} className="text-destructive font-bold mx-1">
							{trimmed}
						</span>
					);
				}

				// Parentheses
				if (trimmed === "(" || trimmed === ")") {
					return (
						<span key={index} className="text-muted-foreground font-light text-lg mx-[1px]">
							{trimmed}
						</span>
					);
				}

				// Clinical Variable Identifiers
				if (/^[A-Za-z_][A-Za-z0-9_\-]*$/.test(trimmed)) {
					return (
						<span
							key={index}
							className="inline-flex items-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-semibold text-[13px]"
						>
							{trimmed}
						</span>
					);
				}

				return <span key={index}>{trimmed}</span>;
			})}
		</div>
	);
}