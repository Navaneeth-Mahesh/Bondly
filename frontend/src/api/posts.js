import { api } from './client';

export const postsApi = {
  getFeed: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  getTrending: () => api.get('/posts/trending'),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  getSaved: () => api.get('/posts/saved'),
  getLiked: () => api.get('/posts/liked'),
  create: (data) => api.post('/posts', data),
  remove: (postId) => api.delete(`/posts/${postId}`),
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  toggleSave: (postId) => api.post(`/posts/${postId}/save`),
  share: (postId) => api.post(`/posts/${postId}/share`),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
};

export const commentsApi = {
  remove: (commentId) => api.delete(`/comments/${commentId}`),
  toggleLike: (commentId) => api.post(`/comments/${commentId}/like`),
};
