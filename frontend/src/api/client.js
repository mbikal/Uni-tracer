import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const programApi = {
  // Get programs with filters
  getPrograms: async (params = {}) => {
    const response = await api.get('/programs', { params })
    return response.data
  },

  // Get single program
  getProgram: async (id) => {
    const response = await api.get(`/programs/${id}`)
    return response.data
  },

  // Search programs (RAG-powered)
  search: async (query, topK = 10) => {
    const response = await api.post('/search', { 
      query, 
      top_k: topK 
    })
    return response.data
  },

  // Compare programs
  compare: async (ids) => {
    const response = await api.post('/compare', { ids })
    return response.data
  },

  // Get available countries
  getCountries: async () => {
    const response = await api.get('/countries')
    return response.data
  },

  // Get stats
  getStats: async () => {
    const response = await api.get('/stats')
    return response.data
  },

  // Trigger refresh (protected)
  refresh: async (secret) => {
    const response = await api.post('/refresh', {}, {
      headers: { 'X-Refresh-Secret': secret }
    })
    return response.data
  },
}

export default api
