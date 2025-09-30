import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyEmail()
    } else {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email for the correct link.')
    }
  }, [token, email])

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}&email=${email}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        toast.success('Email verified successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed')
        toast.error(data.message || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
      toast.error('Network error. Please try again.')
    }
  }

  const resendVerification = async () => {
    if (!email) {
      toast.error('Email address not found')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
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
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Spinner size="lg" className="text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-100 mb-4">
                Verifying Your Email
              </h1>
              <p className="text-gray-400 mb-6">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-100 mb-4">
                Email Verified!
              </h1>
              <p className="text-gray-400 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to login page in 3 seconds...
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Continue to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
              >
                <XCircle className="w-8 h-8 text-red-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-100 mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-400 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                {email && (
                  <Button
                    onClick={resendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                    icon={isResending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                )}
                
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <Link to="/contact" className="text-primary-400 hover:text-primary-300">
              Contact Support
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmail
