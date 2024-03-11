'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Necesario para que el modo oscuro funcione!!
// Si no tailwind no añade dark al bundle (creo)
export function bugfix() {
  return <div className="dark"></div>;
}
