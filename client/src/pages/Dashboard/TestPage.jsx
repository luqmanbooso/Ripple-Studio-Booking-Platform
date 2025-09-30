import React from 'react'
import { useLocation } from 'react-router-dom'

const TestPage = ({ title = "Test Page" }) => {
  const location = useLocation()
  
  return (
    <div className="p-6">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <strong>✅ Route Working!</strong>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p><strong>Current Path:</strong> {location.pathname}</p>
        <p><strong>Component:</strong> {title}</p>
        <p><strong>Status:</strong> Component loaded successfully</p>
      </div>
      
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold">Navigation Test</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <a href="/dashboard" className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg block text-center">
            Dashboard
          </a>
          <a href="/dashboard/bookings" className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg block text-center">
            Bookings
          </a>
          <a href="/dashboard/services" className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg block text-center">
            Services
          </a>
          <a href="/dashboard/media" className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg block text-center">
            Media
          </a>
          <a href="/dashboard/equipment" className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg block text-center">
            Equipment
          </a>
          <a href="/dashboard/analytics" className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg block text-center">
            Analytics
          </a>
        </div>
      </div>
    </div>
  )
}

export default TestPage
