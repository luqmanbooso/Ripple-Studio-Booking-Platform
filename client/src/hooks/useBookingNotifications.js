import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import { addNotification } from '../store/notificationSlice'

const useBookingNotifications = () => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user) return

    // Connect to socket
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    })

    // Join user-specific room
    socket.emit('join', { userId: user._id, role: user.role })

    // Booking-related notifications
    const bookingEvents = {
      // Client notifications
      'booking:confirmed': (data) => {
        if (user.role === 'client') {
          toast.success(`Your booking at ${data.studio.name} has been confirmed!`)
          dispatch(addNotification({
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: `Your booking at ${data.studio.name} for ${data.service.name} has been confirmed.`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'booking:cancelled': (data) => {
        if (user.role === 'client') {
          toast.error(`Your booking at ${data.studio.name} has been cancelled`)
          dispatch(addNotification({
            type: 'booking_cancelled',
            title: 'Booking Cancelled',
            message: `Your booking at ${data.studio.name} has been cancelled. ${data.reason || ''}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'booking:reminder': (data) => {
        if (user.role === 'client') {
          toast(`Reminder: Your session at ${data.studio.name} starts in ${data.timeUntil}`, {
            icon: '⏰',
            duration: 6000
          })
          dispatch(addNotification({
            type: 'booking_reminder',
            title: 'Booking Reminder',
            message: `Your session at ${data.studio.name} starts in ${data.timeUntil}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      // Studio notifications
      'booking:new': (data) => {
        if (user.role === 'studio' && data.studio._id === user.studio?._id) {
          toast.success(`New booking request from ${data.client.name}!`)
          dispatch(addNotification({
            type: 'booking_new',
            title: 'New Booking Request',
            message: `${data.client.name} wants to book ${data.service.name} for ${new Date(data.start).toLocaleDateString()}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'booking:payment_received': (data) => {
        if (user.role === 'studio' && data.studio._id === user.studio?._id) {
          toast.success(`Payment received for booking #${data.bookingId}`)
          dispatch(addNotification({
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment of $${data.amount} received for booking with ${data.client.name}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'booking:equipment_conflict': (data) => {
        if (user.role === 'studio' && data.studio._id === user.studio?._id) {
          toast.error(`Equipment conflict detected for booking #${data.bookingId}`)
          dispatch(addNotification({
            type: 'equipment_conflict',
            title: 'Equipment Conflict',
            message: `${data.equipment.join(', ')} not available for booking on ${new Date(data.date).toLocaleDateString()}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'booking:client_arrived': (data) => {
        if (user.role === 'studio' && data.studio._id === user.studio?._id) {
          toast(`${data.client.name} has arrived for their session`, {
            icon: '👋',
            duration: 4000
          })
          dispatch(addNotification({
            type: 'client_arrived',
            title: 'Client Arrived',
            message: `${data.client.name} has checked in for their ${data.service.name} session`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      // Admin notifications
      'booking:dispute': (data) => {
        if (user.role === 'admin') {
          toast.error(`Booking dispute reported: #${data.bookingId}`)
          dispatch(addNotification({
            type: 'booking_dispute',
            title: 'Booking Dispute',
            message: `Dispute reported for booking between ${data.client.name} and ${data.studio.name}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'booking:refund_requested': (data) => {
        if (user.role === 'admin') {
          toast(`Refund requested for booking #${data.bookingId}`, {
            icon: '💰'
          })
          dispatch(addNotification({
            type: 'refund_requested',
            title: 'Refund Requested',
            message: `${data.client.name} requested refund for booking at ${data.studio.name}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      // Equipment-specific notifications
      'equipment:maintenance_due': (data) => {
        if (user.role === 'studio' && data.studio._id === user.studio?._id) {
          toast.error(`Maintenance due for ${data.equipment.name}`)
          dispatch(addNotification({
            type: 'maintenance_due',
            title: 'Equipment Maintenance Due',
            message: `${data.equipment.name} requires maintenance. Last serviced: ${new Date(data.lastMaintenance).toLocaleDateString()}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'equipment:unavailable': (data) => {
        if (user.role === 'studio' && data.studio._id === user.studio?._id) {
          toast.error(`${data.equipment.name} is now unavailable`)
          dispatch(addNotification({
            type: 'equipment_unavailable',
            title: 'Equipment Unavailable',
            message: `${data.equipment.name} has been marked as unavailable. Reason: ${data.reason}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      // Service-related notifications
      'service:price_updated': (data) => {
        if (user.role === 'client' && data.affectedBookings?.includes(user._id)) {
          toast(`Price updated for ${data.service.name} at ${data.studio.name}`, {
            icon: '💰'
          })
          dispatch(addNotification({
            type: 'service_price_updated',
            title: 'Service Price Updated',
            message: `${data.studio.name} updated pricing for ${data.service.name}. New price: $${data.newPrice}`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      },

      'service:discontinued': (data) => {
        if (user.role === 'client' && data.affectedBookings?.includes(user._id)) {
          toast.error(`${data.service.name} service discontinued at ${data.studio.name}`)
          dispatch(addNotification({
            type: 'service_discontinued',
            title: 'Service Discontinued',
            message: `${data.studio.name} is no longer offering ${data.service.name}. Please contact them for alternatives.`,
            data: data,
            timestamp: new Date().toISOString()
          }))
        }
      }
    }

    // Register all event listeners
    Object.entries(bookingEvents).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to booking notifications')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from booking notifications')
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error('Connection error. Some notifications may be delayed.')
    })

    // Cleanup
    return () => {
      Object.keys(bookingEvents).forEach(event => {
        socket.off(event)
      })
      socket.disconnect()
    }
  }, [user, dispatch])

  // Helper function to emit booking events
  const emitBookingEvent = (event, data) => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    })
    
    socket.emit(event, data)
    socket.disconnect()
  }

  return { emitBookingEvent }
}

export default useBookingNotifications
