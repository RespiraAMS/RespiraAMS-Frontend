'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type FontOption = 'sans' | 'serif' | 'mono';

interface FontContextType {
  font: FontOption;
  setFont: (newFont: FontOption) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<FontOption>('sans');

  useEffect(() => {
    const saved = localStorage.getItem('user-font') as FontOption | null;
    if (saved && ['sans', 'serif', 'mono'].includes(saved)) {
      setFontState(saved);
    }
  }, []);

  const setFont = (newFont: FontOption) => {
    setFontState(newFont);
    document.documentElement.setAttribute('data-font', newFont);
    localStorage.setItem('user-font', newFont);
  };

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont phải được sử dụng bên trong FontProvider');
  }
  return context;
}