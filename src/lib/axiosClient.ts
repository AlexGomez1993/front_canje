import axios, { AxiosInstance } from 'axios';

import { authClient } from './auth/client';

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('custom-auth-token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Token no válido o sesión expirada. Realizar logout.');
      alert('Token no válido o sesión expirada. Realizar logout.');
      await authClient.signOut();
      window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
