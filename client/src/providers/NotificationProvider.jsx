import React, { createContext, useContext, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import {
  addNotification,
  setConnectionStatus,
  syncNotifications,
  markAsRead as markAsReadLocal,
  removeNotification as removeNotificationLocal
} from '../store/notificationSlice'
import {
  useGetNotificationsQuery,
  useGetNotificationStatsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} from '../store/notificationApi'

const NotificationContext = createContext({})

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch()
  const { user, token } = useSelector(state => state.auth)
  const { notifications, unreadCount, isConnected } = useSelector(state => state.notifications)
  
  // API hooks - fetch existing notifications from database
  const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery(
    { page: 1, limit: 50 }, 
    { 
      skip: !user,
      refetchOnMountOrArgChange: true 
    }
  )
  const { data: stats, refetch: refetchStats } = useGetNotificationStatsQuery(undefined, { 
    skip: !user,
    pollingInterval: 30000 // Poll every 30 seconds
  })
  const [markAsReadMutation] = useMarkAsReadMutation()
  const [markAllAsReadMutation] = useMarkAllAsReadMutation()
  const [deleteNotificationMutation] = useDeleteNotificationMutation()

  // Sync notifications from API with local state
  useEffect(() => {
    if (notificationsData?.notifications && user) {
      const formattedNotifications = notificationsData.notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt,
        isRead: notification.isRead,
        priority: notification.priority || 'medium',
        data: notification.data || {}
      }))
      
      dispatch(syncNotifications({
        notifications: formattedNotifications,
        unreadCount: stats?.unreadCount || 0
      }))
    }
  }, [notificationsData, stats, user, dispatch])

  // Socket connection management
  useEffect(() => {
    if (!user || !token) {
      dispatch(setConnectionStatus(false))
      return
    }

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    // Connection events
    socket.on('connect', () => {
      console.log('Notifications connected')
      dispatch(setConnectionStatus(true))
      socket.emit('join', { userId: user._id, role: user.role })
    })

    socket.on('disconnect', () => {
      console.log('Notifications disconnected')
      dispatch(setConnectionStatus(false))
    })

    socket.on('connect_error', (error) => {
      console.error('Notification connection error:', error)
      dispatch(setConnectionStatus(false))
      
      // If it's an authentication error, don't retry
      if (error.message && error.message.includes('Authentication')) {
        console.log('Authentication error - user needs to login')
        return
      }
    })

    // Role-based notification handlers
    const notificationHandlers = {
      // Universal notifications
      'notification:new': (data) => {
        dispatch(addNotification(data))
        showToastNotification(data)
      },

      // Client notifications
      'booking:confirmed': (data) => {
        if (user.role === 'client') {
          const notification = {
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: `Your booking at ${data.studio?.name} has been confirmed!`,
            data: data,
            priority: 'medium'
          }
          dispatch(addNotification(notification))
          toast.success(notification.message)
        }
      },

      'booking:cancelled': (data) => {
        if (user.role === 'client') {
          const notification = {
            type: 'booking_cancelled',
            title: 'Booking Cancelled',
            message: `Your booking at ${data.studio?.name} has been cancelled`,
            data: data,
            priority: 'high'
          }
          dispatch(addNotification(notification))
          toast.error(notification.message)
        }
      },

      'booking:reminder': (data) => {
        if (user.role === 'client') {
          const notification = {
            type: 'booking_reminder',
            title: 'Booking Reminder',
            message: `Your session at ${data.studio?.name} starts in ${data.timeUntil}`,
            data: data,
            priority: 'high'
          }
          dispatch(addNotification(notification))
          toast(`⏰ ${notification.message}`, { duration: 6000 })
        }
      },

      // Studio notifications
      'booking:new': (data) => {
        if (user.role === 'studio' && data.studio?._id === user.studio?._id) {
          const notification = {
            type: 'booking_new',
            title: 'New Booking Request',
            message: `${data.client?.name} wants to book ${data.service?.name}`,
            data: data,
            priority: 'high'
          }
          dispatch(addNotification(notification))
          toast.success(notification.message)
        }
      },

      'booking:payment_received': (data) => {
        if (user.role === 'studio' && data.studio?._id === user.studio?._id) {
          const notification = {
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment of $${data.amount} received from ${data.client?.name}`,
            data: data,
            priority: 'medium'
          }
          dispatch(addNotification(notification))
          toast.success(notification.message)
        }
      },

      'equipment:maintenance_due': (data) => {
        if (user.role === 'studio' && data.studio?._id === user.studio?._id) {
          const notification = {
            type: 'maintenance_due',
            title: 'Equipment Maintenance Due',
            message: `${data.equipment?.name} requires maintenance`,
            data: data,
            priority: 'high'
          }
          dispatch(addNotification(notification))
          toast.error(notification.message)
        }
      },

      // Admin notifications
      'studio:registration': (data) => {
        if (user.role === 'admin') {
          const notification = {
            type: 'studio_registration',
            title: 'New Studio Registration',
            message: `${data.studio?.name} has registered and needs approval`,
            data: data,
            priority: 'high'
          }
          dispatch(addNotification(notification))
          toast.success(notification.message)
        }
      },

      'booking:dispute': (data) => {
        if (user.role === 'admin') {
          const notification = {
            type: 'booking_dispute',
            title: 'Booking Dispute',
            message: `Dispute reported for booking #${data.bookingId}`,
            data: data,
            priority: 'high'
          }
          dispatch(addNotification(notification))
          toast.error(notification.message)
        }
      },

      'system:alert': (data) => {
        if (user.role === 'admin') {
          const notification = {
            type: 'system_alert',
            title: 'System Alert',
            message: data.message,
            data: data,
            priority: 'high'
          }
          dispatch(addNotification(notification))
          toast.error(notification.message)
        }
      }
    }

    // Register all handlers
    Object.entries(notificationHandlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    // Cleanup
    return () => {
      Object.keys(notificationHandlers).forEach(event => {
        socket.off(event)
      })
      socket.disconnect()
    }
  }, [user, token, dispatch])

  // Helper function to show toast notifications
  const showToastNotification = useCallback((notification) => {
    const options = {
      duration: notification.priority === 'high' ? 6000 : 4000,
      position: 'top-right'
    }

    switch (notification.priority) {
      case 'high':
        toast.error(notification.message, options)
        break
      case 'medium':
        toast.success(notification.message, options)
        break
      case 'low':
        toast(notification.message, options)
        break
      default:
        toast(notification.message, options)
    }
  }, [])

  // Notification actions
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markAsReadMutation(notificationId).unwrap()
      dispatch(markAsReadLocal(notificationId))
      refetchStats()
      refetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }, [markAsReadMutation, dispatch, refetchStats, refetchNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation().unwrap()
      dispatch(markAllAsReadLocal())
      refetchStats()
      refetchNotifications()
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }, [markAllAsReadMutation, dispatch, refetchStats, refetchNotifications])

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotificationMutation(notificationId).unwrap()
      dispatch(removeNotificationLocal(notificationId))
      refetchStats()
      refetchNotifications()
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }, [deleteNotificationMutation, dispatch, refetchStats, refetchNotifications])

  // Emit notification events
  const emitNotification = useCallback((event, data) => {
    if (!isConnected) return

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    })
    
    socket.emit(event, data)
    socket.disconnect()
  }, [isConnected, token])

  const contextValue = {
    // State
    notifications,
    unreadCount: stats?.unreadCount || unreadCount,
    isConnected,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    emitNotification,
    
    // Stats
    stats
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
