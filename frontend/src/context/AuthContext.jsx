import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('atm_token');
      const savedUser = localStorage.getItem('atm_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await API.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('atm_user', JSON.stringify(res.data.data));
        } catch {
          localStorage.removeItem('atm_token');
          localStorage.removeItem('atm_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('atm_token', token);
    localStorage.setItem('atm_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('atm_token', token);
    localStorage.setItem('atm_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('atm_token');
    localStorage.removeItem('atm_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
