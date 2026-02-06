import api from './api';

export const singerService = {
  // Get all singers
  getAllSingers: async () => {
    const response = await api.get('/singers');
    return response.data;
  },

  // Get singer by ID
  getSingerById: async (id) => {
    const response = await api.get(`/singers/${id}`);
    return response.data;
  },

  // Register new singer
  registerSinger: async (singerData) => {
    const response = await api.post('/singers', singerData);
    return response.data;
  },

  // Delete singer
  deleteSinger: async (id) => {
    const response = await api.delete(`/singers/${id}`);
    return response.data;
  },
};
