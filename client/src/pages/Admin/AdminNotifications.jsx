import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Search,
  AlertCircle,
  Clock,
  User,
  Building,
  Calendar,
  DollarSign,
  Star,
  AlertTriangle,
  TrendingUp,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [stats, setStats] = useState({ total: 0, unread: 0, high_priority: 0 })

  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, filter, searchTerm])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=50', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        setNotifications(data.data.notifications)
      } else {
        toast.error('Failed to fetch notifications')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Filter by type
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.isRead)
      } else if (filter === 'high_priority') {
        filtered = filtered.filter(n => n.priority === 'high')
      } else if (filter === 'action_required') {
        filtered = filtered.filter(n => n.data?.actionRequired)
      } else {
        filtered = filtered.filter(n => n.type === filter)
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        )
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))
      }
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        )
        setStats(prev => ({ ...prev, unread: 0 }))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId))
        toast.success('Notification deleted')
      }
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected')
      return
    }

    try {
      const promises = selectedNotifications.map(id => {
        if (action === 'read') {
          return fetch(`/api/notifications/${id}/read`, {
            method: 'PATCH',
            credentials: 'include'
          })
        } else if (action === 'delete') {
          return fetch(`/api/notifications/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          })
        }
      })

      await Promise.all(promises)

      if (action === 'read') {
        setNotifications(prev => 
          prev.map(notif => 
            selectedNotifications.includes(notif._id)
              ? { ...notif, isRead: true }
              : notif
          )
        )
        toast.success(`${selectedNotifications.length} notifications marked as read`)
      } else if (action === 'delete') {
        setNotifications(prev => 
          prev.filter(notif => !selectedNotifications.includes(notif._id))
        )
        toast.success(`${selectedNotifications.length} notifications deleted`)
      }

      setSelectedNotifications([])
      fetchStats()
    } catch (error) {
      toast.error(`Failed to ${action} notifications`)
    }
  }

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5"
    
    switch (type) {
      case 'studio_registration':
        return <Building className={`${iconClass} text-blue-500`} />
      case 'user_registration':
        return <User className={`${iconClass} text-green-500`} />
      case 'booking_created':
        return <Calendar className={`${iconClass} text-purple-500`} />
      case 'review_flagged':
        return <Star className={`${iconClass} text-red-500`} />
      case 'payment_dispute':
        return <DollarSign className={`${iconClass} text-orange-500`} />
      case 'system_alert':
        return <AlertTriangle className={`${iconClass} text-red-600`} />
      case 'revenue_milestone':
        return <TrendingUp className={`${iconClass} text-yellow-500`} />
      case 'user_activity_suspicious':
        return <Shield className={`${iconClass} text-red-500`} />
      default:
        return <Bell className={`${iconClass} text-gray-500`} />
    }
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

  const formatTimeAgo = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filterOptions = [
    { value: 'all', label: 'All Notifications', count: stats.total },
    { value: 'unread', label: 'Unread', count: stats.unread },
    { value: 'high_priority', label: 'High Priority', count: stats.high_priority },
    { value: 'action_required', label: 'Action Required', count: filteredNotifications.filter(n => n.data?.actionRequired).length },
    { value: 'studio_registration', label: 'Studio Registrations' },
    { value: 'user_registration', label: 'User Registrations' },
    { value: 'booking_created', label: 'New Bookings' },
    { value: 'system_alert', label: 'System Alerts' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Notifications</h1>
          <p className="text-gray-400 mt-1">
            Manage platform notifications and alerts
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
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Delete ({selectedNotifications.length})
              </Button>
            </div>
          )}
          
          {stats.unread > 0 && (
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Notifications</p>
              <p className="text-xl font-semibold text-gray-100">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Unread</p>
              <p className="text-xl font-semibold text-gray-100">{stats.unread}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">High Priority</p>
              <p className="text-xl font-semibold text-gray-100">{stats.high_priority}</p>
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
                  <span className="ml-1 px-1.5 py-0.5 bg-gray-600 rounded text-xs">
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
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center p-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-100 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No notifications match the current filter: ${filterOptions.find(f => f.value === filter)?.label}`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 hover:bg-gray-750 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-gray-800/50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotifications(prev => [...prev, notification._id])
                      } else {
                        setSelectedNotifications(prev => prev.filter(id => id !== notification._id))
                      }
                    }}
                    className="mt-1 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-100' : 'text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.data?.actionRequired && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                              Action Required
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                          <span className="capitalize">{notification.priority} priority</span>
                          {!notification.isRead && (
                            <span className="text-blue-400">Unread</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification._id)}
                            icon={<Check className="w-4 h-4" />}
                            className="text-gray-500 hover:text-green-400"
                          />
                        )}
                        
                        {notification.data?.url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.location.href = notification.data.url}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification._id)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-gray-500 hover:text-red-400"
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

export default AdminNotifications
