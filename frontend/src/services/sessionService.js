import api from './api';

export const sessionService = {
  getAllSessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },

  getSession: async (id) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  createSession: async (name, roomName) => {
    const response = await api.post('/sessions', { name, roomName });
    return response.data;
  },

  endSession: async (id) => {
    const response = await api.patch(`/sessions/${id}/end`);
    return response.data;
  },

  deleteSession: async (id) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  },

  getSingersBySession: async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}/singers`);
  return response.data;
  },

  removeSingerFromSession: async (sessionId, singerId) => {
    const response = await api.delete(`/sessions/${sessionId}/singers/${singerId}`);
    return response.data;
  },

  assignSongToQueueItem: async (queueItemId, songId) => {
  const response = await api.patch(`/queue/${queueItemId}/song`, { songId });
    return response.data;
  },

  searchSongs: async (query) => {
    const response = await api.get(`/songs/search?q=${encodeURIComponent(query)}`);
    return response.data.songs;
  },
};
