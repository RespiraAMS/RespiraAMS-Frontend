"use client";

import { useEffect, useState } from "react";
import { Globe, Monitor, Moon, Palette, Settings, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
	{ value: "light", icon: Sun, labelKey: "themeLight" },
	{ value: "dark", icon: Moon, labelKey: "themeDark" },
	{ value: "system", icon: Monitor, labelKey: "themeSystem" },
] as const;

export function AdminSettingsView() {
	const t = useTranslations("admin.settings");
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
			<div>
				<div className="flex items-center gap-2">
					<div className="rounded-xl bg-primary/10 p-2 text-primary">
						<Settings className="h-5 w-5" />
					</div>
					<h1 className="text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
						{t("title")}
					</h1>
				</div>
				<p className="mt-1 text-xs text-text-secondary sm:text-sm">{t("description")}</p>
			</div>

			<div className="flex items-center justify-between gap-4 rounded-xl border border-border-default bg-surface p-5 shadow-xs">
				<div className="flex items-start gap-3">
					<div className="rounded-lg bg-surface-secondary p-2 text-text-secondary">
						<Palette className="h-4 w-4" />
					</div>
					<div>
						<h2 className="text-sm font-bold text-text-primary">{t("themeTitle")}</h2>
						<p className="text-xs text-text-secondary">{t("themeDescription")}</p>
					</div>
				</div>
				<div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-secondary p-1">
					{THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => {
						const active = mounted && theme === value;
						return (
							<button
								key={value}
								type="button"
								onClick={() => setTheme(value)}
								className={cn(
									"flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
									active
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-text-secondary hover:bg-surface-secondary"
								)}
							>
								<Icon className="h-3.5 w-3.5" />
								{t(labelKey)}
							</button>
						);
					})}
				</div>
			</div>

			<div className="flex items-center justify-between gap-4 rounded-xl border border-border-default bg-surface p-5 shadow-xs">
				<div className="flex items-start gap-3">
					<div className="rounded-lg bg-surface-secondary p-2 text-text-secondary">
						<Globe className="h-4 w-4" />
					</div>
					<div>
						<h2 className="text-sm font-bold text-text-primary">{t("languageTitle")}</h2>
						<p className="text-xs text-text-secondary">{t("languageDescription")}</p>
					</div>
				</div>
				<LanguageSwitcher />
			</div>
		</div>
	);
}
