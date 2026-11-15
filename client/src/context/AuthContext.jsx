import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('bugtracer_token');
      if (token) {
        try {
          const res = await apiFetch('/auth/me');
          if (res.success) {
            setUser(res.data);
          } else {
            localStorage.removeItem('bugtracer_token');
          }
        } catch (err) {
          console.error('Session expired:', err);
          localStorage.removeItem('bugtracer_token');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data.token) {
      localStorage.setItem('bugtracer_token', res.data.token);
      setUser(res.data);
      return res.data;
    }
  };

  const register = async (name, email, password, role) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    if (res.success && res.data.token) {
      localStorage.setItem('bugtracer_token', res.data.token);
      setUser(res.data);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('bugtracer_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
