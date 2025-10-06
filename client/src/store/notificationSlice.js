import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  lastUpdated: null
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        ...action.payload
      }
      
      // Add to beginning of array (newest first)
      state.notifications.unshift(notification)
      
      // Update unread count
      if (!notification.isRead) {
        state.unreadCount += 1
      }
      
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100)
      }
      
      state.lastUpdated = new Date().toISOString()
    },
    
    markAsRead: (state, action) => {
      const notificationId = action.payload
      const notification = state.notifications.find(n => n.id === notificationId)
      
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
        state.lastUpdated = new Date().toISOString()
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true
      })
      state.unreadCount = 0
      state.lastUpdated = new Date().toISOString()
    },
    
    removeNotification: (state, action) => {
      const notificationId = action.payload
      const notificationIndex = state.notifications.findIndex(n => n.id === notificationId)
      
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex]
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(notificationIndex, 1)
        state.lastUpdated = new Date().toISOString()
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
      state.lastUpdated = new Date().toISOString()
    },
    
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload
    },
    
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },
    
    // Bulk operations
    bulkMarkAsRead: (state, action) => {
      const notificationIds = action.payload
      let markedCount = 0
      
      state.notifications.forEach(notification => {
        if (notificationIds.includes(notification.id) && !notification.isRead) {
          notification.isRead = true
          markedCount++
        }
      })
      
      state.unreadCount = Math.max(0, state.unreadCount - markedCount)
      state.lastUpdated = new Date().toISOString()
    },
    
    bulkRemove: (state, action) => {
      const notificationIds = action.payload
      let removedUnreadCount = 0
      
      state.notifications = state.notifications.filter(notification => {
        if (notificationIds.includes(notification.id)) {
          if (!notification.isRead) {
            removedUnreadCount++
          }
          return false
        }
        return true
      })
      
      state.unreadCount = Math.max(0, state.unreadCount - removedUnreadCount)
      state.lastUpdated = new Date().toISOString()
    },
    
    // Sync with server data
    syncNotifications: (state, action) => {
      const { notifications, unreadCount } = action.payload
      state.notifications = notifications
      state.unreadCount = unreadCount
      state.lastUpdated = new Date().toISOString()
    }
  }
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setConnectionStatus,
  updateUnreadCount,
  bulkMarkAsRead,
  bulkRemove,
  syncNotifications
} = notificationSlice.actions

export default notificationSlice.reducer

// Selectors
export const selectNotifications = (state) => state.notifications.notifications
export const selectUnreadCount = (state) => state.notifications.unreadCount
export const selectUnreadNotifications = (state) => 
  state.notifications.notifications.filter(n => !n.isRead)
export const selectIsConnected = (state) => state.notifications.isConnected
export const selectLastUpdated = (state) => state.notifications.lastUpdated
