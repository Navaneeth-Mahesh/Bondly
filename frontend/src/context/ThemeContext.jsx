import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usersApi } from '../api';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  const stored = localStorage.getItem('bondly_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const hasAppliedServerTheme = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('bondly_theme', theme);
  }, [theme]);

  const persist = (next) => {
    // Best-effort sync to backend if logged in; ignore failures (e.g. logged out, offline)
    if (localStorage.getItem('bondly_token')) {
      usersApi.updatePreferences({ theme: next }).catch(() => {});
    }
  };

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      persist(next);
      return next;
    });
  }, []);

  const setLight = useCallback(() => { setTheme('light'); persist('light'); }, []);
  const setDark = useCallback(() => { setTheme('dark'); persist('dark'); }, []);

  // Called once after login/session-restore to apply the user's saved server-side preference
  const applyServerTheme = useCallback((serverTheme) => {
    if (hasAppliedServerTheme.current) return;
    if (serverTheme === 'light' || serverTheme === 'dark') {
      hasAppliedServerTheme.current = true;
      setTheme(serverTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLight, setDark, applyServerTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
