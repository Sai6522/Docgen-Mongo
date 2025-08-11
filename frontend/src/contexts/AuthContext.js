import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

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
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔐 Auth initialization - Token found:', token ? 'YES' : 'NO');
      
      if (token) {
        try {
          // Set the token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('🔐 Verifying token with backend...');
          
          const response = await api.get('/auth/profile');
          console.log('✅ Token verification successful:', response.data.user);
          
          setUser(response.data.user);
        } catch (error) {
          console.error('❌ Token verification failed:', error.response?.data || error.message);
          
          // Clear invalid token
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log('ℹ️  No token found in localStorage');
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      console.log('✅ Login successful, storing token');
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(userData);
      
      console.log('✅ User authenticated:', userData.email);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    console.log('🔐 Logging out user');
    
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    console.log('✅ User logged out successfully');
  };

  const updateUser = (userData) => {
    console.log('🔐 Updating user data:', userData);
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
