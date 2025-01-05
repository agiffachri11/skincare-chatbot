import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token')); // Gunakan callback
  
    useEffect(() => {
        console.log('Current token:', token);
      }, [token]);

    const login = async (email, password) => {
      try {
        const response = await fetch('https://skincare-chatbot-production.up.railway.app/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          throw new Error('Login failed');
        }
        
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        throw error; // Re-throw untuk handling di komponen
      }
    };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);