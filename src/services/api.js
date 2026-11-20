import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://foundry-backend-ux47.onrender.com/',
  method: 'get',
  withCredentials: true, // 
  headers: {
    'Content-Type': 'application/json',
  },
});

const NO_REFRESH = [
  'api/auth/refresh',
  'api/auth/logout',
  'api/auth/login',
  'api/auth/register',
  'api/auth/verify',
];
let refreshPromise = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';
    
    if (
      status !== 401 ||
      !original._retry || 
      NO_REFRESH.some((p) => url.includes(p))
    ){
      return Promise.reject(error);
    }
    original._retry = true;
    try{
      refreshPromise = 
        refreshPromise || 
        api.get('/api/auth/refresh').finally(()=> {
          refreshPromise = null;
        });
      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      window.dispatchEvent(new Event('auth: expired'));
      return Promise.reject(error);
    }
  },
);

export default api;


