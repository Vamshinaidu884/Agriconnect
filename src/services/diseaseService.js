/* Disease Service — Upload image for disease detection */
import api from './api';

export const diseaseService = {
  detect: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/disease/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
