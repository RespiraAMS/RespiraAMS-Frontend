import { getTranslations } from 'next-intl/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function DashboardPage() {
  const commonT = await getTranslations('common');

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">{commonT('dashboard')}</h1>
        <LanguageSwitcher />
        <ThemeToggle />
      </header>

      <section className="space-y-4">
      </section>
    </div>
  );
}