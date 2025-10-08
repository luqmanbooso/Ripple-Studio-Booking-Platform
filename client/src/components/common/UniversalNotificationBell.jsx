import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Trash2, Eye, Clock, AlertCircle } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNotifications } from '../../providers/NotificationProvider'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

const UniversalNotificationBell = ({ className = '' }) => {
  const { user } = useSelector(state => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all') // all, unread, high
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    stats
  } = useNotifications()

  // Don't render if no user
  if (!user) return null

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'high') return notification.priority === 'high'
    return true
  }).slice(0, 10) // Show only latest 10

  const getNotificationIcon = (type) => {
    const iconClass = "w-4 h-4"
    
    const iconMap = {
      booking_confirmed: { icon: '✅', color: 'text-green-500' },
      booking_cancelled: { icon: '❌', color: 'text-red-500' },
      booking_new: { icon: '📅', color: 'text-blue-500' },
      booking_reminder: { icon: '⏰', color: 'text-yellow-500' },
      payment_received: { icon: '💰', color: 'text-green-500' },
      maintenance_due: { icon: '🔧', color: 'text-orange-500' },
      studio_registration: { icon: '🏢', color: 'text-blue-500' },
      booking_dispute: { icon: '⚠️', color: 'text-red-500' },
      system_alert: { icon: '🚨', color: 'text-red-600' },
      default: { icon: '🔔', color: 'text-gray-500' }
    }

    const config = iconMap[type] || iconMap.default
    return (
      <span className={`text-sm ${config.color}`}>
        {config.icon}
      </span>
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5'
      case 'low':
        return 'border-l-green-500 bg-green-500/5'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    // Navigate if URL provided
    if (notification.data?.url) {
      window.location.href = notification.data.url
    }
  }

  return (
    <div className={`relative inline-block ${className}`} style={{ overflow: 'visible', margin: '4px' }}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        style={{ overflow: 'visible' }}
      >
        <Bell className={`w-5 h-5 ${isConnected ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`} />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium border-2 border-white dark:border-gray-800 z-10"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 z-10 ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Notifications
                  </h3>
                  {!isConnected && (
                    <span className="text-xs text-red-500 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded">
                      Offline
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    icon={<X className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { key: 'all', label: 'All', count: notifications.length },
                  { key: 'unread', label: 'Unread', count: unreadCount },
                  { key: 'high', label: 'Priority', count: notifications.filter(n => n.priority === 'high').length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>
                      {filter === 'all' 
                        ? "No notifications yet" 
                        : `No ${filter} notifications`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                          !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium ${
                                !notification.isRead 
                                  ? 'text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1 ml-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {notification.priority === 'high' && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  High Priority
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                icon={<Check className="w-3 h-3" />}
                                className="text-gray-500 hover:text-green-500"
                              />
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              icon={<Trash2 className="w-3 h-3" />}
                              className="text-gray-500 hover:text-red-500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 10 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    onClick={() => {
                      setIsOpen(false)
                      // Navigate to appropriate notifications page based on role
                      const notificationRoutes = {
                        admin: '/admin/notifications',
                        studio: '/dashboard/notifications',
                        client: '/dashboard/notifications'
                      }
                      window.location.href = notificationRoutes[user.role] || '/dashboard'
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UniversalNotificationBell
