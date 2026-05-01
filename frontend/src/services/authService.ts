import api from './api';

export const authService = {
  getCsrfToken: () => {
    return api.get('/auth/csrf');
  },

  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    matricule: string;
    school: string;
    studyYear?: string;
    major: string;
  }) => {
    return api.post('/auth/register', payload);
  },

  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },

  refresh: () => {
    return api.post('/auth/refresh');
  },

  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  logout: () => {
    return api.post('/auth/logout');
  },

  updateProfile: (payload: {
    fullName?: string;
    school?: string;
    studyYear?: string;
    major?: string;
  }) => {
    return api.put('/auth/profile', payload);
  },

  changePassword: (payload: { currentPassword: string; newPassword: string }) => {
    return api.post('/auth/change-password', payload);
  },
};
