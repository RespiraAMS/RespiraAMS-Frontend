"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setUserLocale } from "@/actions/locale";
import { LOCALES, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleSelect = (nextLocale: Locale) => {
		if (nextLocale === locale) return;

		startTransition(async () => {
			await setUserLocale(nextLocale);
			router.refresh();
		});
	};

	return (
		<div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1">
			{LOCALES.map((loc) => {
				const isActive = locale === loc;
				return (
					<button
						key={loc}
						type="button"
						onClick={() => handleSelect(loc)}
						disabled={isPending}
						aria-pressed={isActive}
						className={cn(
							"cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
							isActive
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:bg-background/60 hover:text-foreground"
						)}
					>
						{loc.toUpperCase()}
					</button>
				);
			})}
		</div>
	);
}