import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { decodeToken, getToken, setToken } from '../services/auth.service';
import { api, setUnauthorizedHandler } from '../services/api.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTok] = useState(() => (decodeToken(getToken()) ? getToken() : null));
  const user = useMemo(() => decodeToken(token), [token]);

  const saveToken = useCallback((t) => {
    setToken(t);
    setTok(t);
  }, []);

  const logout = useCallback(() => saveToken(null), [saveToken]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { token: t } = await api.login({ email, password });
    saveToken(t);
    return decodeToken(t);
  }, [saveToken]);

  const register = useCallback(async (data) => {
    const { token: t } = await api.register(data);
    saveToken(t);
    return decodeToken(t);
  }, [saveToken]);

  const value = useMemo(() => ({
    user,
    role: user ? user.role : 'guest',
    isLoggedIn: !!user,
    isAdmin: !!user && user.role === 'admin',
    login,
    register,
    logout,
    saveToken,
  }), [user, login, register, logout, saveToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
