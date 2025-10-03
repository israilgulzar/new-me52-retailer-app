import React, { createContext, useContext, useState, ReactNode } from 'react';
import { lightColors, darkColors } from './colors';

export type ThemeType = 'light' | 'dark';

const ThemeContext = createContext({
  theme: 'light' as ThemeType,
  colors: lightColors,
  toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {

  const [theme, setTheme] = useState<ThemeType>('light');
  const colors = theme === 'light' ? lightColors : lightColors;
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );

};
