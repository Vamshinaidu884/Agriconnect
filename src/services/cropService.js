/* Crop Service — Crop recommendations */
import api from './api';

export const cropService = {
  getRecommendations: (state, season) =>
    api.get('/crops/recommend', { params: { state, season } }),
};
