'use server';

import { cookies } from 'next/headers';
import { COOKIE_NAME, LOCALES, type Locale } from '@/i18n/config';

export async function setUserLocale(locale: Locale) {
  if (!LOCALES.includes(locale)) {
    throw new Error('Unsupported locale');
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}