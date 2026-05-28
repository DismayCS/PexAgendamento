/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'en' | 'pt-BR';

interface Settings {
  primaryColor: string;
  language: Language;
}

interface SettingsContextValue {
  settings: Settings;
  setPrimaryColor: (color: string) => void;
  setLanguage: (language: Language) => void;
}

const defaultSettings: Settings = {
  primaryColor: '#f78da7',
  language: 'en'
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const SETTINGS_KEY = 'sa_web_settings';

const readInitialSettings = (): Settings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(stored);
    return { ...defaultSettings, ...parsed };
  } catch {
    localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  }
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(readInitialSettings);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand', settings.primaryColor);
    root.style.setProperty('--brand-dark', settings.primaryColor);
    root.style.setProperty('--brand-muted', settings.primaryColor);
  }, [settings.primaryColor]);

  const persist = (next: Settings) => {
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const setPrimaryColor = (color: string) => persist({ ...settings, primaryColor: color });
  const setLanguage = (language: Language) => persist({ ...settings, language });

  return (
    <SettingsContext.Provider value={{ settings, setPrimaryColor, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
