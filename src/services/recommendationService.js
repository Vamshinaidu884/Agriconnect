import api from './api';

export const recommendationService = {
  getForMe: (params = {}) => api.get('/recommendations', { params }),
};
