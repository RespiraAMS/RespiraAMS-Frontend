'use client';

import { useFont, FontOption } from '@/providers/FontContext';

const FONT_OPTIONS: { id: FontOption; label: string; previewStyle: string }[] = [
  {
    id: 'sans',
    label: 'Default (Inter)',
    previewStyle: 'var(--font-inter)',
  },
  {
    id: 'serif',
    label: 'Merriweather',
    previewStyle: 'var(--font-merriweather)',
  },
  {
    id: 'mono',
    label: 'JetBrains Mono',
    previewStyle: 'var(--font-mono)',
  },
];

export function FontSelector() {
  const { font, setFont } = useFont();

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
      {FONT_OPTIONS.map((option) => {
        const isActive = font === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setFont(option.id)}
            style={{ fontFamily: option.previewStyle }}
            className={`rounded-md px-3 py-1.5 text-sm transition-all ${
              isActive
                ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}