import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    quartier: string
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),
}

export const servicesAPI = {
  getAll: (params?: {
    type?: string
    category?: string
    quartier?: string
    page?: number
    limit?: number
  }) => api.get('/services', { params }),

  getMy: () => api.get('/services/my'),

  getById: (id: string) => api.get(`/services/${id}`),

  create: (data: {
    title: string
    description: string
    type: string
    category: string
    credits: number
    quartier: string
  }) => api.post('/services', data),

  update: (id: string, data: any) => api.patch(`/services/${id}`, data),

  delete: (id: string) => api.delete(`/services/${id}`),
}

export const matchesAPI = {
  getMy: () => api.get('/matches/my'),

  create: (data: { serviceId: string; message?: string }) =>
    api.post('/matches', data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/matches/${id}`, { status }),
}

export const ratingsAPI = {
  create: (data: { matchId: string; score: number; comment?: string }) =>
    api.post('/ratings', data),

  getByUser: (userId: string) => api.get(`/ratings/user/${userId}`),
}

export const profileAPI = {
  update: (data: { firstName?: string; lastName?: string; quartier?: string; bio?: string }) =>
    api.patch('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/password', data),
  getById: (userId: string) =>
    api.get(`/users/${userId}`),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
}

export default api
