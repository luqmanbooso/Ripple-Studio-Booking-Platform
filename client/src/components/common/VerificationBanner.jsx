import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Mail, X, RefreshCw } from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../ui/Button'

const VerificationBanner = () => {
  const { user } = useSelector(state => state.auth)
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show banner if user is verified, dismissed, or not a client
  if (!user || user.verified || isDismissed || user.role !== 'client') {
    return null
  }

  const resendVerification = async () => {
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Verification email sent successfully!')
      } else {
        toast.error(data.message || 'Failed to resend verification email')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-300 mb-1">
            Email Verification Required
          </h3>
          <p className="text-sm text-orange-200 mb-3">
            Please verify your email address to start booking studios. Check your inbox for a verification email.
          </p>
          
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={resendVerification}
              disabled={isResending}
              icon={isResending ? 
                <RefreshCw className="w-4 h-4 animate-spin" /> : 
                <Mail className="w-4 h-4" />
              }
              className="border-orange-400 text-orange-300 hover:bg-orange-500/10"
            >
              {isResending ? 'Sending...' : 'Resend Email'}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDismissed(true)}
              icon={<X className="w-4 h-4" />}
              className="text-orange-400 hover:text-orange-300"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VerificationBanner
