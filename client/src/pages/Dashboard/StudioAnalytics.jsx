import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, Calendar, DollarSign, Users, Clock,
  Star, ArrowUp, ArrowDown, Filter, Download, RefreshCw
} from 'lucide-react'
import { useSelector } from 'react-redux'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useGetStudioQuery } from '../../store/studioApi'

const StudioAnalytics = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month') // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const { data: bookingsData, isLoading: bookingsLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 1000
  })

  const { data: studioData, isLoading: studioLoading } = useGetStudioQuery(
    user?.studio?._id || user?.studio, 
    { skip: !user?.studio }
  )

  const bookings = bookingsData?.data?.bookings || []
  const studio = studioData?.data?.studio

  const getTimeframeData = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return bookings.filter(booking => new Date(booking.createdAt) >= startDate)
  }

  const getPreviousTimeframeData = () => {
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 14)
        endDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 2)
        endDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 6)
        endDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 2)
        endDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt)
      return bookingDate >= startDate && bookingDate < endDate
    })
  }

  const currentData = getTimeframeData()
  const previousData = getPreviousTimeframeData()

  const calculateMetrics = (data) => {
    const totalBookings = data.length
    const completedBookings = data.filter(b => b.status === 'completed')
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0)
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0
    const conversionRate = totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0
    
    return { totalBookings, totalRevenue, averageBookingValue, conversionRate }
  }

  const currentMetrics = calculateMetrics(currentData)
  const previousMetrics = calculateMetrics(previousData)

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${currentMetrics.totalRevenue.toFixed(2)}`,
      change: getPercentageChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Total Bookings',
      value: currentMetrics.totalBookings,
      change: getPercentageChange(currentMetrics.totalBookings, previousMetrics.totalBookings),
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      label: 'Avg Booking Value',
      value: `$${currentMetrics.averageBookingValue.toFixed(2)}`,
      change: getPercentageChange(currentMetrics.averageBookingValue, previousMetrics.averageBookingValue),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      label: 'Conversion Rate',
      value: `${currentMetrics.conversionRate.toFixed(1)}%`,
      change: getPercentageChange(currentMetrics.conversionRate, previousMetrics.conversionRate),
      icon: Star,
      color: 'text-orange-600'
    }
  ]

  const getBookingsByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const bookingsByDay = days.map(day => ({ day, count: 0, revenue: 0 }))
    
    currentData.forEach(booking => {
      const dayIndex = new Date(booking.start).getDay()
      bookingsByDay[dayIndex].count++
      if (booking.status === 'completed') {
        bookingsByDay[dayIndex].revenue += booking.price || 0
      }
    })
    
    return bookingsByDay
  }

  const getServicePerformance = () => {
    const serviceStats = {}
    
    currentData.forEach(booking => {
      const serviceName = booking.service?.name || 'Unknown Service'
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { bookings: 0, revenue: 0 }
      }
      serviceStats[serviceName].bookings++
      if (booking.status === 'completed') {
        serviceStats[serviceName].revenue += booking.price || 0
      }
    })
    
    return Object.entries(serviceStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
  }

  const bookingsByDay = getBookingsByDay()
  const servicePerformance = getServicePerformance()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Studio Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your studio's performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const isPositive = metric.change >= 0
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.color.replace('text-', 'bg-').replace('600', '100')} dark:${metric.color.replace('text-', 'bg-').replace('600', '900')} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{Math.abs(metric.change).toFixed(1)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{metric.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Day Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Bookings by Day</h3>
          <div className="space-y-4">
            {bookingsByDay.map((day, index) => {
              const maxCount = Math.max(...bookingsByDay.map(d => d.count))
              const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              
              return (
                <div key={day.day} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{day.day.slice(0, 3)}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      >
                        <span className="text-white text-xs font-medium">{day.count}</span>
                      </motion.div>
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-900 dark:text-white text-right">
                    ${day.revenue.toFixed(0)}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Service Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Service Performance</h3>
          <div className="space-y-4">
            {servicePerformance.slice(0, 6).map((service, index) => {
              const maxRevenue = Math.max(...servicePerformance.map(s => s.revenue))
              const percentage = maxRevenue > 0 ? (service.revenue / maxRevenue) * 100 : 0
              
              return (
                <div key={service.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {service.name}
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{service.bookings} bookings</span>
                      <span>${service.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-purple-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Booking Activity</h3>
        <div className="space-y-4">
          {currentData.slice(0, 10).map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  booking.status === 'completed' ? 'bg-green-500' :
                  booking.status === 'confirmed' ? 'bg-blue-500' :
                  booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.client?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">${booking.price}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(booking.start).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default StudioAnalytics
