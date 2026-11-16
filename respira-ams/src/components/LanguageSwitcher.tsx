"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { setUserLocale } from '@/actions/locale';
import { LOCALES, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('common');
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
    <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-secondary p-1">
      {LOCALES.map((loc) => {
        const active = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleSelect(loc)}
            disabled={isPending}
            aria-pressed={active}
            aria-label={`${t('language')}: ${loc.toUpperCase()}`}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
            }`}
          >
            {loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
