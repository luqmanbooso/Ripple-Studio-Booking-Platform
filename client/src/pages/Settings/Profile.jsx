import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { useSelector } from 'react-redux'
import { useUpdateProfileMutation } from '../../store/userApi'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
})

const Profile = () => {
  const { user } = useSelector(state => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      country: user?.country || '',
      city: user?.city || '',
    }
  })

  const onSubmit = async (data) => {
    try {
      await updateProfile(data).unwrap()
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-400">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Photo */}
          <Card className="mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full overflow-hidden">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  Profile Photo
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  Upload a photo to personalize your account
                </p>
                <div className="flex space-x-3">
                  <Button size="sm">Upload Photo</Button>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Information */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-100">
                Personal Information
              </h3>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  icon={<User className="w-5 h-5" />}
                  disabled={!isEditing}
                  error={errors.name?.message}
                  {...register('name')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-field pl-10 bg-gray-800"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <Input
                  label="Phone Number"
                  icon={<Phone className="w-5 h-5" />}
                  disabled={!isEditing}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="input-field pl-10 bg-gray-800 capitalize"
                    />
                  </div>
                </div>

                <Input
                  label="Country"
                  icon={<MapPin className="w-5 h-5" />}
                  disabled={!isEditing}
                  error={errors.country?.message}
                  {...register('country')}
                />

                <Input
                  label="City"
                  icon={<MapPin className="w-5 h-5" />}
                  disabled={!isEditing}
                  error={errors.city?.message}
                  {...register('city')}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={isLoading}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Account Status */}
          <Card className="mt-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Account Verified</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user?.verified 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {user?.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Account Type</span>
                <span className="text-gray-100 capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Member Since</span>
                <span className="text-gray-100">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
