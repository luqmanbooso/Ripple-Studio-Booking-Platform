import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, CheckCircle, XCircle, Clock, AlertCircle, 
  Users, Calendar, DollarSign, MessageCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useCompleteBookingMutation, useCancelBookingMutation } from '../../store/bookingApi'

const BulkStatusUpdateModal = ({ isOpen, onClose, selectedBookings, onUpdate }) => {
  const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation()
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation()
  
  const isLoading = isCompleting || isCancelling
  
  const [bulkAction, setBulkAction] = useState({
    status: '',
    reason: '',
    notifyClients: true,
    refundAmount: 0
  })

  const statusOptions = [
    { 
      value: 'confirmed', 
      label: 'Confirm Bookings', 
      icon: CheckCircle, 
      color: 'text-green-600',
      description: 'Mark selected bookings as confirmed'
    },
    { 
      value: 'cancelled', 
      label: 'Cancel Bookings', 
      icon: XCircle, 
      color: 'text-red-600',
      description: 'Cancel selected bookings with optional refund'
    },
    { 
      value: 'completed', 
      label: 'Mark as Completed', 
      icon: CheckCircle, 
      color: 'text-blue-600',
      description: 'Mark selected bookings as completed'
    },
    { 
      value: 'in_progress', 
      label: 'Mark as In Progress', 
      icon: Clock, 
      color: 'text-yellow-600',
      description: 'Mark selected bookings as currently in progress'
    }
  ]

  const handleBulkUpdate = async () => {
    if (!bulkAction.status) {
      toast.error('Please select a status to update')
      return
    }


    try {
      const updatePromises = selectedBookings.map(booking => {
        if (bulkAction.status === 'completed') {
          return completeBooking({
            id: booking._id,
            notes: bulkAction.reason || 'Bulk completion'
          }).unwrap()
        } else if (bulkAction.status === 'cancelled') {
          return cancelBooking({
            id: booking._id,
            reason: bulkAction.reason || 'Bulk cancellation'
          }).unwrap()
        } else {
          throw new Error('Unsupported bulk operation')
        }
      })

      await Promise.all(updatePromises)
      
      toast.success(`Successfully updated ${selectedBookings.length} booking(s)`)
      onUpdate?.()
      onClose()
      
      // Reset form
      setBulkAction({
        status: '',
        reason: '',
        notifyClients: true,
        refundAmount: 0
      })
    } catch (error) {
      console.error('Failed to update bookings:', error)
      toast.error(error?.data?.message || 'Failed to update bookings')
    }
  }

  const calculateTotalRefund = () => {
    if (bulkAction.status !== 'cancelled') return 0
    return selectedBookings.reduce((total, booking) => {
      return total + (booking.totalAmount || booking.price || 0)
    }, 0)
  }

  const selectedStatus = statusOptions.find(option => option.value === bulkAction.status)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bulk Status Update
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Update {selectedBookings.length} selected booking(s)
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Selected Bookings Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Selected Bookings ({selectedBookings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {selectedBookings.slice(0, 6).map((booking, index) => (
                  <div key={booking._id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.client?.name || booking.user?.name || 'Client'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(booking.start).toLocaleDateString()} • {booking.service?.name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </span>
                  </div>
                ))}
                {selectedBookings.length > 6 && (
                  <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                    ... and {selectedBookings.length - 6} more booking(s)
                  </div>
                )}
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Select Action
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBulkAction(prev => ({ ...prev, status: option.value }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        bulkAction.status === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 ${option.color} mt-0.5`} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reason (required for cancellation) */}
            {bulkAction.status && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {bulkAction.status === 'cancelled' ? 'Cancellation Reason *' : 'Notes (Optional)'}
                </label>
                <textarea
                  value={bulkAction.reason}
                  onChange={(e) => setBulkAction(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={
                    bulkAction.status === 'cancelled' 
                      ? 'Please provide a reason for cancellation...' 
                      : 'Optional notes for this status update...'
                  }
                />
              </div>
            )}

            {/* Refund Options (for cancellations) */}
            {bulkAction.status === 'cancelled' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Refund Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      Total Amount to Refund:
                    </span>
                    <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                      LKR {calculateTotalRefund().toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-yellow-800 dark:text-yellow-200">
                      Custom Refund Amount (Optional)
                    </label>
                    <input
                      type="number"
                      value={bulkAction.refundAmount}
                      onChange={(e) => setBulkAction(prev => ({ ...prev, refundAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-yellow-600 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-yellow-500"
                      placeholder="Leave empty for full refund"
                      min="0"
                      max={calculateTotalRefund()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Options */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notify-clients"
                checked={bulkAction.notifyClients}
                onChange={(e) => setBulkAction(prev => ({ ...prev, notifyClients: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="notify-clients" className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send notification to all affected clients
              </label>
            </div>

            {/* Summary */}
            {selectedStatus && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Action Summary
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• {selectedStatus.label} for {selectedBookings.length} booking(s)</p>
                  {bulkAction.reason && <p>• Reason: {bulkAction.reason}</p>}
                  {bulkAction.status === 'cancelled' && (
                    <p>• Refund: LKR {(bulkAction.refundAmount || calculateTotalRefund()).toLocaleString()}</p>
                  )}
                  <p>• Client notifications: {bulkAction.notifyClients ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpdate}
              disabled={isLoading || !bulkAction.status || (bulkAction.status === 'cancelled' && !bulkAction.reason.trim())}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isLoading ? 'Updating...' : `Update ${selectedBookings.length} Booking(s)`}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default BulkStatusUpdateModal
