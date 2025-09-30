import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../ui/Button'
import { useCreateReviewMutation } from '../../store/reviewApi'

const ReviewModal = ({ isOpen, onClose, booking, type = 'studio' }) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [createReview, { isLoading }] = useCreateReviewMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      await createReview({
        targetType: type,
        targetId: type === 'studio' ? booking.studio._id : booking.client._id,
        booking: booking._id,
        rating,
        comment: comment.trim()
      }).unwrap()

      toast.success('Review submitted successfully!')
      onClose()
      setRating(0)
      setComment('')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to submit review')
    }
  }

  if (!isOpen) return null

  const targetName = type === 'studio' 
    ? booking?.studio?.name 
    : booking?.client?.name

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Rate Your Experience
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="w-4 h-4" />}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Info */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                How was your experience with
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {targetName}
              </p>
            </div>

            {/* Star Rating */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Rating
              </p>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors duration-200 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-gray-600 dark:text-gray-400 mt-2"
                >
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {comment.length}/500
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {booking?.service?.name}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(booking?.start).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                icon={<Send className="w-4 h-4" />}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ReviewModal
