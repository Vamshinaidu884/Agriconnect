/* Machine Service — Machine listing CRUD */
import api from './api';

export const machineService = {
  getAll: (params = {}) => api.get('/machines', { params }),
  getById: (id) => api.get(`/machines/${id}`),
  create: (formData) =>
    api.post('/machines', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
};
