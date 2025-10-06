import React from 'react'
import { useNotifications } from '../../providers/NotificationProvider'
import Button from '../ui/Button'
import { Bell, Send, TestTube } from 'lucide-react'

const NotificationTest = () => {
  const { emitNotification, notifications, unreadCount, isConnected } = useNotifications()

  const testNotifications = [
    {
      type: 'booking_confirmed',
      title: 'Test Booking Confirmed',
      message: 'Your test booking has been confirmed successfully!',
      priority: 'medium',
      data: { bookingId: 'test-123' }
    },
    {
      type: 'payment_received',
      title: 'Test Payment Received',
      message: 'Payment of $150 received for your booking',
      priority: 'medium',
      data: { amount: 150 }
    },
    {
      type: 'equipment_maintenance',
      title: 'Equipment Maintenance Due',
      message: 'Studio microphone requires maintenance check',
      priority: 'high',
      data: { equipment: 'Studio Microphone' }
    },
    {
      type: 'system_alert',
      title: 'System Alert Test',
      message: 'This is a test system notification',
      priority: 'high',
      data: { alertType: 'test' }
    }
  ]

  const sendTestNotification = (notification) => {
    // For testing, we'll directly emit the notification
    emitNotification('notification:test', notification)
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <TestTube className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Notification System Test
        </h2>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {notifications.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Unread: {unreadCount}
            </span>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Send Test Notifications
        </h3>
        
        {testNotifications.map((notification, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notification.message}
              </p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                notification.priority === 'high' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {notification.priority} priority
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => sendTestNotification(notification)}
              icon={<Send className="w-4 h-4" />}
              className="ml-4"
            >
              Send
            </Button>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Testing Instructions:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click the buttons above to send test notifications</li>
          <li>• Check the notification bell in the navbar for new notifications</li>
          <li>• Visit /dashboard/notifications to see the full notifications page</li>
          <li>• Test marking notifications as read/unread</li>
          <li>• Test deleting notifications</li>
        </ul>
      </div>
    </div>
  )
}

export default NotificationTest
