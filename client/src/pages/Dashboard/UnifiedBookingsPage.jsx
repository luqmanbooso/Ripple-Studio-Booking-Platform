import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, List } from 'lucide-react'
import CompleteStudioBookings from './CompleteStudioBookings'
import CompleteAvailabilityManager from './CompleteAvailabilityManager'

const UnifiedBookingsPage = () => {
  const [activeView, setActiveView] = useState('bookings')

  const views = [
    { id: 'bookings', label: 'Bookings', icon: List, component: CompleteStudioBookings },
    { id: 'calendar', label: 'Calendar', icon: Calendar, component: CompleteAvailabilityManager },
  ]

  const ActiveComponent = views.find(view => view.id === activeView)?.component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bookings & Availability
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your bookings and view your availability calendar
          </p>
        </div>

        {/* View Toggle */}
        <div className="px-6 pb-4">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
            {views.map((view) => {
              const Icon = view.icon
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`relative px-6 py-3 font-medium transition-all rounded-lg ${
                    activeView === view.id
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{view.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {ActiveComponent && <ActiveComponent />}
      </motion.div>
    </div>
  )
}

export default UnifiedBookingsPage
