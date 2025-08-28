import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    return savedTheme
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  return 'light'
}

const initialState = {
  mode: getInitialTheme(),
  animations: true,
  particleEffects: true,
  reducedMotion: false,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.mode)
      
      // Update document class
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload
      localStorage.setItem('theme', state.mode)
      
      // Update document class
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations
      localStorage.setItem('animations', state.animations.toString())
    },
    toggleParticleEffects: (state) => {
      state.particleEffects = !state.particleEffects
      localStorage.setItem('particleEffects', state.particleEffects.toString())
    },
    setReducedMotion: (state, action) => {
      state.reducedMotion = action.payload
    },
  },
})

export const { 
  toggleTheme, 
  setTheme, 
  toggleAnimations, 
  toggleParticleEffects, 
  setReducedMotion 
} = themeSlice.actions

export default themeSlice.reducer
