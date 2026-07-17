/* Request Service — Farm Job Requests CRUD + FCFS Actions */
import api from './api';

export const requestService = {
  getAll: (params = {}) => api.get('/requests', { params }),
  getMy: () => api.get('/requests/my'),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  update: (id, data) => api.put(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
  accept: (id) => api.post(`/requests/${id}/accept`),
  withdraw: (id) => api.post(`/requests/${id}/withdraw`),
  complete: (id) => api.post(`/requests/${id}/complete`),
};
