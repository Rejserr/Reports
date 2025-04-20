import axios from 'axios';
import { getToken } from './authService';

// Provjerite je li ovo ispravna URL adresa za vaš backend
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:6000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dodavanje interceptora za dodavanje tokena u zaglavlje
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor za rukovanje greškama
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Preusmjeravanje na login stranicu ako je token istekao
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API metode
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/profile'),
};

export const analysisAPI = {
  getAll: (params?: any) => 
    api.get('/analyses', { params }),
  
  getById: (id: string) => 
    api.get(`/analyses/${id}`),
  
  create: (data: any) => 
    api.post('/analyses', data),
  
  update: (id: string, data: any) => 
    api.put(`/analyses/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/analyses/${id}`),
};

export const reportsAPI = {
  getAll: (params?: any) => 
    api.get('/reports', { params }),
  
  getById: (id: string) => 
    api.get(`/reports/${id}`),
  
  generate: (data: any) => 
    api.post('/reports', data),
  
  download: (id: string, format: string) => 
    api.get(`/reports/${id}/download?format=${format}`, {
      responseType: 'blob'
    }),
};

export default api;