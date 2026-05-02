import api from './api';

export const pathologyService = {
  getAllPathologies: (page = 1, limit = 10, includeHidden = false) => {
    return api.get('/pathologies', { params: { page, limit, includeHidden: includeHidden ? 'true' : undefined } });
  },

  getPathologyBySlug: (slug: string) => {
    return api.get(`/pathologies/${slug}`);
  },

  searchPathologies: (query: string) => {
    return api.get('/pathologies/search', { params: { q: query } });
  },

  getGroupes: () => {
    return api.get('/pathologies/groupes');
  },

  getPathologiesByGroupe: (nom: string, page = 1, limit = 50) => {
    return api.get(`/pathologies/groupe/${encodeURIComponent(nom)}`, { params: { page, limit } });
  },

  createPathology: (data: any) => {
    return api.post('/pathologies', data);
  },

  updatePathology: (id: string, data: any) => {
    return api.put(`/pathologies/${id}`, data);
  },

  deletePathology: (id: string) => {
    return api.delete(`/pathologies/${id}`);
  },
};

export const questionService = {
  getAdminQuestions: (page = 1, limit = 20, search = '') => {
    return api.get('/questions/admin', { params: { page, limit, search: search || undefined } });
  },

  createAdminQuestion: (data: {
    pathology: string;
    questionText: string;
    type: 'QCM' | 'QCD';
    options: Array<{ text: string; isCorrect: boolean }>;
    explanation?: string;
    isHidden?: boolean;
  }) => {
    return api.post('/questions/admin', data);
  },

  updateAdminQuestion: (id: string, data: Partial<{
    pathology: string;
    questionText: string;
    type: 'QCM' | 'QCD';
    options: Array<{ text: string; isCorrect: boolean }>;
    explanation?: string;
    isHidden?: boolean;
  }>) => {
    return api.put(`/questions/admin/${id}`, data);
  },

  deleteAdminQuestion: (id: string) => {
    return api.delete(`/questions/admin/${id}`);
  },

  getTrainingQuestions: (type: 'QCM' | 'QCD' | 'all' = 'all', limit = 10) => {
    return api.get('/questions/training', { params: { type, limit } });
  },

  getTrainingCatalog: () => {
    return api.get('/questions/training/catalog');
  },

  startTrainingSession: (mode: 'QCM' | 'QCD' | 'all' = 'all', limit = 10, pathologyId?: string) => {
    return api.post('/questions/training/sessions', { mode, limit, ...(pathologyId ? { pathologyId } : {}) });
  },

  submitTrainingSessionAnswer: (sessionId: string, questionId: string, selectedOptionIndex: number) => {
    return api.post(`/questions/training/sessions/${sessionId}/answers`, {
      questionId,
      selectedOptionIndex,
    });
  },

  completeTrainingSession: (sessionId: string) => {
    return api.post(`/questions/training/sessions/${sessionId}/complete`);
  },

  getTrainingDashboard: () => {
    return api.get('/questions/training/dashboard');
  },

  getTrainingHistory: (page = 1, limit = 10) => {
    return api.get('/questions/training/history', { params: { page, limit } });
  },

  getTrainingHistoryFiltered: (params: {
    page?: number;
    limit?: number;
    mode?: 'QCM' | 'QCD' | 'all';
    status?: 'in_progress' | 'completed' | 'abandoned';
    minScore?: number;
    maxScore?: number;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return api.get('/questions/training/history', { params });
  },

  getActiveTrainingSession: () => {
    return api.get('/questions/training/sessions/active');
  },

  getTrainingSession: (sessionId: string) => {
    return api.get(`/questions/training/sessions/${sessionId}`);
  },

  submitAnswer: (questionId: string, answer: string | number | boolean) => {
    return api.post('/questions/answer', { questionId, answer });
  },

  getScore: (pathologyId: string) => {
    return api.get(`/questions/score/${pathologyId}`);
  },

  getQuestionsByPathology: (pathologyId: string) => {
    return api.get(`/questions/${pathologyId}`);
  },

  getUserAnswers: (pathologyId?: string) => {
    return api.get('/questions/history/me', { params: { pathologyId } });
  },
};

export const forumService = {
  getTopics: (page = 1, limit = 10) => {
    return api.get('/forum/topics', { params: { page, limit } });
  },

  getTopic: (id: string, page = 1, limit = 10) => {
    return api.get(`/forum/topics/${id}`, { params: { page, limit } });
  },

  createTopic: (data: { title: string; content: string; pathologyId?: string }) => {
    return api.post('/forum/topics', data);
  },

  createMessage: (data: { topicId: string; content: string; parentMessageId?: string }) => {
    return api.post('/forum/messages', data);
  },

  deleteMessage: (id: string) => {
    return api.delete(`/forum/messages/${id}`);
  },

  deleteTopic: (id: string) => {
    return api.delete(`/forum/topics/${id}`);
  },
};

export const subscriptionService = {};

export interface GlobalSiteSettings {
  siteName: string;
  supportEmail: string;
  primaryColor: string;
  secondaryColor: string;
  donationUrl: string;
  donationPopupIntervalMinutes: number;
  maintenanceMode: boolean;
  messageMaintenance: string;
  registrationsOpen: boolean;
}

export const siteSettingsService = {
  getPublicSettings: () => api.get('/settings/public'),
};

export const adminService = {
  getDashboard: () => {
    return api.get('/admin/dashboard');
  },

  getAdvancedAnalytics: (periodDays: 7 | 30 | 90 = 90) => {
    return api.get('/admin/analytics/advanced', { params: { periodDays } });
  },

  getUsers: (page = 1, limit = 20, search = '') => {
    return api.get('/admin/users', { params: { page, limit, search: search || undefined } });
  },

  setUserBanStatus: (id: string, isBanned: boolean) => {
    return api.patch(`/admin/users/${id}/ban`, { isBanned });
  },

  setUserMatriculeValidation: (id: string, matriculeValidated: boolean) => {
    return api.patch(`/admin/users/${id}/matricule-validation`, { matriculeValidated });
  },

  deleteUser: (id: string) => {
    return api.delete(`/admin/users/${id}`);
  },

  getForumMessages: (page = 1, limit = 20, search = '') => {
    return api.get('/admin/forum/messages', { params: { page, limit, search: search || undefined } });
  },

  deleteForumMessage: (id: string) => {
    return api.delete(`/admin/forum/messages/${id}`);
  },

  getBillingOverview: (page = 1, limit = 20, search = '', status = '', periodDays: 7 | 30 | 90 = 90) => {
    return api.get('/admin/billing/overview', { params: { page, limit, search: search || undefined, status: status || undefined, periodDays } });
  },

  updatePaymentIntentStatus: (id: string, payload: { status: 'pending' | 'success' | 'failed'; failureReason?: string }) => {
    return api.patch(`/admin/billing/payment-intents/${id}/status`, payload);
  },

  pinTopic: (id: string, isPinned: boolean) => api.patch(`/admin/forum/topics/${id}/pin`, { isPinned }),

  getGroups: () => api.get('/admin/groups'),
  createGroup: (payload: { name: string; description?: string }) => api.post('/admin/groups', payload),
  updateGroup: (id: string, payload: { name?: string; description?: string }) => api.put(`/admin/groups/${id}`, payload),
  deleteGroup: (id: string) => api.delete(`/admin/groups/${id}`),
  seedDemoData: () => api.post('/admin/seed-demo'),

  getAuditLogs: (page = 1, limit = 50, action = '') => api.get('/admin/audit/logs', { params: { page, limit, action: action || undefined } }),

  getSiteSettings: () => {
    return api.get('/admin/settings/site');
  },

  updateSiteSettings: (payload: {
    siteName?: string;
    supportEmail?: string;
    maintenanceMode?: boolean;
    registrationsOpen?: boolean;
    messageMaintenance?: string;
    primaryColor?: string;
    secondaryColor?: string;
    donationUrl?: string;
    donationPopupIntervalMinutes?: number;
  }) => {
    return api.patch('/admin/settings/site', payload);
  },
};
