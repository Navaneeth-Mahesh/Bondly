import { api } from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data, { auth: false }),
  login: (data) => api.post('/auth/login', data, { auth: false }),
  getMe: () => api.get('/auth/me'),
};
