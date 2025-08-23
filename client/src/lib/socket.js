import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

let socket = null

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect()
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: {
      token
    },
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  // Handle notifications
  socket.on('notification', (data) => {
    toast.success(data.message)
  })

  // Handle booking updates
  socket.on('booking_created', (data) => {
    toast.success(`New booking received from ${data.clientName}`)
  })

  socket.on('booking_confirmed', (data) => {
    toast.success('Your booking has been confirmed!')
  })

  socket.on('booking_cancelled', (data) => {
    toast.error(`Booking cancelled: ${data.reason || 'No reason provided'}`)
  })

  socket.on('booking_completed', (data) => {
    toast.success('Your booking has been completed!')
  })

  // Handle slot updates
  socket.on('slot-held', (data) => {
    // Update UI to show slot is temporarily held
    window.dispatchEvent(new CustomEvent('slot-held', { detail: data }))
  })

  socket.on('slot-released', (data) => {
    // Update UI to show slot is available again
    window.dispatchEvent(new CustomEvent('slot-released', { detail: data }))
  })

  socket.on('calendar_update', (data) => {
    // Trigger calendar refresh
    window.dispatchEvent(new CustomEvent('calendar-update', { detail: data }))
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Socket event helpers
export const joinProviderRoom = (providerId, providerType) => {
  if (socket) {
    socket.emit('join-provider-room', { providerId, providerType })
  }
}

export const holdSlot = (providerId, providerType, start, end) => {
  if (socket) {
    socket.emit('hold-slot', { providerId, providerType, start, end })
  }
}

export const releaseSlot = (providerId, providerType, start, end) => {
  if (socket) {
    socket.emit('release-slot', { providerId, providerType, start, end })
  }
}

export const emitBookingUpdate = (bookingId, status, providerId, providerType) => {
  if (socket) {
    socket.emit('booking-update', { bookingId, status, providerId, providerType })
  }
}
