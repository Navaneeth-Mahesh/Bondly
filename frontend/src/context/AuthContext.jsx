import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { applyServerTheme } = useTheme();

  // On mount, verify any stored token is still valid
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('bondly_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await authApi.getMe();
        setUser(me);
        setIsAuthenticated(true);
        if (me.preferences?.theme) applyServerTheme(me.preferences.theme);
      } catch (err) {
        localStorage.removeItem('bondly_token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await authApi.login({ email, password });
    localStorage.setItem('bondly_token', token);
    setUser(loggedInUser);
    setIsAuthenticated(true);
    if (loggedInUser.preferences?.theme) applyServerTheme(loggedInUser.preferences.theme);
    return loggedInUser;
  }, []);

  const register = useCallback(async (data) => {
    const { token, user: newUser } = await authApi.register(data);
    localStorage.setItem('bondly_token', token);
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bondly_token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
