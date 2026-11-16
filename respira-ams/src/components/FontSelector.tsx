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
    previewStyle: 'var(--font-jetbrains-mono)',
  },
];

export function FontSelector() {
  const { font, setFont } = useFont();

  return (
    <div className="inline-flex rounded-lg border border-border-default bg-surface-secondary p-1">
      {FONT_OPTIONS.map((option) => {
        const isActive = font === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setFont(option.id)}
            style={{ fontFamily: option.previewStyle }}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
