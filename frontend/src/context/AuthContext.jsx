import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from token
  useEffect(() => {
    const token = localStorage.getItem('ecosphere_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('ecosphere_token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = data;

    localStorage.setItem('ecosphere_token', token);
    if (rememberMe) localStorage.setItem('ecosphere_remember', 'true');

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecosphere_token');
    localStorage.removeItem('ecosphere_remember');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  }, []);

  // Role helpers
  const isCeo = user?.role === 'ceo';
  const isEsgManager = user?.role === 'esg_manager';
  const isHrManager = user?.role === 'hr_manager';
  const isComplianceOfficer = user?.role === 'compliance_officer';
  const isEmployee = user?.role === 'employee';

  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, updateUser, refreshUser,
      isCeo, isEsgManager, isHrManager, isComplianceOfficer, isEmployee, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
