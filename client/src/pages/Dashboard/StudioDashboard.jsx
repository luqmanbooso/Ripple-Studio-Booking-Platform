import React, { useState } from 'react'
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
  Settings
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useSelector } from 'react-redux'

const StudioDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  
  const { data: bookingsData, isLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 20
  })

  const studio = user?.studio

  // Calculate stats
  const bookings = bookingsData?.data?.bookings || []
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0)
  
  const upcomingBookings = bookings.filter(b => 
    new Date(b.start) > new Date() && b.status === 'confirmed'
  )

  const thisMonthBookings = bookings.filter(b => {
    const bookingMonth = new Date(b.createdAt).getMonth()
    const currentMonth = new Date().getMonth()
    return bookingMonth === currentMonth
  })

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: BadgeDollarSign ,
      color: 'text-green-400',
      change: '+15%',
      subtitle: 'This month'
    },
    {
      label: 'Bookings',
      value: thisMonthBookings.length,
      icon: Calendar,
      color: 'text-primary-400',
      change: '+8%',
      subtitle: 'This month'
    },
    {
      label: 'Rating',
      value: studio?.ratingAvg ? studio.ratingAvg.toFixed(1) : 'New',
      icon: Star,
      color: 'text-yellow-400',
      change: studio?.ratingCount ? `${studio.ratingCount} reviews` : 'No reviews yet',
      subtitle: 'Average rating'
    },
    {
      label: 'Utilization',
      value: '73%',
      icon: Building,
      color: 'text-accent-400',
      change: '+5%',
      subtitle: 'This month'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Studio Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your studio bookings and operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" icon={<Settings className="w-5 h-5" />}>
              Studio Settings
            </Button>
            <Button icon={<Plus className="w-5 h-5" />}>
              Add Service
            </Button>
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
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
              </Card>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Today's Schedule
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Week View
                  </Button>
                  <Button variant="outline" size="sm">
                    Month View
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-1">
                  {/* Time slots */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = 9 + i
                    const timeSlot = `${hour.toString().padStart(2, '0')}:00`
                    const booking = upcomingBookings.find(b => {
                      const bookingHour = new Date(b.start).getHours()
                      return bookingHour === hour
                    })
                    
                    return (
                      <div key={hour} className="flex items-center space-x-4 py-2 border-b border-gray-800 last:border-b-0">
                        <div className="w-16 text-sm text-gray-400">
                          {timeSlot}
                        </div>
                        <div className="flex-1">
                          {booking ? (
                            <div className="bg-primary-900/30 border border-primary-500/30 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-100">
                                    {booking.service.name}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {booking.client?.name}
                                  </p>
                                </div>
                                <div className="text-sm font-medium text-primary-400">
                                  ${booking.price}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-600 dark:text-gray-400 text-sm italic">
                              Available
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No bookings today</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Studio Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Studio Status */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Studio Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Status</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                    Available
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Booking</span>
                  <span className="text-gray-900 dark:text-gray-100 text-sm">
                    {upcomingBookings[0] ? 
                      new Date(upcomingBookings[0].start).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'None today'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Services Active</span>
                  <span className="text-gray-900 dark:text-gray-100">{studio?.services?.length || 0}</span>
                </div>
              </div>
            </Card>

            {/* Revenue Chart Placeholder */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue Trend</h3>
              <div className="h-32 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Chart coming soon</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Block Time Slot
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Update Services
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Equipment List
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default StudioDashboard
