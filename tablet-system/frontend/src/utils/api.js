import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.put('/auth/password', data),
}

export const tabletsAPI = {
  list: (params) => api.get('/tablets', { params }),
  get: (id) => api.get(`/tablets/${id}`),
  create: (data) => api.post('/tablets', data),
  update: (id, data) => api.put(`/tablets/${id}`, data),
  delete: (id) => api.delete(`/tablets/${id}`),
}

export const printAPI = {
  pdfUrl: (id, copies = 1) => `/api/print/${id}/pdf?copies=${copies}`,
  batch: (ids) => api.post('/print/batch', { ids }, { responseType: 'blob' }),
  jobs: () => api.get('/print/jobs'),
}

export const statsAPI = {
  get: () => api.get('/stats'),
}

export default api
