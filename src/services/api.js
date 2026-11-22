/* ============================================================
   Axios API Instance - Central HTTP client for all API calls
   Automatically attaches JWT token to every request.
   ============================================================ */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PUBLIC_AUTH_PATH = /\/auth\/(login|register|forgot-password|reset-password)(?:[?#]|$)/;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('agri_connect_token') ||
      localStorage.getItem('agrimatch_token') ||
      sessionStorage.getItem('agri_connect_token') ||
      sessionStorage.getItem('agrimatch_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const requestUrl = error.config?.url || '';
    if (error.response?.status === 401 && !PUBLIC_AUTH_PATH.test(requestUrl)) {
      window.dispatchEvent(new Event('agri-connect:unauthorized'));
    }

    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
        ? 'The server is taking longer than expected to wake up. Please wait a moment and try again.'
        : error.message === 'Network Error'
          ? 'Unable to reach the server. It may be waking up; please wait a moment and try again.'
          : error.message) ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
