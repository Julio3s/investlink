import api from '../utils/api';

export const messageService = {
  async fetchConversations() {
    const res = await api.get('/conversations');
    return res.data || [];
  },

  async fetchMessages(conversationId, { limit = 30, before } = {}) {
    const res = await api.get(`/conversations/${conversationId}/messages`, {
      params: { limit, before },
    });
    return res.data || [];
  },

  async sendMessage({ conversationId, content, file }) {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    const res = await api.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  async createConversation(payload) {
    const res = await api.post('/conversations', payload);
    return res.data;
  },

  async reportConversation(conversationId, reason) {
    const res = await api.post(`/conversations/${conversationId}/report`, { reason });
    return res.data;
  },

  async deleteConversation(conversationId) {
    const res = await api.delete(`/conversations/${conversationId}`);
    return res.data;
  },
};
