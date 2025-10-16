import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  DollarSign, 
  Check, 
  X, 
  Star,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../ui/Button'
import { useUpdateBookingMutation, useConfirmBookingMutation } from '../../store/bookingApi'
import ReviewModal from '../reviews/ReviewModal'

const BookingCard = ({ booking, userRole, onUpdate }) => {
  const [updateBooking, { isLoading }] = useUpdateBookingMutation()
  const [confirmBooking, { isLoading: confirmLoading }] = useConfirmBookingMutation()
  const [showReviewModal, setShowReviewModal] = useState(false)

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date))
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateBooking({
        id: booking._id,
        status: newStatus
      }).unwrap()
      
      toast.success(`Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`)
      onUpdate?.()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update booking')
    }
  }

  const handleConfirmBooking = async () => {
    try {
      await confirmBooking(booking._id).unwrap()
      toast.success('Booking confirmed successfully!')
      onUpdate?.()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to confirm booking')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'reservation_pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      case 'payment_pending':
        return 'Payment Due'
      case 'reservation_pending':
        return 'Reservation'
      default:
        return status?.replace('_', ' ') || 'Unknown'
    }
  }

  const canConfirm = userRole === 'studio' && ['payment_pending', 'reservation_pending'].includes(booking.status)
  const canCancel = ['payment_pending', 'confirmed', 'reservation_pending'].includes(booking.status)
  const canReview = booking.status === 'completed' && !booking.hasReview
  const isUpcoming = new Date(booking.start) > new Date()
  const isReservationPending = booking.status === 'reservation_pending'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                {userRole === 'client' ? (
                  <Building className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userRole === 'client' 
                    ? booking.studio?.name 
                    : booking.client?.name
                  }
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {booking.service?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
              <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                LKR {booking.price?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(booking.start)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Date
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatTime(booking.start)} - {formatTime(booking.end)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Time
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {userRole === 'studio' && booking.client && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Client Contact
              </h4>
              <div className="space-y-2">
                {booking.client.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{booking.client.email}</span>
                  </div>
                )}
                {booking.client.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{booking.client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Service Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Service Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">
                  {booking.service?.durationMins} minutes
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Price:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">
                  LKR {booking.service?.price?.toLocaleString()}
                </span>
              </div>
            </div>
            {booking.service?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {booking.service.description}
              </p>
            )}
          </div>

          {/* Reservation Pending Notice */}
          {isReservationPending && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    {userRole === 'studio' ? 'Payment Pending' : 'Complete Payment Required'}
                  </h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    {userRole === 'studio' 
                      ? 'Client needs to complete payment within 15 minutes to confirm this booking.'
                      : 'Please complete your payment to confirm this booking. You have 15 minutes from reservation time.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {canConfirm && (
              <Button
                onClick={handleConfirmBooking}
                loading={confirmLoading}
                icon={<Check className="w-4 h-4" />}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm Booking
              </Button>
            )}
            
            {canCancel && (
              <Button
                onClick={() => handleStatusUpdate('cancelled')}
                loading={isLoading}
                icon={<X className="w-4 h-4" />}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Cancel
              </Button>
            )}

            {canReview && (
              <Button
                onClick={() => setShowReviewModal(true)}
                icon={<Star className="w-4 h-4" />}
                variant="outline"
                className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
              >
                Leave Review
              </Button>
            )}

          </div>
        </div>

        {/* Status Timeline */}
        {booking.status !== 'payment_pending' && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-1 ${
                  ['confirmed', 'completed'].includes(booking.status) 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    ['confirmed', 'completed'].includes(booking.status) 
                      ? 'bg-green-600' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span>Confirmed</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  booking.status === 'completed' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    booking.status === 'completed' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span>Completed</span>
                </div>
              </div>
              <div>
                Created {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        booking={booking}
        type={userRole === 'client' ? 'studio' : 'client'}
      />
    </>
  )
}

export default BookingCard
