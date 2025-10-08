import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  Calendar,
  CreditCard,
  Star,
  AlertCircle,
  Info,
  Trash2,
  CheckCheck
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../ui/Button'
import {
  useGetNotificationsQuery,
  useGetNotificationStatsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} from '../../store/notificationApi'

const NotificationCenter = ({ isOpen, onClose }) => {
  const { user } = useSelector(state => state.auth)
  const [page, setPage] = useState(1)

  // API hooks
  const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery(
    { page, limit: 20 },
    { skip: !user }
  )
  const { data: stats } = useGetNotificationStatsQuery(undefined, { skip: !user })
  const [markAsReadMutation] = useMarkAsReadMutation()
  const [markAllAsRead] = useMarkAllAsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()

  const notifications = notificationsData?.notifications || []
  const pagination = notificationsData?.pagination || {}

  // Get notification icon and color based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_created':
      case 'booking_confirmed':
        return { icon: Calendar, color: 'text-green-500' }
      case 'booking_cancelled':
        return { icon: AlertCircle, color: 'text-red-500' }
      case 'payment_received':
        return { icon: CreditCard, color: 'text-blue-500' }
      case 'review_received':
        return { icon: Star, color: 'text-yellow-500' }
      case 'verification_approved':
        return { icon: Check, color: 'text-green-500' }
      case 'verification_rejected':
        return { icon: AlertCircle, color: 'text-red-500' }
      default:
        return { icon: Info, color: 'text-gray-500' }
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation(notificationId).unwrap()
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId).unwrap()
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col"
            data-notifications-panel
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {stats.unreadCount || 0} unread
                  </span>
                  {stats.unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto notification-scroll">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
                  <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No notifications yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                    You'll receive notifications for bookings, payments, and updates here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">{notifications.map((notification) => {
                    const { icon: IconComponent, color } = getNotificationIcon(notification.type)
                    return (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
                          !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'} transition-colors duration-200`}>
                            <IconComponent className={`w-4 h-4 ${color} ${!notification.isRead ? 'opacity-100' : 'opacity-70'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <p className={`text-sm font-medium truncate ${
                                  !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                {formatTimestamp(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-3">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification._id)}
                                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Mark as read
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteNotification(notification._id)}
                                className="inline-flex items-center text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-70 hover:opacity-100 transition-all duration-200"
                                title="Delete notification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Load More */}
            {pagination.hasNextPage && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setPage(prev => prev + 1)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationCenter
