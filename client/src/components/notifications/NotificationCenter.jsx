import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Check, 
  Calendar, 
  CreditCard, 
  Star, 
  AlertCircle,
  Info
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../ui/Button'

const NotificationCenter = ({ isOpen, onClose }) => {
  const { user } = useSelector(state => state.auth)
  const [notifications, setNotifications] = useState([])

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: 'Your booking at Sound Studio has been confirmed for tomorrow at 2:00 PM',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        icon: Calendar,
        color: 'text-green-500'
      },
      {
        id: 2,
        type: 'payment_received',
        title: 'Payment Received',
        message: 'You received $150 for the recording session with John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        icon: CreditCard,
        color: 'text-blue-500'
      },
      {
        id: 3,
        type: 'review_received',
        title: 'New Review',
        message: 'You received a 5-star review from Sarah Wilson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        icon: Star,
        color: 'text-yellow-500'
      },
      {
        id: 4,
        type: 'booking_request',
        title: 'New Booking Request',
        message: 'Mike Johnson wants to book your studio for next week',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: true,
        icon: AlertCircle,
        color: 'text-orange-500'
      }
    ]

    // Filter notifications based on user role
    const filteredNotifications = mockNotifications.filter(notification => {
      if (user?.role === 'client') {
        return ['booking_confirmed', 'booking_cancelled', 'review_reminder'].includes(notification.type)
      } else if (user?.role === 'studio') {
        return ['booking_request', 'payment_received', 'review_received'].includes(notification.type)
      }
      return true
    })

    setNotifications(filteredNotifications)
  }, [user?.role])

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    toast.success('Notification deleted')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-16 z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon={<X className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const Icon = notification.icon
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ${
                        !notification.read ? 'ring-2 ring-blue-500' : ''
                      }`}>
                        <Icon className={`w-4 h-4 ${notification.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                icon={<Check className="w-3 h-3" />}
                                className="text-blue-500 hover:text-blue-700"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              icon={<X className="w-3 h-3" />}
                              className="text-red-500 hover:text-red-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notifications
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              View all notifications
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default NotificationCenter
