import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const Security = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(passwordSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // TODO: Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Password updated successfully')
      reset()
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      status: 'disabled',
      action: 'Enable'
    },
    {
      title: 'Login Notifications',
      description: 'Get notified when someone logs into your account',
      status: 'enabled',
      action: 'Disable'
    },
    {
      title: 'Active Sessions',
      description: 'Manage devices that are currently logged in',
      status: 'info',
      action: 'View'
    }
  ]

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
              Security Settings
            </h1>
            <p className="text-gray-400">
              Manage your account security and privacy preferences
            </p>
          </div>

          {/* Change Password */}
          <Card className="mb-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-6">
              Change Password
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.currentPassword?.message}
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-300"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-300"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={<Lock className="w-5 h-5" />}
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

              <Button type="submit" loading={isLoading}>
                Update Password
              </Button>
            </form>
          </Card>

          {/* Security Features */}
          <Card className="mb-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-6">
              Security Features
            </h3>
            
            <div className="space-y-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-100 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {feature.status === 'enabled' && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        Enabled
                      </span>
                    )}
                    {feature.status === 'disabled' && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                        Disabled
                      </span>
                    )}
                    <Button variant="outline" size="sm">
                      {feature.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Security Alert */}
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
              <div>
                <h4 className="font-medium text-gray-100 mb-2">
                  Security Recommendation
                </h4>
                <p className="text-gray-300 text-sm mb-4">
                  We recommend enabling two-factor authentication to add an extra layer of security to your account. This helps protect your account even if your password is compromised.
                </p>
                <Button size="sm" icon={<Shield className="w-4 h-4" />}>
                  Enable 2FA
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Security
