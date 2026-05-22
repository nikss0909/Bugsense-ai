import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const TOKEN_KEY = 'bugsense_token'

function normalizeApiError(error) {
  const status = error.response?.status || 0
  const data = error.response?.data
  const fallbackMessage = error.code === 'ECONNABORTED'
    ? 'The server took too long to respond. Please try again.'
    : 'Server unavailable. Check that the backend is running.'

  if (data && typeof data === 'object') {
    return {
      code: data.code || error.code || 'API_ERROR',
      errors: data.errors || {},
      message: data.message || fallbackMessage,
      path: data.path || error.config?.url || '',
      status,
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return {
      code: error.code || 'API_ERROR',
      errors: {},
      message: data,
      path: error.config?.url || '',
      status,
    }
  }

  return {
    code: error.code || 'NETWORK_ERROR',
    errors: {},
    message: error.response ? error.message || 'Request failed.' : fallbackMessage,
    path: error.config?.url || '',
    status,
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(normalizeApiError(error))
  },
)

export { API_BASE_URL, TOKEN_KEY }
