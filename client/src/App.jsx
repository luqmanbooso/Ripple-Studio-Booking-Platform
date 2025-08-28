import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

// Layout components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ParticleBackground from './components/common/ParticleBackground'

// Pages
import Home from './pages/Home'
import Search from './pages/Search'
import ArtistProfile from './pages/ArtistProfile'
import StudioProfile from './pages/StudioProfile'
import NewBooking from './pages/NewBooking'
import Checkout from './pages/Checkout'
import ThankYou from './pages/ThankYou'
import Community from './pages/Community'
import Pricing from './pages/Pricing'
import Blog from './pages/Blog'
import About from './pages/About'
import Contact from './pages/Contact'

// Auth pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Verify from './pages/Auth/Verify'

// Dashboard pages
import ClientDashboard from './pages/Dashboard/ClientDashboard'
import ArtistDashboard from './pages/Dashboard/ArtistDashboard'
import StudioDashboard from './pages/Dashboard/StudioDashboard'
import AdminDashboard from './pages/Dashboard/AdminDashboard'

// Settings pages
import Profile from './pages/Settings/Profile'
import Security from './pages/Settings/Security'

// Store
import { setCredentials } from './store/authSlice'
import { setTheme, setReducedMotion } from './store/themeSlice'
import { initializeSocket } from './lib/socket'

function App() {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const { mode, animations } = useSelector((state) => state.theme)

  useEffect(() => {
    // Check for existing auth in localStorage
    const savedAuth = localStorage.getItem('auth')
    if (savedAuth) {
      try {
        const { user, token } = JSON.parse(savedAuth)
        dispatch(setCredentials({ user, token }))
      } catch (error) {
        localStorage.removeItem('auth')
      }
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      dispatch(setTheme(savedTheme))
    }

    // Set initial theme class
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    dispatch(setReducedMotion(prefersReducedMotion))

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (e) => {
      if (!localStorage.getItem('theme')) {
        dispatch(setTheme(e.matches ? 'dark' : 'light'))
      }
    }
    mediaQuery.addEventListener('change', handleThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [dispatch, mode])

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (user && token) {
      initializeSocket(token)
    }
  }, [user, token])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      mode === 'dark' 
        ? 'bg-dark-950 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Particle Background */}
      <ParticleBackground />
      
      <Navbar />
      
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artists/:id" element={<ArtistProfile />} />
            <Route path="/studios/:id" element={<StudioProfile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/genres" element={<Search />} />
            <Route path="/featured" element={<Search />} />
            <Route path="/tools" element={<Blog />} />
            <Route path="/stories" element={<Blog />} />
            <Route path="/help" element={<Blog />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            
            {/* Protected routes */}
            <Route path="/booking/new" element={
              <ProtectedRoute>
                <NewBooking />
              </ProtectedRoute>
            } />
            <Route path="/booking/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/booking/success" element={
              <ProtectedRoute>
                <ThankYou />
              </ProtectedRoute>
            } />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            
            {/* Settings routes */}
            <Route path="/settings/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings/security" element={
              <ProtectedRoute>
                <Security />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRoutes />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  )
}

// Dashboard router component
function DashboardRouter() {
  const { user } = useSelector((state) => state.auth)
  
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case 'client':
      return <ClientDashboard />
    case 'artist':
      return <ArtistDashboard />
    case 'studio':
      return <StudioDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <ClientDashboard />
  }
}

// Admin routes component
function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
    </Routes>
  )
}

export default App