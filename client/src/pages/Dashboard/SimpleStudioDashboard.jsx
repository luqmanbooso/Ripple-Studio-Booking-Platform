import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Calendar, Settings, Clock, Building2, BarChart3, 
  Plus, ArrowRight, Users, DollarSign
} from 'lucide-react'

const SimpleStudioDashboard = () => {
  const { user } = useSelector(state => state.auth)

  const quickActions = [
    {
      title: 'View Bookings',
      description: 'See your upcoming sessions',
      href: '/dashboard/bookings',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Services',
      description: 'Update your services and pricing',
      href: '/dashboard/services',
      icon: Settings,
      color: 'bg-green-500'
    },
    {
      title: 'Set Availability',
      description: 'Update your available hours',
      href: '/dashboard/availability',
      icon: Clock,
      color: 'bg-purple-500'
    },
    {
      title: 'Studio Profile',
      description: 'Edit your studio information',
      href: '/dashboard/profile',
      icon: Building2,
      color: 'bg-orange-500'
    }
  ]

  const stats = [
    { label: 'Total Bookings', value: '12', icon: Calendar },
    { label: 'This Month Revenue', value: '$2,400', icon: DollarSign },
    { label: 'Active Services', value: '6', icon: Settings },
    { label: 'Studio Rating', value: '4.8', icon: Users }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your studio today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.href}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link 
            to="/dashboard/bookings" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {/* Sample activity items */}
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New booking request from John Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Payment received for recording session
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Service pricing updated
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🚀 Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Complete Your Profile</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add photos, description, and contact info</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Set Up Services</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Define what you offer and pricing</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Set Availability</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Let clients know when you're available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleStudioDashboard
