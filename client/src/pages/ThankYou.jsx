import React, { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Home, Mail } from 'lucide-react'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const ThankYou = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Here you could verify the session with your backend
    // and update the booking status if needed
  }, [sessionId])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-4"
      >
        <Card className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-100 mb-4"
          >
            Booking Confirmed!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg mb-8"
          >
            Your payment has been processed successfully and your booking is confirmed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-700 rounded-lg p-6 mb-8"
          >
            <h3 className="font-semibold text-gray-100 mb-4">What happens next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-medium">Confirmation Email</p>
                  <p className="text-gray-400 text-sm">
                    You'll receive a detailed booking confirmation via email
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-accent-400 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-medium">Calendar Invite</p>
                  <p className="text-gray-400 text-sm">
                    Add the session to your calendar with all the details
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-medium">Provider Contact</p>
                  <p className="text-gray-400 text-sm">
                    The provider will reach out to coordinate final details
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/dashboard">
              <Button icon={<Calendar className="w-5 h-5" />}>
                View My Bookings
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" icon={<Home className="w-5 h-5" />}>
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}

export default ThankYou
