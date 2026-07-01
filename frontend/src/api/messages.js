import { api } from './client';

export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  startConversation: (userId) => api.post('/messages/conversations', { userId }),
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => api.post(`/messages/conversations/${conversationId}/messages`, data),
};
