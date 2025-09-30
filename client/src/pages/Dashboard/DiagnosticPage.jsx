import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'

// Import all the API hooks to test them
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useGetStudioQuery } from '../../store/studioApi'
import { useGetMediaQuery } from '../../store/mediaApi'
import { useGetEquipmentQuery } from '../../store/equipmentApi'

const DiagnosticPage = () => {
  const { user } = useSelector(state => state.auth)
  const [testResults, setTestResults] = useState({})

  // Test API calls
  const bookingsQuery = useGetMyBookingsQuery({ page: 1, limit: 5 }, { skip: !user })
  const studioQuery = useGetStudioQuery(user?.studio?._id || user?.studio, { skip: !user?.studio })
  const mediaQuery = useGetMediaQuery({ studio: user?.studio?._id }, { skip: !user?.studio })
  const equipmentQuery = useGetEquipmentQuery({ studio: user?.studio?._id }, { skip: !user?.studio })

  const tests = [
    {
      name: 'User Authentication',
      status: user ? 'success' : 'error',
      details: user ? `Logged in as ${user.name} (${user.role})` : 'Not authenticated'
    },
    {
      name: 'Studio Association',
      status: user?.studio ? 'success' : 'warning',
      details: user?.studio ? `Studio ID: ${user.studio._id || user.studio}` : 'No studio associated'
    },
    {
      name: 'Bookings API',
      status: bookingsQuery.isLoading ? 'loading' : bookingsQuery.error ? 'error' : 'success',
      details: bookingsQuery.isLoading ? 'Loading...' : 
               bookingsQuery.error ? `Error: ${bookingsQuery.error.message}` : 
               `${bookingsQuery.data?.data?.bookings?.length || 0} bookings loaded`
    },
    {
      name: 'Studio API',
      status: studioQuery.isLoading ? 'loading' : studioQuery.error ? 'error' : 'success',
      details: studioQuery.isLoading ? 'Loading...' : 
               studioQuery.error ? `Error: ${studioQuery.error.message}` : 
               `Studio: ${studioQuery.data?.data?.studio?.name || 'Unknown'}`
    },
    {
      name: 'Media API',
      status: mediaQuery.isLoading ? 'loading' : mediaQuery.error ? 'error' : 'success',
      details: mediaQuery.isLoading ? 'Loading...' : 
               mediaQuery.error ? `Error: ${mediaQuery.error.message}` : 
               `${mediaQuery.data?.data?.length || 0} media files`
    },
    {
      name: 'Equipment API',
      status: equipmentQuery.isLoading ? 'loading' : equipmentQuery.error ? 'error' : 'success',
      details: equipmentQuery.isLoading ? 'Loading...' : 
               equipmentQuery.error ? `Error: ${equipmentQuery.error.message}` : 
               `${equipmentQuery.data?.data?.length || 0} equipment items`
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'loading': return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'loading': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🔧 System Diagnostics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing all studio dashboard components and APIs
        </p>
      </div>

      {/* Test Results */}
      <div className="space-y-4 mb-8">
        {tests.map((test, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.details}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Test */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Navigation Test
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Bookings', path: '/dashboard/bookings' },
            { name: 'Services', path: '/dashboard/services' },
            { name: 'Availability', path: '/dashboard/availability' },
            { name: 'Media', path: '/dashboard/media' },
            { name: 'Equipment', path: '/dashboard/equipment' },
            { name: 'Amenities', path: '/dashboard/amenities' },
            { name: 'Analytics', path: '/dashboard/analytics' },
            { name: 'Revenue', path: '/dashboard/revenue' },
            { name: 'Profile', path: '/dashboard/profile' }
          ].map((link) => (
            <a
              key={link.path}
              href={link.path}
              className="p-3 text-center bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
          {JSON.stringify({
            user: user ? { 
              id: user._id, 
              name: user.name, 
              role: user.role, 
              studio: user.studio 
            } : null,
            currentPath: window.location.pathname,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default DiagnosticPage
