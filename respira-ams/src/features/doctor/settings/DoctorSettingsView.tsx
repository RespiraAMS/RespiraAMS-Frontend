'use client';

import { useEffect, useState } from 'react';
import { Globe, Monitor, Moon, Palette, Settings, Sun, Type } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { FontSelector } from '@/components/FontSelector';
import { cn } from '@/lib/utils';
import { FONT_SCALE_OPTIONS } from '@/lib/font-size';
import { useFontScale } from '@/components/font-size-provider';

const THEME_OPTIONS = [
    { value: 'light', icon: Sun, labelKey: 'themeLight' },
    { value: 'dark', icon: Moon, labelKey: 'themeDark' },
    { value: 'system', icon: Monitor, labelKey: 'themeSystem' },
] as const;

const FONT_SIZE_LABEL_KEYS = {
	small: "fontSizeSmall",
	medium: "fontSizeMedium",
	large: "fontSizeLarge",
} as const;

export function DoctorSettingsView() {
    const t = useTranslations('doctor.settings');
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
	const { scale, setScale } = useFontScale();

    useEffect(() => {
        void Promise.resolve().then(() => setMounted(true));
    }, []);

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8 text-foreground">
            {/* ── Header ── */}
            <div>
                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-primary/15 p-2 text-primary">
                        <Settings className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                        {t('title')}
                    </h1>
                </div>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{t('description')}</p>
            </div>

            {/* ── Theme Setting ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground shrink-0">
                        <Palette className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">{t('themeTitle')}</h2>
                        <p className="text-xs text-muted-foreground">{t('themeDescription')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1 self-start sm:self-auto">
                    {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => {
                        const active = mounted && theme === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTheme(value)}
                                className={cn(
                                    'flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {t(labelKey)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Language Setting ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground shrink-0">
                        <Globe className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">{t('languageTitle')}</h2>
                        <p className="text-xs text-muted-foreground">{t('languageDescription')}</p>
                    </div>
                </div>
                <div className="self-start sm:self-auto">
                    <LanguageSwitcher />
                </div>
            </div>

            {/* ── Font Setting ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground shrink-0">
                        <Type className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">{t('fontTitle')}</h2>
                        <p className="text-xs text-muted-foreground">{t('fontDescription')}</p>
                    </div>
                </div>
                <div className="self-start sm:self-auto">
                    <FontSelector />
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border-default bg-surface p-5 shadow-xs">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-surface-secondary p-2 text-text-secondary">
                        <Type className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-text-primary">
                            {t('fontSizeTitle')}
                        </h2>
                        <p className="text-xs text-text-secondary">{t('fontSizeDescription')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-secondary p-1">
                    {FONT_SCALE_OPTIONS.map(({ value }) => {
                        const active = scale === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setScale(value)}
                                aria-pressed={active}
                                className={cn(
                                    'cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-text-secondary hover:bg-surface-tertiary',
                                )}
                            >
                                {t(FONT_SIZE_LABEL_KEYS[value])}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
