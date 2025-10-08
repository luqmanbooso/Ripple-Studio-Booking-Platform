import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  BadgeDollarSign , 
  Star, 
  Building,
  TrendingUp,
  Clock,
  Edit,
  Plus,
  Settings,
  CreditCard,
  Users,
  BarChart3,
  Activity,
  Eye,
  Heart,
  MessageSquare,
  Target,
  Timer,
  Zap
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import BookingCard from '../../components/bookings/BookingCard'
import StudioApprovalBanner from '../../components/common/StudioApprovalBanner'
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useGetStudioRevenueQuery } from '../../store/revenueApi'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const StudioDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  const [selectedChart, setSelectedChart] = useState('revenue')
  
  const { data: bookingsData, isLoading: bookingsLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 50
  })

  const { data: revenueData, isLoading: revenueLoading } = useGetStudioRevenueQuery({
    timeframe
  })

  const studio = user?.studio
  const navigate = useNavigate()

  const isLoading = bookingsLoading || revenueLoading

  // Calculate enhanced stats and analytics
  const bookings = bookingsData?.data?.bookings || []
  
  const analytics = useMemo(() => {
    if (!bookings.length) return {
      totalRevenue: 0,
      monthlyGrowth: 0,
      avgBookingValue: 0,
      bookingsByMonth: [],
      revenueByMonth: [],
      popularServices: [],
      bookingStatusDistribution: [],
      performanceMetrics: {
        conversionRate: 0,
        avgSessionDuration: 2.5,
        clientRetentionRate: 75,
        responseTime: 1.2
      }
    }

    // Revenue calculations
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0)

    const completedBookings = bookings.filter(b => b.status === 'completed')
    const avgBookingValue = completedBookings.length > 0 
      ? totalRevenue / completedBookings.length 
      : 0

    // Monthly data for charts
    const monthlyData = {}
    const now = new Date()
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyData[key] = { bookings: 0, revenue: 0, month: key }
    }

    // Populate with actual data
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt)
      const key = bookingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (monthlyData[key]) {
        monthlyData[key].bookings += 1
        if (booking.status === 'completed') {
          monthlyData[key].revenue += booking.price
        }
      }
    })

    // Status distribution
    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1
      return acc
    }, {})

    const bookingStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: {
        'completed': '#10B981',
        'confirmed': '#3B82F6',
        'pending': '#F59E0B',
        'cancelled': '#EF4444',
        'reservation_pending': '#8B5CF6'
      }[status] || '#6B7280'
    }))

    // Performance metrics
    const thisMonth = bookings.filter(b => {
      const bookingMonth = new Date(b.createdAt).getMonth()
      const currentMonth = new Date().getMonth()
      return bookingMonth === currentMonth
    })

    const lastMonth = bookings.filter(b => {
      const bookingMonth = new Date(b.createdAt).getMonth()
      const lastMonthDate = new Date().getMonth() - 1
      return bookingMonth === lastMonthDate
    })

    const monthlyGrowth = lastMonth.length > 0 
      ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 
      : 0

    // Popular services (mock data - would come from booking services)
    const serviceDistribution = [
      { name: 'Recording Session', value: 45, color: '#8B5CF6' },
      { name: 'Mixing & Mastering', value: 30, color: '#10B981' },
      { name: 'Live Recording', value: 15, color: '#F59E0B' },
      { name: 'Rehearsal', value: 10, color: '#3B82F6' }
    ]

    return {
      totalRevenue,
      monthlyGrowth,
      avgBookingValue,
      bookingsByMonth: Object.values(monthlyData),
      revenueByMonth: Object.values(monthlyData),
      popularServices: serviceDistribution,
      bookingStatusDistribution,
      performanceMetrics: {
        conversionRate: completedBookings.length > 0 ? (completedBookings.length / bookings.length * 100) : 0,
        avgSessionDuration: 2.5, // hours - mock data
        clientRetentionRate: 75, // percentage - mock data
        responseTime: 1.2 // hours - mock data
      }
    }
  }, [bookings])

  const upcomingBookings = bookings.filter(b => 
    new Date(b.start) > new Date() && b.status === 'confirmed'
  )

  const pendingReservations = bookings.filter(b => 
    b.status === 'reservation_pending'
  )

  // Enhanced stats with analytics
  const stats = [
    {
      label: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      change: `${analytics.monthlyGrowth >= 0 ? '+' : ''}${analytics.monthlyGrowth.toFixed(1)}%`,
      changeType: analytics.monthlyGrowth >= 0 ? 'positive' : 'negative',
      icon: BadgeDollarSign,
      color: 'text-green-400',
      bg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/10',
      border: 'border-green-500/30'
    },
    {
      label: 'Pending Reservations',
      value: pendingReservations.length,
      change: 'Awaiting approval',
      changeType: 'neutral',
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/10',
      border: 'border-orange-500/30'
    },
    {
      label: 'Upcoming Bookings',
      value: upcomingBookings.length,
      change: 'Next 30 days',
      changeType: 'neutral',
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30'
    },
    {
      label: 'Avg Booking Value',
      value: `$${(analytics.avgBookingValue || 0).toFixed(2)}`,
      change: `${(analytics.performanceMetrics?.conversionRate || 0).toFixed(1)}% conversion`,
      changeType: 'positive',
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10',
      border: 'border-purple-500/30'
    }
  ]

  // Performance metrics cards
  const performanceCards = [
    {
      label: 'Conversion Rate',
      value: `${(analytics.performanceMetrics?.conversionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-400',
      description: 'Bookings to completion rate'
    },
    {
      label: 'Avg Session',
      value: `${(analytics.performanceMetrics?.avgSessionDuration || 0).toFixed(1)}h`,
      icon: Timer,
      color: 'text-blue-400',
      description: 'Average booking duration'
    },
    {
      label: 'Client Retention',
      value: `${(analytics.performanceMetrics?.clientRetentionRate || 0).toFixed(0)}%`,
      icon: Heart,
      color: 'text-pink-400',
      description: 'Returning clients rate'
    },
    {
      label: 'Response Time',
      value: `${(analytics.performanceMetrics?.responseTime || 0).toFixed(1)}h`,
      icon: Zap,
      color: 'text-yellow-400',
      description: 'Average response time'
    }
  ]

  const quickActions = [
    {
      label: 'Manage Availability',
      description: 'Set your available time slots',
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      action: () => navigate('/dashboard/availability')
    },
    {
      label: 'Studio Profile',
      description: 'Update equipment and amenities',
      icon: Building,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      action: () => navigate('/dashboard/profile')
    },
    {
      label: 'View Analytics',
      description: 'Detailed performance insights',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      action: () => navigate('/dashboard/analytics')
    },
    {
      label: 'Payment History',
      description: 'View earnings and transactions',
      icon: CreditCard,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      action: () => navigate('/dashboard/payments')
    }
  ]

  // Chart data preparation
  const chartTabs = [
    { id: 'revenue', label: 'Revenue Trend', icon: BadgeDollarSign },
    { id: 'bookings', label: 'Booking Volume', icon: Calendar },
    { id: 'services', label: 'Service Mix', icon: Activity },
    { id: 'status', label: 'Booking Status', icon: BarChart3 }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                Studio Dashboard
              </h1>
              <p className="text-gray-400">
                Welcome back, <span className="text-primary-400">{studio?.name || user?.name}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-primary-500/30 text-primary-400 hover:bg-primary-500/10"
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Studio Approval Banner */}
          <StudioApprovalBanner />

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className={`p-6 ${stat.bg} border ${stat.border} hover:border-opacity-50 transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-100">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' ? 'bg-green-500/20 text-green-400' :
                        stat.changeType === 'negative' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-dark-800/50 to-dark-700/50 border-primary-500/20">
              <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center">
                <Activity className="w-5 h-5 text-primary-400 mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceCards.map((metric, index) => {
                  const Icon = metric.icon
                  return (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-dark-700/50 p-4 rounded-xl border border-dark-600 hover:border-primary-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                        <span className="text-xl font-bold text-gray-100">{metric.value}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-300 mb-1">{metric.label}</p>
                      <p className="text-xs text-gray-400">{metric.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Analytics Section */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Analytics Charts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-100 flex items-center">
                      <BarChart3 className="w-5 h-5 text-primary-400 mr-2" />
                      Analytics Overview
                    </h2>
                    <div className="flex items-center space-x-2">
                      {chartTabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setSelectedChart(tab.id)}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedChart === tab.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-gray-400 hover:text-gray-300 hover:bg-dark-600'
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-1" />
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="h-80">
                    {selectedChart === 'revenue' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.revenueByMonth}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10B981"
                            fillOpacity={1}
                            fill="url(#revenueGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {selectedChart === 'bookings' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.bookingsByMonth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {selectedChart === 'services' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.popularServices}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analytics.popularServices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}

                    {selectedChart === 'status' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.bookingStatusDistribution} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" stroke="#9CA3AF" />
                          <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Enhanced Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
                    <Zap className="w-5 h-5 text-primary-400 mr-2" />
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon
                      return (
                        <motion.button
                          key={action.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          onClick={action.action}
                          className={`p-5 ${action.color} ${action.hoverColor} rounded-xl text-left group transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-lg group-hover:text-opacity-90 transition-all duration-200">
                                {action.label}
                              </h3>
                              <p className="text-white/80 text-sm mt-1">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-100 flex items-center">
                      <Calendar className="w-5 h-5 text-primary-400 mr-2" />
                      Recent Bookings
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/bookings')}
                      className="text-primary-400 hover:text-primary-300"
                    >
                      View All
                    </Button>
                  </div>
                  
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking, index) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          <BookingCard 
                            booking={booking} 
                            userRole="studio"
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No bookings yet</p>
                      <p className="text-sm">Your studio bookings will appear here</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              
              {/* Studio Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card className="p-6 bg-gradient-to-br from-dark-800/50 to-dark-700/50 border-primary-500/20">
                  <h3 className="font-semibold text-gray-100 mb-6 flex items-center">
                    <Building className="w-5 h-5 text-primary-400 mr-2" />
                    Studio Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                      <span className="text-gray-400 text-sm">Current Status</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                      <span className="text-gray-400 text-sm">Next Booking</span>
                      <span className="text-gray-100 text-sm font-medium">
                        {upcomingBookings[0] ? 
                          new Date(upcomingBookings[0].start).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'None today'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                      <span className="text-gray-400 text-sm">Services Active</span>
                      <span className="text-gray-100 font-medium">{studio?.services?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                      <span className="text-gray-400 text-sm">Profile Views</span>
                      <span className="text-gray-100 font-medium flex items-center">
                        <Eye className="w-4 h-4 text-blue-400 mr-1" />
                        247
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-100 mb-6 flex items-center">
                    <Activity className="w-5 h-5 text-primary-400 mr-2" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        action: 'New booking request',
                        time: '2 hours ago',
                        type: 'booking',
                        icon: Calendar,
                        color: 'text-blue-400'
                      },
                      {
                        action: 'Payment received',
                        time: '5 hours ago',
                        type: 'payment',
                        icon: BadgeDollarSign,
                        color: 'text-green-400'
                      },
                      {
                        action: 'Profile updated',
                        time: '1 day ago',
                        type: 'profile',
                        icon: Building,
                        color: 'text-purple-400'
                      },
                      {
                        action: 'New review received',
                        time: '2 days ago',
                        type: 'review',
                        icon: Star,
                        color: 'text-yellow-400'
                      }
                    ].map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 + index * 0.1 }}
                          className="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg hover:bg-dark-700/50 transition-colors duration-200"
                        >
                          <div className="w-8 h-8 bg-dark-600 rounded-lg flex items-center justify-center">
                            <Icon className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4 text-primary-400 hover:text-primary-300"
                    onClick={() => navigate('/dashboard/activity')}
                  >
                    View All Activity
                  </Button>
                </Card>
              </motion.div>

              {/* Upcoming Schedule */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-100 mb-6 flex items-center">
                    <Clock className="w-5 h-5 text-primary-400 mr-2" />
                    Upcoming Schedule
                  </h3>
                  
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingBookings.slice(0, 3).map((booking, index) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.3 + index * 0.1 }}
                          className="p-3 bg-dark-700/30 rounded-lg border-l-4 border-primary-500"
                        >
                          <p className="text-sm font-medium text-gray-300">
                            {booking.title || 'Studio Session'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(booking.start).toLocaleDateString()} at{' '}
                            {new Date(booking.start).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No upcoming bookings</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudioDashboard
