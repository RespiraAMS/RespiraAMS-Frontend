import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Merriweather } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { FontSizeProvider } from '@/components/font-size-provider';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { AuthBootstrap } from '@/components/AuthBootstrap';
import { FontProvider } from '@/providers/FontContext';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const fontInitScript = `
  (function() {
    try {
      var savedFont = localStorage.getItem('user-font') || 'sans';
      if (['sans', 'serif', 'mono'].indexOf(savedFont) === -1) savedFont = 'sans';
      document.documentElement.setAttribute('data-font', savedFont);

      var scale = localStorage.getItem('respira_font_scale');
      var px = scale === 'large' ? 18 : scale === 'small' ? 14 : 16;
      document.documentElement.style.fontSize = px + 'px';
    } catch (e) {}
  })();
`;

export const metadata: Metadata = {
  title: 'RespiraAMS',
  description: 'Respiratory Airway Management System',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fontInitScript }} />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FontSizeProvider>
            <FontProvider>
              <NextIntlClientProvider messages={messages}>
                <QueryProvider>
                  <AuthBootstrap />
                  {children}
                  <Toaster richColors position="top-center" duration={3000} closeButton />
                </QueryProvider>
              </NextIntlClientProvider>
            </FontProvider>
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}