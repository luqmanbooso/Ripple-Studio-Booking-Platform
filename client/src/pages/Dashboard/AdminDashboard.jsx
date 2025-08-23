import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { useGetAnalyticsQuery } from '../../store/adminApi'

const AdminDashboard = () => {
  const [timeframe, setTimeframe] = useState('month')
  
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery({ timeframe })

  const stats = [
    {
      label: 'Total Users',
      value: analyticsData?.data?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-400',
      change: '+12%'
    },
    {
      label: 'Total Bookings',
      value: analyticsData?.data?.totalBookings || 0,
      icon: Calendar,
      color: 'text-green-400',
      change: '+8%'
    },
    {
      label: 'Revenue',
      value: `$${analyticsData?.data?.totalRevenue || 0}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      change: '+15%'
    },
    {
      label: 'Avg Rating',
      value: analyticsData?.data?.avgRating || 'N/A',
      icon: Star,
      color: 'text-purple-400',
      change: '+0.2'
    }
  ]

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      title: 'Booking Oversight',
      description: 'Monitor and manage all bookings',
      href: '/admin/bookings',
      icon: Calendar,
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      title: 'Review Moderation',
      description: 'Approve and moderate user reviews',
      href: '/admin/reviews',
      icon: Star,
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    {
      title: 'Payment Management',
      description: 'Handle refunds and payment issues',
      href: '/admin/payments',
      icon: DollarSign,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  ]

  const pendingTasks = [
    { type: 'verification', count: 5, color: 'text-yellow-400' },
    { type: 'reviews', count: 12, color: 'text-blue-400' },
    { type: 'disputes', count: 2, color: 'text-red-400' },
    { type: 'refunds', count: 3, color: 'text-orange-400' }
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Platform overview and management tools
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input-field"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  <span className="text-xs text-green-400">{stat.change}</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              </Card>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <h2 className="text-xl font-semibold text-gray-100 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.title} to={action.href}>
                      <div className={`p-4 rounded-lg border transition-colors hover:bg-opacity-80 ${action.color}`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <Icon className="w-6 h-6" />
                          <h3 className="font-semibold text-gray-100">
                            {action.title}
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* Pending Tasks & Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Pending Tasks */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Pending Tasks</h3>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className={`w-4 h-4 ${task.color}`} />
                      <span className="text-gray-300 capitalize">{task.type}</span>
                    </div>
                    <span className={`font-semibold ${task.color}`}>
                      {task.count}
                    </span>
                  </div>
                ))}
              </div>
              <Button size="sm" className="w-full mt-4">
                View All Tasks
              </Button>
            </Card>

            {/* System Status */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">API Status</span>
                  </div>
                  <span className="text-green-400 text-sm">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Payment System</span>
                  </div>
                  <span className="text-green-400 text-sm">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Email Service</span>
                  </div>
                  <span className="text-yellow-400 text-sm">Degraded</span>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-100">New user registered</p>
                  <p className="text-gray-400">2 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-100">Booking completed</p>
                  <p className="text-gray-400">15 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-100">Review flagged</p>
                  <p className="text-gray-400">1 hour ago</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
