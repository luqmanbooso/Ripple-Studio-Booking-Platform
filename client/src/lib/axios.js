import axios from 'axios'
import { store } from '../store/store'
import { logout, setCredentials } from '../store/authSlice'
import toast from 'react-hot-toast'

// Create axios instance (use relative path so cookies are sent same-origin in dev)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true, // Include cookies for refresh token
})

// Separate axios instance for refresh calls to avoid interceptor recursion
const refreshInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
// Refresh lock + queue to prevent multiple refresh calls
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 from refresh endpoint itself, logout immediately
    if (originalRequest && originalRequest.url && originalRequest.url.includes('/auth/refresh') && error.response?.status === 401) {
      store.dispatch(logout())
      toast.error('Session expired. Please login again.')
      if (window.location.pathname !== '/login') window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // mark request for retry
      originalRequest._retry = true

      if (isRefreshing) {
        // queue the request until refresh finished
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const response = await refreshInstance.post('/auth/refresh')
        const { accessToken } = response.data.data

        // Update token in store
        const user = store.getState().auth.user
        store.dispatch(setCredentials({ user, token: accessToken }))

        processQueue(null, accessToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(logout())
        toast.error('Session expired. Please login again.')
        if (window.location.pathname !== '/login') window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

export default api
