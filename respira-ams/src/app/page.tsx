import { getTranslations } from 'next-intl/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const commonT = await getTranslations('common');

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">{commonT('dashboard')}</h1>
        <LanguageSwitcher />
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-gray-600">{t('stats')}</p>
        <div className="p-4 bg-blue-50 text-blue-900 rounded-lg font-medium">
          {t('activeUsers', { count: 1250 })}
        </div>
      </section>
    </div>
  );
}