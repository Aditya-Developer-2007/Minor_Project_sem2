import axios from 'axios';
const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({ baseURL: getBaseURL() });
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;