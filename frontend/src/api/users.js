import { api } from './client';

export const usersApi = {
  search: (query = '') => api.get(`/users${query ? `?search=${encodeURIComponent(query)}` : ''}`),
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/me', data),
  updatePreferences: (data) => api.put('/users/me/preferences', data),
  changePassword: (data) => api.put('/users/me/password', data),
  deleteAccount: (password) => api.delete('/users/me', { password }),
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  getFollowRequests: () => api.get('/users/me/follow-requests'),
  acceptFollowRequest: (requestId) => api.post(`/users/follow-requests/${requestId}/accept`),
  declineFollowRequest: (requestId) => api.post(`/users/follow-requests/${requestId}/decline`),
};
