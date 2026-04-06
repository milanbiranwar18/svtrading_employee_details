import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('authToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    // Hardcoded bypass for easy login during debugging
    if (username === 'admin' && password === 'admin123') {
      const dummyUser = { username: 'admin', id: 999, is_staff: true };
      setUser(dummyUser);
      localStorage.setItem('authToken', 'bypass-token');
      return;
    }

    const res = await authAPI.login(username, password);
    localStorage.setItem('authToken', res.data.token);
    const me = await authAPI.me();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
