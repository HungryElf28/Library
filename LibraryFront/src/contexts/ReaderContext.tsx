import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ReaderSettings } from '../types';

interface ReaderContextType {
  settings: ReaderSettings;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
}

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'Georgia, serif',
  theme: 'light',
  lineHeight: 1.6,
};

const SETTINGS_KEY = 'library_reader_settings';

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return (
    <ReaderContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (context === undefined) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
}
