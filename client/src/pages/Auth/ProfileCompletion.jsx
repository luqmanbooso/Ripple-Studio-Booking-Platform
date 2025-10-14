import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Phone, Music, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { updateUser } from '../../store/authSlice'
import api from '../../lib/axios'

const profileCompletionSchema = z.object({
  phone: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
})

const ProfileCompletion = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      phone: user?.phone || '',
      country: user?.country || 'Sri Lanka',
      city: user?.city || '',
    },
  })

  useEffect(() => {
    // Redirect if user is not logged in or profile is already complete
    if (!user) {
      navigate('/login')
      return
    }

    if (user.isProfileComplete) {
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.put('/auth/complete-profile', data)
      const { user: updatedUser } = response.data.data

      dispatch(updateUser(updatedUser))
      setIsSuccess(true)

      toast.success('Profile completed successfully!')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // For now, just redirect to dashboard - in future could allow partial completion
    navigate('/dashboard')
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-accent-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Ripple!</h2>
            <p className="text-gray-600">Your profile is now complete. Redirecting to dashboard...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Music className="w-12 h-12 text-primary-500" />
            <span className="text-2xl font-bold text-gradient">Ripple</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Let's finish setting up
          </h2>
          <p className="mt-2 text-gray-600">
            Just a few details to make your experience better—takes under a minute.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          {/* User Info Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar.url || user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Phone number (optional)"
              type="tel"
              icon={<Phone className="w-5 h-5" />}
              placeholder="Enter your phone number"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Country"
              icon={<MapPin className="w-5 h-5" />}
              placeholder="Enter your country"
              error={errors.country?.message}
              {...register('country')}
            />

            <Input
              label="City"
              icon={<MapPin className="w-5 h-5" />}
              placeholder="Enter your city"
              error={errors.city?.message}
              {...register('city')}
            />

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>Why we need this:</strong> Location helps us show you nearby studios and personalized recommendations.
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Completing setup...' : 'Complete my profile'}
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium py-2 transition-colors"
            >
              Skip for now
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfileCompletion