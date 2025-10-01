import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Building2,
  Music,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart,
  TrendingDown
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useGetAnalyticsQuery, useGetRevenueAnalyticsQuery } from '../../store/adminApi'

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState('month')
  const [activeMetric, setActiveMetric] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: analyticsData, isLoading, refetch } = useGetAnalyticsQuery({ timeframe })
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueAnalyticsQuery({
    timeframe,
    includeBreakdown: true
  })

  const analytics = analyticsData?.data
  const revenue = revenueData?.data

  // Mock data for demonstration - replace with real data
  const userGrowthData = [
    { month: 'Jan', users: 120, bookings: 45, revenue: 3200 },
    { month: 'Feb', users: 180, bookings: 67, revenue: 4800 },
    { month: 'Mar', users: 250, bookings: 89, revenue: 6200 },
    { month: 'Apr', users: 320, bookings: 112, revenue: 7800 },
    { month: 'May', users: 410, bookings: 145, revenue: 9200 },
    { month: 'Jun', users: 520, bookings: 178, revenue: 10800 }
  ]

  const genreData = [
    { name: 'Rock', value: 35, color: '#EF4444' },
    { name: 'Pop', value: 28, color: '#F59E0B' },
    { name: 'Hip Hop', value: 20, color: '#10B981' },
    { name: 'Jazz', value: 10, color: '#3B82F6' },
    { name: 'Electronic', value: 7, color: '#8B5CF6' }
  ]

  const studioPerformanceData = [
    { name: 'Studio A', bookings: 45, revenue: 3200, rating: 4.8 },
    { name: 'Studio B', bookings: 38, revenue: 2800, rating: 4.6 },
    { name: 'Studio C', bookings: 52, revenue: 4100, rating: 4.9 },
    { name: 'Studio D', bookings: 29, revenue: 2100, rating: 4.4 },
    { name: 'Studio E', bookings: 41, revenue: 3500, rating: 4.7 }
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const exportData = () => {
    // Mock export functionality
    const data = {
      analytics,
      revenue,
      timeframe,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ripple-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const metrics = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: Activity,
      color: 'text-blue-400',
      description: 'General platform metrics and KPIs'
    },
    {
      id: 'users',
      label: 'User Analytics',
      icon: Users,
      color: 'text-green-400',
      description: 'User growth, engagement, and demographics'
    },
    {
      id: 'bookings',
      label: 'Booking Insights',
      icon: Calendar,
      color: 'text-purple-400',
      description: 'Booking patterns and performance'
    },
    {
      id: 'revenue',
      label: 'Revenue Analytics',
      icon: DollarSign,
      color: 'text-yellow-400',
      description: 'Financial performance and trends'
    },
    {
      id: 'studios',
      label: 'Studio Performance',
      icon: Building2,
      color: 'text-red-400',
      description: 'Studio metrics and utilization'
    },
    {
      id: 'content',
      label: 'Content Analytics',
      icon: Music,
      color: 'text-indigo-400',
      description: 'Genre preferences and content trends'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your music platform performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Export Button */}
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeMetric === metric.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{metric.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content based on active metric */}
      {activeMetric === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{analytics?.totalUsers || 1247}</p>
                  <p className="text-blue-200 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Bookings</p>
                  <p className="text-3xl font-bold">{analytics?.totalBookings || 892}</p>
                  <p className="text-green-200 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-green-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Platform Revenue</p>
                  <p className="text-3xl font-bold">${(analytics?.totalRevenue || 48560).toLocaleString()}</p>
                  <p className="text-purple-200 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +15% from last month
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Rating</p>
                  <p className="text-3xl font-bold">{(analytics?.avgRating || 4.6).toFixed(1)}</p>
                  <p className="text-orange-200 text-sm flex items-center mt-1">
                    <Star className="w-4 h-4 mr-1" />
                    Out of 5.0 stars
                  </p>
                </div>
                <Star className="w-12 h-12 text-orange-200" />
              </div>
            </Card>
          </div>

          {/* Growth Chart */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Platform Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="bookings" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeMetric === 'users' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Registration Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Demographics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Artists</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Creative musicians</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">847</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Studios</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recording facilities</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">86</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Music className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Clients</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Music enthusiasts</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">314</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeMetric === 'bookings' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Booking Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Booking Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Completed Sessions</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Successful bookings</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">756</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Average Duration</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hours per session</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">3.2h</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cancellation Rate</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Percentage of cancellations</p>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">4.2%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeMetric === 'revenue' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Platform Commission</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">From completed bookings</p>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">$12,450</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Premium Features</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Advanced tools & features</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">$8,320</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Studio Subscriptions</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly studio plans</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">$6,780</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeMetric === 'studios' && (
        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Studio Performance Rankings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Studio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Bookings</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {studioPerformanceData.map((studio, index) => (
                    <tr key={studio.name} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{studio.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{studio.bookings}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">${studio.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-gray-900 dark:text-white">{studio.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeMetric === 'content' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Genre Popularity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Content Insights</h3>
              <div className="space-y-4">
                {genreData.map((genre) => (
                  <div key={genre.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: genre.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{genre.name}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{genre.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAnalytics