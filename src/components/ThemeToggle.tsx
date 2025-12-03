'use client';

import { useTheme } from 'next-themes';
import { HiSun, HiMoon } from 'react-icons/hi';
import { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine current theme (accounting for system theme)
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted" />
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
        isDark ? 'bg-step-primary-500' : 'bg-border'
      }`}
      aria-label="Toggle theme"
      role="switch"
      aria-checked={isDark}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-card shadow-sm transition-transform duration-200 flex items-center justify-center ${
          isDark ? 'translate-x-6' : 'translate-x-1'
        }`}
      >
        {isDark ? (
          <HiMoon className="w-3 h-3 text-step-primary-600" />
        ) : (
          <HiSun className="w-3 h-3 text-muted-foreground" />
        )}
      </span>
    </button>
  );
};

