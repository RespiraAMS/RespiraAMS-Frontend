import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { COOKIE_NAME, DEFAULT_LOCALE, LOCALES, type Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const reqHeaders = await headers();

  let locale: Locale = DEFAULT_LOCALE;

  const cookieLocale = cookieStore.get(COOKIE_NAME)?.value;

  if (cookieLocale && LOCALES.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else {
    const acceptLang = reqHeaders.get('accept-language');
    if (acceptLang) {
      const preferred = acceptLang.split(',')[0].split('-')[0];
      if (LOCALES.includes(preferred as Locale)) {
        locale = preferred as Locale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});