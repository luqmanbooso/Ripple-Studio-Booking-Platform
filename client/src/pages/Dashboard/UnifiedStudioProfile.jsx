import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, Briefcase, Image, Wrench
} from 'lucide-react'
import StudioInfoTab from './StudioInfoTab'
import CompleteStudioServices from './CompleteStudioServices'
import CompleteStudioMedia from './CompleteStudioMedia'
import StudioEquipmentManager from './StudioEquipmentManager'

const UnifiedStudioProfile = () => {
  const [activeTab, setActiveTab] = useState('info')

  const tabs = [
    { id: 'info', label: 'Studio Info', icon: Building2, component: StudioInfoTab },
    { id: 'services', label: 'Services', icon: Briefcase, component: CompleteStudioServices },
    { id: 'media', label: 'Media', icon: Image, component: CompleteStudioMedia },
    { id: 'equipment', label: 'Equipment', icon: Wrench, component: StudioEquipmentManager },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Studio Profile & Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your studio profile, bookings, availability, services, and resources
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
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

export default UnifiedStudioProfile
