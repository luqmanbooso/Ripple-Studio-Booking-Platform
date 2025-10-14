import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      state.isLoading = false
      
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({ user, token }))
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        
        // Update localStorage
        const savedAuth = JSON.parse(localStorage.getItem('auth') || '{}')
        localStorage.setItem('auth', JSON.stringify({
          ...savedAuth,
          user: state.user
        }))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      
      // Clear localStorage
      localStorage.removeItem('auth')
      
      // Signal to axios interceptor that we're logging out
      window.isLoggingOut = true
      setTimeout(() => { window.isLoggingOut = false }, 1000) // Reset after 1 second
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    initializeAuth: (state) => {
      // Initialize from localStorage
      try {
        const savedAuth = localStorage.getItem('auth')
        if (savedAuth) {
          const { user, token } = JSON.parse(savedAuth)
          if (user && token) {
            state.user = user
            state.token = token
            state.isAuthenticated = true
          }
        }
      } catch (error) {
        localStorage.removeItem('auth')
      }
      state.isLoading = false
    },
  },
})

export const { setCredentials, updateUser, logout, setLoading, initializeAuth } = authSlice.actions

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsLoading = (state) => state.auth.isLoading

export default authSlice.reducer
