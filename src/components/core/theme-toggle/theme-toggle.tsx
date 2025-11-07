'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MoonIcon } from '@phosphor-icons/react/dist/ssr/Moon';
import { SunIcon } from '@phosphor-icons/react/dist/ssr/Sun';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
}

export function ThemeToggle({ size = 'medium' }: ThemeToggleProps): React.JSX.Element {
  // Check the current theme mode from the document class
  const isDark = document.documentElement.classList.contains('dark');

  const handleToggle = () => {
    // Toggle the theme mode
    const newMode = isDark ? 'light' : 'dark';
    document.documentElement.className = newMode;
    // Save the theme mode to localStorage
    localStorage.setItem('themeMode', newMode);
  };

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} placement="top">
      <IconButton
        onClick={handleToggle}
        size={size}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  );
}