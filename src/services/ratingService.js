/* Rating Service */
import api from './api';

export const ratingService = {
  submit: (requestId, data) => api.post(`/ratings/${requestId}`, data),
};
