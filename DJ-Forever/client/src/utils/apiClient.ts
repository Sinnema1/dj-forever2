import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach the auth token from localStorage to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('id_token');
    if (token) {
      // Ensure headers is not undefined; use a fallback empty object if necessary.
      config.headers = AxiosHeaders.from(config.headers ?? {});
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

export default apiClient;