import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode } from '../types';

type ThemePreset = 'preset1' | 'preset2' | 'preset3';

interface ColorPalette {
  background: string;
  adminBackground: string;
  accent: string;
  text: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  preset: ThemePreset;
  setPreset: (preset: ThemePreset) => void;
  colors: ColorPalette;
}

const presetPalettes: Record<ThemePreset, { light: ColorPalette; dark: ColorPalette }> = {
  preset1: {
    light: { background: 'bg-primary-50', adminBackground: 'bg-primary-50', accent: 'text-primary-600', text: 'text-primary-800' },
    dark: { background: 'bg-primary-900', adminBackground: 'bg-gray-900', accent: 'text-primary-400', text: 'text-primary-300' },
  },
  preset2: {
    light: { background: 'bg-secondary-50', adminBackground: 'bg-secondary-50', accent: 'text-secondary-900', text: 'text-secondary-900' },
    dark: { background: 'bg-secondary-950', adminBackground: 'bg-gray-900', accent: 'text-secondary-300', text: 'text-secondary-200' },
  },
  preset3: {
    light: { background: 'bg-accent-50', adminBackground: 'bg-accent-50', accent: 'text-accent-900', text: 'text-accent-900' },
    dark: { background: 'bg-accent-950', adminBackground: 'bg-gray-900', accent: 'text-accent-300', text: 'text-accent-400' },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [preset, setPreset] = useState<ThemePreset>('preset1');

  useEffect(() => {
    // Load saved theme and preset or use system preference
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const savedPreset = localStorage.getItem('preset') as ThemePreset | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    if (savedPreset && presetPalettes[savedPreset]) {
      setPreset(savedPreset);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('preset', preset);
  }, [preset]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = presetPalettes[preset][theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, preset, setPreset, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
