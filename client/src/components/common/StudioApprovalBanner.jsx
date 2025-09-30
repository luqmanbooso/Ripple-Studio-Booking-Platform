import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Building, X, Mail } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Button from '../ui/Button'

const StudioApprovalBanner = () => {
  const { user } = useSelector(state => state.auth)
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show banner if user is not a studio, dismissed, or studio is approved
  if (!user || user.role !== 'studio' || isDismissed) {
    return null
  }

  // Check if studio is approved (this would come from studio data in real implementation)
  const isStudioApproved = user.studioApproved !== false // Assume approved if not explicitly false

  if (isStudioApproved) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start space-x-3">
        <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-300 mb-1">
            Studio Approval Pending
          </h3>
          <p className="text-sm text-blue-200 mb-3">
            Your studio registration is currently under review by our admin team. You'll receive an email notification once your studio is approved and ready to accept bookings.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
            <h4 className="text-sm font-medium text-blue-300 mb-2">
              While you wait, you can:
            </h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Complete your studio profile with detailed information</li>
              <li>• Upload high-quality photos of your studio</li>
              <li>• Set up your services and pricing</li>
              <li>• Configure your availability schedule</li>
            </ul>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/dashboard/profile">
              <Button
                size="sm"
                variant="outline"
                icon={<Building className="w-4 h-4" />}
                className="border-blue-400 text-blue-300 hover:bg-blue-500/10"
              >
                Complete Profile
              </Button>
            </Link>
            
            <Link to="/contact">
              <Button
                size="sm"
                variant="ghost"
                icon={<Mail className="w-4 h-4" />}
                className="text-blue-400 hover:text-blue-300"
              >
                Contact Support
              </Button>
            </Link>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDismissed(true)}
              icon={<X className="w-4 h-4" />}
              className="text-blue-400 hover:text-blue-300"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StudioApprovalBanner
