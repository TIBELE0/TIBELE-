import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '/api';

const validateFrontendRuntimeConfig = () => {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!API_URL) {
    issues.push('REACT_APP_API_URL/VITE_API_URL est vide.');
  }

  if (!API_URL.startsWith('/api')) {
    warnings.push(`REACT_APP_API_URL/VITE_API_URL utilise une URL absolue (${API_URL}).`);

    if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname) && API_URL.includes('localhost')) {
      warnings.push('URL API absolue sur localhost detectee hors localhost: preferer /api pour les environnements distants (codespaces/proxy).');
    }
  }

  if (issues.length > 0) {
    console.error('[runtime-check/frontend] configuration invalide', { issues, apiUrl: API_URL });
  }

  if (warnings.length > 0) {
    console.warn('[runtime-check/frontend] avertissements', { warnings, apiUrl: API_URL });
  }
};

validateFrontendRuntimeConfig();

let accessToken: string | null = null;
let refreshRequest: Promise<string | null> | null = null;
let csrfToken: string | null = null;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const readCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const ensureCsrfToken = async (): Promise<string | null> => {
  const currentCookieToken = readCookie('tibele_csrf_token') || readCookie('csrfToken');
  if (currentCookieToken) {
    csrfToken = currentCookieToken;
    return csrfToken;
  }

  const response = await axios.get(`${API_URL}/auth/csrf`, { withCredentials: true });
  csrfToken = response.data.csrfToken || readCookie('csrfToken');
  return csrfToken;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return config;
  }

  const requestUrl = config.url || '';
  if (!requestUrl.includes('/auth/csrf')) {
    const token = await ensureCsrfToken();
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
    ].some((path) => requestUrl.includes(path));

    if (error.response?.status !== 401 || originalRequest?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (!refreshRequest) {
      refreshRequest = api.post('/auth/refresh').then((response) => {
        const newToken = response.data.accessToken || null;
        setAccessToken(newToken);
        return newToken;
      }).catch(() => {
        setAccessToken(null);
        return null;
      }).finally(() => {
        refreshRequest = null;
      });
    }

    const newToken = await refreshRequest;
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  }
);

export default api;
