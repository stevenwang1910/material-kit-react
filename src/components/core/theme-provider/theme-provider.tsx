'use client';

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { createTheme } from '@/styles/theme/create-theme';

import EmotionCache from './emotion-cache';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

function CustomThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const theme = createTheme();
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  // Load theme from localStorage on initial render
  React.useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Use system preference if no saved mode
      const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setMode(systemMode);
    }
  }, []);

  // Save theme to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Update the document class to match the current mode
    document.documentElement.className = mode;
  }, [mode]);

  return (
    <EmotionCache options={{ key: 'mui' }}>
      <ThemeProvider
        disableTransitionOnChange
        theme={theme}
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCache>
  );
}

export { CustomThemeProvider as ThemeProvider };
