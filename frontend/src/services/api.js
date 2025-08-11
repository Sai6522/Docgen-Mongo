import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔗 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔐 Token found:', token ? 'YES' : 'NO');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('⚠️  No token available for request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    console.error('❌ Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
