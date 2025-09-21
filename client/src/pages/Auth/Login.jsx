import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Music } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import { setCredentials } from '../../store/authSlice'
import api from '../../lib/axios'
import { useEffect } from 'react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const mode = useSelector((s) => s.theme.mode)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', data)
      const { user, accessToken } = response.data.data
      
      dispatch(setCredentials({ user, token: accessToken }))
      toast.success(`Welcome back, ${user.name}!`)
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Google Identity Services integration (client-side)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const handleCredentialResponse = async (response) => {
      try {
        const idToken = response?.credential;
        if (!idToken) return;
        setIsLoading(true);
        const res = await api.post('/auth/google', { idToken });
        const { user, accessToken } = res.data.data;
        dispatch(setCredentials({ user, token: accessToken }));
        toast.success(`Welcome, ${user.name}`);
        navigate(from, { replace: true });
      } catch (err) {
        console.error('Google sign-in failed', err);
        toast.error(err.response?.data?.message || 'Google sign-in failed');
      } finally {
        setIsLoading(false);
      }
    };

    // Load Google script if not present
    const existing = document.getElementById('google-client-script');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-client-script';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse
          });
          // Render button into container
          window.google.accounts.id.renderButton(
            document.getElementById('g_id_signin'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      };
      document.head.appendChild(script);
    } else if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(document.getElementById('g_id_signin'), { theme: 'outline', size: 'large', width: '100%' });
    }

    return () => {
      // No cleanup available for GSI button; keep it simple
    };
  }, [dispatch, from, navigate]);

  return (
    <div className="min-h-screen ${mode === 'dark' ? 'text-gray-200' : 'text-gray-900'} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <Music className="w-12 h-12 text-primary-500" />
            <span className="text-2xl font-bold text-gradient">Ripple</span>
          </Link>
          <h2 className={`text-3xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Welcome back
          </h2>
          <p className={`mt-2 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to your account to continue
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${mode === 'dark' ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'} rounded-3xl p-8 shadow-2xl`}
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 h-12 rounded-xl font-medium text-base focus:ring-2 focus:ring-primary-500/50 transition-all duration-200 shadow-sm focus:shadow-lg ${errors.email ? 'border-red-500 focus:border-red-400' : ''} ${mode === 'dark' ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400 mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 h-12 rounded-xl font-medium text-base focus:ring-2 focus:ring-primary-500/50 transition-all duration-200 shadow-sm focus:shadow-lg ${errors.password ? 'border-red-500 focus:border-red-400' : ''} ${mode === 'dark' ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-500 hover:text-primary-400 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${mode === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons - Google only (Facebook removed) */}
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div id="g_id_signin" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
