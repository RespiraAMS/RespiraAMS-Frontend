import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME, DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/config';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hasLocaleCookie = request.cookies.has(COOKIE_NAME);

  if (!hasLocaleCookie) {
    const acceptLang = request.headers.get('accept-language');
    let detectedLocale: Locale = DEFAULT_LOCALE;

    if (acceptLang) {
      const preferred = acceptLang.split(',')[0].split('-')[0];
      if (LOCALES.includes(preferred as Locale)) {
        detectedLocale = preferred as Locale;
      }
    }

    response.cookies.set(COOKIE_NAME, detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 năm
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};