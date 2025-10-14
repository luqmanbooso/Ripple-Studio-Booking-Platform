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
  studioType: z.string().optional().or(z.literal('')),
  studioAddress: z.string().optional().or(z.literal('')),
  hourlyRate: z.string().optional().or(z.literal('')),
  capacity: z.string().optional().or(z.literal('')),
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
}).refine(data => {
  if (data.role === 'studio') {
    return data.studioDescription && data.studioDescription.trim().length >= 20;
  }
  return true;
}, {
  message: "Please provide a description of at least 20 characters",
  path: ["studioDescription"],
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
  
  // Sri Lankan cities for dropdown
  const sriLankanCities = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Trincomalee', 
    'Batticaloa', 'Anuradhapura', 'Matara', 'Kurunegala', 'Ratnapura',
    'Badulla', 'Gampaha', 'Kalutara', 'Nuwara Eliya', 'Ampara'
  ]

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

  // Google Identity Services integration for register - only for clients
  useEffect(() => {
    if (selectedRole !== 'client') return;
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const handleCredentialResponse = async (response) => {
      try {
        const idToken = response?.credential;
        if (!idToken) return;
        setIsLoading(true);
        const res = await api.post('/auth/google', { idToken });
        const { user, accessToken, requiresProfileCompletion } = res.data.data;
        dispatch(setCredentials({ user, token: accessToken }));
        toast.success(`Welcome, ${user.name}`);
        
        // Always redirect to dashboard
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
            callback: handleCredentialResponse,
            ux_mode: 'popup'
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
        callback: handleCredentialResponse,
        ux_mode: 'popup'
      });
      const buttonElement = document.getElementById('g_id_signin_register');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, { theme: 'outline', size: 'large' });
      }
    }
  }, [dispatch, navigate, selectedRole]);

  const onSubmit = async (data) => {
    console.log('Form data:', data)
    setIsLoading(true)
    
    try {
      // Validate studio-specific fields
      if (data.role === 'studio') {
        if (!data.studioName || data.studioName.trim().length === 0) {
          toast.error('Studio name is required')
          setIsLoading(false)
          return
        }
        if (!data.studioDescription || data.studioDescription.trim().length < 20) {
          toast.error('Please provide a studio description of at least 20 characters')
          setIsLoading(false)
          return
        }
      }

      // Prepare the registration data based on role
      const registrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone || '',
        country: 'Sri Lanka',
        city: data.city,
      }

      // Add role-specific data
      if (data.role === 'studio') {
        registrationData.studio = {
          name: data.studioName.trim(),
          description: data.studioDescription.trim(),
          studioType: data.studioType || 'Recording',
          hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
          capacity: data.capacity ? parseInt(data.capacity) : undefined,
          location: {
            country: 'Sri Lanka',
            city: data.city,
            address: data.studioAddress?.trim() || ''
          }
        }
      }

      console.log('Sending registration data:', registrationData)
      const response = await api.post('/auth/register', registrationData)
      const { user, accessToken } = response.data.data
      
      dispatch(setCredentials({ user, token: accessToken }))
      
      if (data.role === 'studio') {
        toast.success('Studio registered! Pending admin approval.')
      } else {
        toast.success('Account created successfully!')
      }
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(errorMessage)
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <select
                  {...register('city')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select your city</option>
                  {sriLankanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-sm text-red-400 mt-1">{errors.city.message}</p>
                )}
              </div>

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
                className="space-y-6 p-6 border-2 border-blue-500/30 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">
                      Studio Information
                    </h3>
                    <p className="text-sm text-gray-400">
                      Tell us about your recording studio
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Studio name *"
                    placeholder="e.g., Harmony Sound Studios"
                    error={errors.studioName?.message}
                    {...register('studioName')}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Studio type
                    </label>
                    <select
                      {...register('studioType')}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select studio type</option>
                      <option value="Recording">Recording Studio</option>
                      <option value="Rehearsal">Rehearsal Space</option>
                      <option value="Production">Production Studio</option>
                      <option value="Mixing">Mixing & Mastering</option>
                      <option value="Podcast">Podcast Studio</option>
                    </select>
                    {errors.studioType && (
                      <p className="text-sm text-red-400 mt-1">{errors.studioType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hourly rate (LKR)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      error={errors.hourlyRate?.message}
                      {...register('hourlyRate')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can update this later
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Capacity (people)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      error={errors.capacity?.message}
                      {...register('capacity')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum number of people
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Studio address
                  </label>
                  <Input
                    placeholder="e.g., 123 Music Street, Colombo"
                    error={errors.studioAddress?.message}
                    {...register('studioAddress')}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Studio description *
                    </label>
                    <span className={`text-xs ${
                      watch('studioDescription')?.length >= 20 
                        ? 'text-green-400' 
                        : 'text-gray-500'
                    }`}>
                      {watch('studioDescription')?.length || 0}/20 min
                    </span>
                  </div>
                  <textarea
                    {...register('studioDescription')}
                    rows={4}
                    placeholder="Describe your studio, equipment, services, and what makes it special..."
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                      errors.studioDescription 
                        ? 'border-red-500' 
                        : watch('studioDescription')?.length >= 20
                          ? 'border-green-500'
                          : 'border-gray-600'
                    }`}
                  />
                  {errors.studioDescription && (
                    <p className="text-sm text-red-400 mt-1">{errors.studioDescription.message}</p>
                  )}
                  {!errors.studioDescription && watch('studioDescription')?.length > 0 && watch('studioDescription')?.length < 20 && (
                    <p className="text-sm text-yellow-400 mt-1">
                      {20 - watch('studioDescription').length} more characters needed
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Mention your equipment, acoustic treatment, and services offered
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-1">
                        After Registration
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Your studio will be reviewed by our admin team. Once approved, you'll receive an email 
                        and can login to complete your profile with services, equipment, and availability.
                      </p>
                    </div>
                  </div>
                </div>
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
            <div>
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-dark-700 mt-0.5"
                  {...register('terms')}
                />
                <div className="flex-1">
                  <label htmlFor="terms" className="block text-sm text-gray-300 leading-relaxed cursor-pointer">
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
                    <p className="text-sm text-red-400 mt-1">
                      {errors.terms.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            {/* Google Sign-In Button - Only show for clients */}
            {selectedRole === 'client' && (
              <>
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div id="g_id_signin_register" className="w-full"></div>
              </>
            )}
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
