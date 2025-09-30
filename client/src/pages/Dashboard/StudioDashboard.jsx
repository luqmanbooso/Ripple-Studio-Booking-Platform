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
  Settings,
  CreditCard,
  Users,
  BarChart3
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import BookingCard from '../../components/bookings/BookingCard'
import StudioApprovalBanner from '../../components/common/StudioApprovalBanner'
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const StudioDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  
  const { data: bookingsData, isLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 20
  })

  const studio = user?.studio
  const navigate = useNavigate()

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
      icon: BadgeDollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      label: 'Upcoming Bookings',
      value: upcomingBookings.length,
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'This Month',
      value: thisMonthBookings.length,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Average Rating',
      value: studio?.ratingAvg ? `${studio.ratingAvg.toFixed(1)}/5` : 'N/A',
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10'
    }
  ]

  const quickActions = [
    {
      label: 'Manage Availability',
      description: 'Set your available time slots',
      icon: Calendar,
      color: 'bg-blue-500',
      action: () => navigate('/dashboard/availability')
    },
    {
      label: 'Studio Profile',
      description: 'Update equipment and amenities',
      icon: Building,
      color: 'bg-purple-500',
      action: () => navigate('/dashboard/profile')
    },
    {
      label: 'Payment History',
      description: 'View earnings and transactions',
      icon: CreditCard,
      color: 'bg-green-500',
      action: () => navigate('/dashboard/payments')
    },
    {
      label: 'Studio Settings',
      description: 'Manage services and pricing',
      icon: Settings,
      color: 'bg-gray-500',
      action: () => navigate('/dashboard/settings/studio')
    }
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                Studio Dashboard
              </h1>
              <p className="text-gray-400">
                Welcome back, {studio?.name || user?.name}
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard/settings/studio')}
              icon={<Settings className="w-4 h-4" />}
              variant="outline"
            >
              Studio Settings
            </Button>
          </div>

          {/* Studio Approval Banner */}
          <StudioApprovalBanner />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-100">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={action.action}
                        className="p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-primary-500 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-100 group-hover:text-primary-400 transition-colors duration-200">
                              {action.label}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </Card>

              {/* Recent Bookings */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-100">Recent Bookings</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/bookings')}
                  >
                    View All
                  </Button>
                </div>
                
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <BookingCard 
                        key={booking._id} 
                        booking={booking} 
                        userRole="studio"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No bookings yet</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Studio Status */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-100 mb-4">Studio Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Current Status</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Next Booking</span>
                    <span className="text-gray-100 text-sm">
                      {upcomingBookings[0] ? 
                        new Date(upcomingBookings[0].start).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'None today'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Services Active</span>
                    <span className="text-gray-100">{studio?.services?.length || 0}</span>
                  </div>
                </div>
              </Card>

              {/* Revenue Chart Placeholder */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-100 mb-4">Revenue Trend</h3>
                <div className="h-32 bg-dark-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Chart coming soon</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudioDashboard
