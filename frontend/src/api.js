import axios from 'axios';

// Use the Vercel/Netlify environment variable in production, otherwise fallback to localhost for local testing
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE });

// Attach auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export const employeeAPI = {
  list: () => api.get('/employees/'),
  create: (data) => api.post('/employees/create/', data),
  update: (id, data) => api.patch(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
};

export const attendanceAPI = {
  signIn: (data) => api.post('/attendance/sign-in/', data),
  signOut: (data) => api.post('/attendance/sign-out/', data),
  todayStatus: (empId) => api.get(`/attendance/status/${empId}/`),
  monthly: (empId, year, month) =>
    api.get(`/attendance/monthly/${empId}/`, { params: { year, month } }),
  dashboard: (year, month) =>
    api.get('/attendance/dashboard/', { params: { year, month } }),
  all: (params) => api.get('/attendance/all/', { params }),
  manualUpdate: (data) => api.post('/attendance/manual/', data),
  exportExcel: (params) => {
    const token = localStorage.getItem('authToken');
    const query = new URLSearchParams(params).toString();
    window.open(`${API_BASE}/attendance/export/?${query}&token=${token}`, '_blank');
  },
  leaves: {
    list: () => api.get('/attendance/leaves/'),
    create: (data) => api.post('/attendance/leaves/', data),
    update: (id, data) => api.patch(`/attendance/leaves/${id}/`, data),
  },
};

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  me: () => api.get('/auth/me/'),
};

export default api;
