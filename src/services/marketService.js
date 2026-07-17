/* Market Service — Prices and weather */
import api from './api';

export const marketService = {
  getPrices: () => api.get('/market/prices'),
  getWeather: (lat, lng) =>
    api.get('/market/weather', { params: { lat, lng } }),
};
