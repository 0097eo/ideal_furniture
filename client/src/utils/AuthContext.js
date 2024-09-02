import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await axios.get('/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/login', { username, password });
      const { access_token, message } = response.data;
      
      if (message === 'Please verify your email before logging in.') {
        return { success: false, error: message, needsVerification: true };
      }

      localStorage.setItem('accessToken', access_token);

      // Fetch user data
      const userResponse = await axios.get('/profile', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setUser(userResponse.data);

      return { success: true, user: userResponse.data };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const verifyEmail = async (email, verificationCode) => {
    try {
      const response = await axios.post('/verify-email', { email, verification_code: verificationCode });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Email verification failed:', error);
      return { success: false, error: error.response?.data?.error || 'Verification failed' };
    }
  };

  const value = {
    user,
    login,
    logout,
    verifyEmail,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;