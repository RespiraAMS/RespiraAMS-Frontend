'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { setUserLocale } from '@/actions/locale';
import { LOCALES, type Locale } from '@/i18n/config';

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
    <div className="flex gap-2 items-center">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          onClick={() => handleSelect(loc)}
          disabled={isPending}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}