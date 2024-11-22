import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxy will handle the actual base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
