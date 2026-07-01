import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';

interface User { id: string; name: string; email: string; role: string; }
interface AuthContextValue { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; register: (payload: Record<string, unknown>) => Promise<User>; logout: () => Promise<void>; }
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const api = axios.create({ baseURL: '/api' });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mediflow:user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('mediflow:user', JSON.stringify(data.user));
    localStorage.setItem('mediflow:token', data.accessToken);
    setUser(data.user);
    return data.user;
};

  const register = async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('mediflow:user', JSON.stringify(data.user));
    localStorage.setItem('mediflow:token', data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('mediflow:token')}` } });
    localStorage.removeItem('mediflow:user');
    localStorage.removeItem('mediflow:token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
