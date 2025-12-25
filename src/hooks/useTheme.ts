import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

/**
 * A custom hook to manage the application's theme (dark or light).
 * It persists the selected theme in localStorage and applies the 'dark' class
 * to the document's root element.
 *
 * @returns A tuple containing:
 *  - `theme`: The current theme ('dark' or 'light').
 *  - `toggleTheme`: A function to switch between dark and light themes.
 */
export const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Retrieve the theme from localStorage or default to 'dark'.
    return (localStorage.getItem('sonicwave_theme') as Theme) || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Effect to apply the theme class to the <html> element and update localStorage.
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sonicwave_theme', theme);
  }, [theme]);

  return [theme, toggleTheme];
};
