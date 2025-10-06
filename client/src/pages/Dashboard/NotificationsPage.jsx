import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  Star,
  Settings,
  Eye,
  ExternalLink
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNotifications } from '../../providers/NotificationProvider'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

const NotificationsPage = () => {
  const { user } = useSelector(state => state.auth)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState([])
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    stats
  } = useNotifications()

  // Filter notifications based on current filter and search
  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    let typeMatch = true
    if (filter === 'unread') typeMatch = !notification.isRead
    else if (filter === 'high') typeMatch = notification.priority === 'high'
    else if (filter === 'booking') typeMatch = notification.type.includes('booking')
    else if (filter === 'payment') typeMatch = notification.type.includes('payment')
    else if (filter === 'equipment') typeMatch = notification.type.includes('equipment') || notification.type.includes('maintenance')

    // Filter by search term
    let searchMatch = true
    if (searchTerm) {
      searchMatch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    }

    return typeMatch && searchMatch
  })

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5"
    
    const iconMap = {
      booking_confirmed: { icon: Calendar, color: 'text-green-500' },
      booking_cancelled: { icon: AlertCircle, color: 'text-red-500' },
      booking_new: { icon: Calendar, color: 'text-blue-500' },
      booking_reminder: { icon: Clock, color: 'text-yellow-500' },
      payment_received: { icon: DollarSign, color: 'text-green-500' },
      maintenance_due: { icon: Settings, color: 'text-orange-500' },
      equipment_unavailable: { icon: AlertCircle, color: 'text-red-500' },
      service_price_updated: { icon: DollarSign, color: 'text-blue-500' },
      service_discontinued: { icon: AlertCircle, color: 'text-red-500' },
      studio_registration: { icon: Star, color: 'text-blue-500' },
      booking_dispute: { icon: AlertCircle, color: 'text-red-500' },
      system_alert: { icon: AlertCircle, color: 'text-red-600' },
      default: { icon: Bell, color: 'text-gray-500' }
    }

    const config = iconMap[type] || iconMap.default
    const IconComponent = config.icon
    return <IconComponent className={`${iconClass} ${config.color}`} />
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

  const handleBulkAction = (action) => {
    if (selectedNotifications.length === 0) return

    selectedNotifications.forEach(id => {
      if (action === 'read') {
        markAsRead(id)
      } else if (action === 'delete') {
        deleteNotification(id)
      }
    })
    
    setSelectedNotifications([])
  }

  const filterOptions = [
    { value: 'all', label: 'All Notifications', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'high', label: 'High Priority', count: notifications.filter(n => n.priority === 'high').length },
    { value: 'booking', label: 'Bookings', count: notifications.filter(n => n.type.includes('booking')).length },
    { value: 'payment', label: 'Payments', count: notifications.filter(n => n.type.includes('payment')).length },
    { value: 'equipment', label: 'Equipment', count: notifications.filter(n => n.type.includes('equipment') || n.type.includes('maintenance')).length }
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            Please log in to view notifications
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with your latest activities
            {!isConnected && (
              <span className="ml-2 text-red-500 text-sm">
                (Offline - some notifications may be delayed)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('read')}
                icon={<Check className="w-4 h-4" />}
              >
                Mark Read ({selectedNotifications.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                icon={<Trash2 className="w-4 h-4" />}
                className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete ({selectedNotifications.length})
              </Button>
            </div>
          )}
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              icon={<CheckCheck className="w-4 h-4" />}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {notifications.length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {unreadCount}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isConnected ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={filter === option.value ? 'default' : 'outline'}
                onClick={() => setFilter(option.value)}
                className="text-sm"
              >
                {option.label}
                {option.count !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                    {option.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card className="overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center p-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No notifications match the current filter: ${filterOptions.find(f => f.value === filter)?.label}`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotifications(prev => [...prev, notification.id])
                      } else {
                        setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                      }
                    }}
                    className="mt-1 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.isRead 
                            ? 'text-gray-900 dark:text-gray-100' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTimeAgo(notification.timestamp)}</span>
                          <span className="capitalize">{notification.priority} priority</span>
                          {!notification.isRead && (
                            <span className="text-blue-500">Unread</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.data?.url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = notification.data.url
                            }}
                            icon={<ExternalLink className="w-4 h-4" />}
                            className="text-blue-500 hover:text-blue-600"
                          />
                        )}
                        
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            icon={<Check className="w-4 h-4" />}
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
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-gray-500 hover:text-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default NotificationsPage
