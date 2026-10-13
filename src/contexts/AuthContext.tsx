import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem('eco_admin_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eco_admin_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('eco_admin_token');
    localStorage.removeItem('eco_admin_user');
    setToken(null);
    setUser(null);
    void queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  const logout = useCallback(() => {
    const revoke = api.post('/auth/logout');
    clearSession();
    void revoke.catch(() => undefined);
  }, [clearSession]);

  useEffect(() => {
    window.addEventListener('eco-auth-expired', clearSession);
    return () => window.removeEventListener('eco-auth-expired', clearSession);
  }, [clearSession]);

  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const me = await api.get<User>('/auth/me');
        if (me) {
          setUser(me);
          localStorage.setItem('eco_admin_user', JSON.stringify(me));
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, clearSession]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password });
    if (res?.access_token) {
      localStorage.setItem('eco_admin_token', res.access_token);
      localStorage.setItem('eco_admin_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated: !!token && !!user,
      isSuperAdmin: user?.role === 'super_admin',
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
