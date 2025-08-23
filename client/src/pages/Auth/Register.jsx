import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Music, 
  Mic, 
  Building, 
  Users 
} from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { setCredentials } from '../../store/authSlice'
import api from '../../lib/axios'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'artist', 'studio']),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const roleOptions = [
  {
    value: 'client',
    label: 'Client',
    icon: Users,
    description: 'Book sessions with artists and studios'
  },
  {
    value: 'artist',
    label: 'Artist',
    icon: Mic,
    description: 'Offer your musical services'
  },
  {
    value: 'studio',
    label: 'Studio',
    icon: Building,
    description: 'Rent out your recording space'
  }
]

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('client')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'client',
    },
  })

  const watchedRole = watch('role')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/register', data)
      const { user, accessToken } = response.data.data
      
      dispatch(setCredentials({ user, token: accessToken }))
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setValue('role', role)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <Music className="w-12 h-12 text-primary-500" />
            <span className="text-2xl font-bold text-gradient">MusicBooking</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-100">
            Join our community
          </h2>
          <p className="mt-2 text-gray-400">
            Create your account and start making music
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                I want to join as a
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        watchedRole === option.value
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleRoleSelect(option.value)}
                    >
                      <div className="text-center">
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${
                          watchedRole === option.value ? 'text-primary-400' : 'text-gray-400'
                        }`} />
                        <h3 className="font-medium text-gray-100 mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <input type="hidden" {...register('role')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full name"
                icon={<User className="w-5 h-5" />}
                placeholder="Enter your full name"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email address"
                type="email"
                icon={<Mail className="w-5 h-5" />}
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={<Lock className="w-5 h-5" />}
                  placeholder="Create a password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={<Lock className="w-5 h-5" />}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-dark-700"
                {...register('terms')}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-400 hover:text-primary-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-400">{errors.terms.message}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
            >
              Create account
            </Button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-400 hover:text-primary-300"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
