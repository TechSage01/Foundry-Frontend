import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://foundry-backend-ux47.onrender.com/api',
  method: 'get',
  withCredentials: true, // 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;