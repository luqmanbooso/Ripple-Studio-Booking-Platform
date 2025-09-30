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
  Users,
  MapPin,
  Phone,
  Globe,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { setCredentials } from '../../store/authSlice'
import api from '../../lib/axios'
import { useEffect } from 'react'

// Validation Item Component
const ValidationItem = ({ label, isValid, message }) => {
  return (
    <div className={`flex items-center space-x-2 p-2 rounded ${
      isValid ? 'bg-green-500/10' : 'bg-red-500/10'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isValid ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className={`text-xs ${
        isValid ? 'text-green-400' : 'text-red-400'
      }`}>
        {label}
      </span>
      {!isValid && message && (
        <span className="text-xs text-gray-400 truncate">
          - {message}
        </span>
      )}
    </div>
  )
}

// Password strength checker
const checkPasswordStrength = (password) => {
  if (!password) return { strength: 0, feedback: [] }
  
  const checks = [
    { test: password.length >= 8, message: 'At least 8 characters' },
    { test: /[a-z]/.test(password), message: 'One lowercase letter' },
    { test: /[A-Z]/.test(password), message: 'One uppercase letter' },
    { test: /\d/.test(password), message: 'One number' },
    { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'One special character' },
  ]
  
  const passedChecks = checks.filter(check => check.test).length
  const feedback = checks.filter(check => !check.test).map(check => check.message)
  
  return {
    strength: passedChecks,
    feedback,
    level: passedChecks <= 2 ? 'weak' : passedChecks <= 3 ? 'medium' : 'strong'
  }
}

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .refine(password => {
      const { strength } = checkPasswordStrength(password)
      return strength >= 3
    }, 'Password should include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'studio']),
  phone: z.string().optional().or(z.literal('')),
  country: z.string().default('Sri Lanka'),
  city: z.string().min(1, 'City is required'),
  // Studio-specific fields
  studioName: z.string().optional().or(z.literal('')),
  studioDescription: z.string().optional().or(z.literal('')),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => {
  if (data.role === 'studio') {
    return data.studioName && data.studioName.trim().length > 0;
  }
  return true;
}, {
  message: "Studio name is required for studio accounts",
  path: ["studioName"],
})

const roleOptions = [
  {
    value: 'client',
    label: 'Client',
    icon: Users,
    description: 'Book sessions with studios'
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
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedInstruments, setSelectedInstruments] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Define genres and instruments arrays
  const genres = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Country', 'Folk', 'Reggae']
  const instruments = ['Guitar', 'Piano', 'Drums', 'Bass', 'Vocals', 'Violin', 'Saxophone', 'Trumpet', 'Flute', 'Synthesizer']

  // Handle genre selection
  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  // Handle instrument selection  
  const handleInstrumentToggle = (instrument) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    )
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'client',
      country: 'Sri Lanka',
      city: '',
      terms: false,
    },
  })

  const watchedRole = watch('role')

  // Google Identity Services integration for register
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
        navigate('/dashboard');
      } catch (err) {
        console.error('Google sign-up failed', err);
        toast.error(err.response?.data?.message || 'Google sign-up failed');
      } finally {
        setIsLoading(false);
      }
    };

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
          const buttonElement = document.getElementById('g_id_signin_register');
          if (buttonElement) {
            window.google.accounts.id.renderButton(buttonElement, { theme: 'outline', size: 'large' });
          }
        }
      };
      document.head.appendChild(script);
    } else if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      });
      const buttonElement = document.getElementById('g_id_signin_register');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, { theme: 'outline', size: 'large' });
      }
    }
  }, [dispatch, navigate]);

  const onSubmit = async (data) => {
    console.log('Form data:', data)
    console.log('Form errors:', errors)
    setIsLoading(true)
    try {
      // Prepare the registration data based on role
      const registrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        country: 'Sri Lanka', // Always set to Sri Lanka
        city: data.city,
      }

      // Add role-specific data
      if (data.role === 'studio') {
        registrationData.studio = {
          name: data.studioName,
          description: data.studioDescription || '',
          location: {
            country: 'Sri Lanka', // Always set to Sri Lanka
            city: data.city
          }
        }
      }

      const response = await api.post('/auth/register', registrationData)
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
    // Reset role-specific fields when changing roles
    if (role !== 'studio') {
      setValue('studioName', '')
      setValue('studioDescription', '')
    }
    // Trigger validation after role change
    trigger(['role', 'studioName'])
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
            <span className="text-2xl font-bold text-gradient">Ripple</span>
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
            {/* Validation Status Summary */}
            <div className="space-y-3">
              {/* Progress Indicator */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">
                    Registration Progress
                  </h3>
                  <span className="text-xs text-gray-400">
                    {Object.keys(errors).length === 0 ? 'Ready to submit!' : `${Object.keys(errors).length} issues remaining`}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      Object.keys(errors).length === 0 
                        ? 'bg-green-500' 
                        : Object.keys(errors).length <= 2 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.max(20, 100 - (Object.keys(errors).length * 15))}%` 
                    }}
                  />
                </div>

                {/* Validation Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <ValidationItem 
                    label="Full name" 
                    isValid={!errors.name} 
                    message={errors.name?.message}
                  />
                  <ValidationItem 
                    label="Valid email" 
                    isValid={!errors.email} 
                    message={errors.email?.message}
                  />
                  <ValidationItem 
                    label="Strong password" 
                    isValid={!errors.password} 
                    message={errors.password?.message}
                  />
                  <ValidationItem 
                    label="Passwords match" 
                    isValid={!errors.confirmPassword} 
                    message={errors.confirmPassword?.message}
                  />
                  <ValidationItem 
                    label="City selected" 
                    isValid={!errors.city} 
                    message={errors.city?.message}
                  />
                  {watchedRole === 'studio' && (
                    <ValidationItem 
                      label="Studio name" 
                      isValid={!errors.studioName} 
                      message={errors.studioName?.message}
                    />
                  )}
                  <ValidationItem 
                    label="Terms accepted" 
                    isValid={!errors.terms} 
                    message={errors.terms?.message}
                  />
                </div>
              </div>

              {/* Detailed Errors */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Issues to fix:
                  </h3>
                  <ul className="text-sm text-red-300 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>
                          <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong>{' '}
                          {error?.message || `${field} is invalid`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                I want to join as a
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Basic Information */}
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
              <Input
                label="Phone number (optional)"
                type="tel"
                icon={<Phone className="w-5 h-5" />}
                placeholder="Enter your phone number"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <div className="relative">
                  <div className="flex items-center px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
                    <Globe className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-gray-200">Sri Lanka</span>
                  </div>
                </div>
                <input type="hidden" {...register('country')} value="Sri Lanka" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City"
                icon={<MapPin className="w-5 h-5" />}
                placeholder="Enter your city"
                error={errors.city?.message}
                {...register('city')}
              />

              <div className="flex-1"></div>
            </div>

            {/* Artist-specific fields */}
            {watchedRole === 'artist' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 p-4 border border-gray-600 rounded-lg bg-gray-800/20"
              >
                <h3 className="text-lg font-medium text-gray-100 flex items-center">
                  <Mic className="w-5 h-5 mr-2" />
                  Artist Profile
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Hourly rate ($)"
                    type="number"
                    icon={<DollarSign className="w-5 h-5" />}
                    placeholder="Enter your hourly rate"
                    error={errors.hourlyRate?.message}
                    {...register('hourlyRate', { valueAsNumber: true })}
                  />
                  
                  <div className="flex-1"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedGenres.includes(genre)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {errors.genres && (
                    <p className="text-sm text-red-400 mt-1">{errors.genres.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instruments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {instruments.map(instrument => (
                      <button
                        key={instrument}
                        type="button"
                        onClick={() => handleInstrumentToggle(instrument)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedInstruments.includes(instrument)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {instrument}
                      </button>
                    ))}
                  </div>
                  {errors.instruments && (
                    <p className="text-sm text-red-400 mt-1">{errors.instruments.message}</p>
                  )}
                </div>

                <Input
                  label="Bio (optional)"
                  placeholder="Tell us about yourself and your music"
                  error={errors.bio?.message}
                  {...register('bio')}
                />
              </motion.div>
            )}

            {/* Studio-specific fields */}
            {watchedRole === 'studio' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 p-4 border border-gray-600 rounded-lg bg-gray-800/20"
              >
                <h3 className="text-lg font-medium text-gray-100 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Studio Profile
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Studio name"
                    placeholder="Enter your studio name"
                    error={errors.studioName?.message}
                    {...register('studioName')}
                  />
                  
                  <div className="flex-1"></div>
                </div>

                <Input
                  label="Studio description (optional)"
                  placeholder="Describe your studio and services"
                  error={errors.studioDescription?.message}
                  {...register('studioDescription')}
                />
              </motion.div>
            )}

            {/* Password fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative space-y-2">
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
                
                {/* Password Strength Indicator */}
                {watch('password') && (
                  <div className="mt-2 space-y-2">
                    {(() => {
                      const passwordStrength = checkPasswordStrength(watch('password'))
                      return (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">Strength:</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`w-4 h-1 rounded-full ${
                                    level <= passwordStrength.strength
                                      ? passwordStrength.level === 'weak'
                                        ? 'bg-red-500'
                                        : passwordStrength.level === 'medium'
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                      : 'bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`text-xs font-medium ${
                              passwordStrength.level === 'weak'
                                ? 'text-red-400'
                                : passwordStrength.level === 'medium'
                                ? 'text-yellow-400'
                                : 'text-green-400'
                            }`}>
                              {passwordStrength.level}
                            </span>
                          </div>
                          
                          {passwordStrength.feedback.length > 0 && (
                            <div className="text-xs text-gray-400">
                              <span>Missing: </span>
                              {passwordStrength.feedback.join(', ')}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
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

            {/* Terms and Conditions */}
            <div className={`p-4 border rounded-lg transition-colors ${
              errors.terms 
                ? 'border-red-500/50 bg-red-500/5' 
                : 'border-gray-600 bg-gray-800/20'
            }`}>
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-dark-700 mt-0.5"
                  {...register('terms')}
                />
                <div className="flex-1">
                  <label htmlFor="terms" className="block text-sm text-gray-300 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-400 hover:text-primary-300 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-400 hover:text-primary-300 underline">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.terms && (
                    <p className="text-sm text-red-400 mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.terms.message}
                    </p>
                  )}
                  {!errors.terms && watch('terms') && (
                    <p className="text-sm text-green-400 mt-1 flex items-center">
                      <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                      Terms accepted
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button with Enhanced Feedback */}
            <div className="space-y-3">
              {Object.keys(errors).length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-center text-yellow-400 text-sm">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Complete all required fields to enable registration
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className={`w-full transition-all duration-300 ${
                  Object.keys(errors).length === 0 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                size="lg"
                loading={isLoading}
                disabled={isLoading || Object.keys(errors).length > 0}
              >
                {isLoading ? (
                  'Creating account...'
                ) : Object.keys(errors).length > 0 ? (
                  `Fix ${Object.keys(errors).length} issue${Object.keys(errors).length > 1 ? 's' : ''} to continue`
                ) : (
                  '✓ Create account'
                )}
              </Button>
              
              {Object.keys(errors).length === 0 && !isLoading && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center text-green-400 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    All fields are valid! Ready to create your account.
                  </div>
                </div>
              )}
            </div>

            {/* Google Sign-In Button */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div id="g_id_signin_register" className="w-full"></div>
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
