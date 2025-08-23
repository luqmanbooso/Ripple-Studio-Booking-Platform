import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Music, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import api from '../../lib/axios'

const Verify = () => {
  const [status, setStatus] = useState('loading')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const verifyEmail = async () => {
      try {
        await api.post('/auth/verify-email', { token })
        setStatus('success')
        toast.success('Email verified successfully!')
      } catch (error) {
        setStatus('error')
        toast.error('Verification failed')
      }
    }

    verifyEmail()
  }, [token])

  const handleContinue = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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

          {status === 'loading' && (
            <div className="card text-center py-12">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary-500" />
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-400">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="card text-center py-12"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-400 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Button onClick={handleContinue} size="lg">
                Continue to Sign In
              </Button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="card text-center py-12"
            >
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-400 mb-6">
                The verification link is invalid or has expired. Please try signing up again.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/register')} size="lg">
                  Sign Up Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Verify
