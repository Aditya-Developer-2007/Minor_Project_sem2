import axios from 'axios';
const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({ baseURL: getBaseURL() });
api.interceptors.request.use((config) => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo && userInfo !== 'undefined' && userInfo !== 'null') {
      const parsed = JSON.parse(userInfo);
      const token = parsed.token || parsed.access_token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error("🔑 AUTH INTERCEPTOR ERROR:", error);
  }
  return config;
});
export default api;