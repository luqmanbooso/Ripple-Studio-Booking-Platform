import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Users,
  TrendingUp,
  Clock,
  Edit,
  Plus
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useSelector } from 'react-redux'

const ArtistDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  
  const { data: bookingsData, isLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 20
  })

  const artist = user?.artist

  // Calculate stats
  const bookings = bookingsData?.data?.bookings || []
  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0)
  
  const upcomingBookings = bookings.filter(b => 
    new Date(b.start) > new Date() && b.status === 'confirmed'
  )

  const completedBookings = bookings.filter(b => b.status === 'completed')

  const stats = [
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-400',
      change: '+12%'
    },
    {
      label: 'This Month',
      value: bookings.filter(b => {
        const bookingMonth = new Date(b.createdAt).getMonth()
        const currentMonth = new Date().getMonth()
        return bookingMonth === currentMonth
      }).length,
      icon: Calendar,
      color: 'text-primary-400',
      change: '+8%'
    },
    {
      label: 'Rating',
      value: artist?.ratingAvg ? artist.ratingAvg.toFixed(1) : 'New',
      icon: Star,
      color: 'text-yellow-400',
      change: artist?.ratingCount ? `${artist.ratingCount} reviews` : 'No reviews yet'
    },
    {
      label: 'Completed',
      value: completedBookings.length,
      icon: Users,
      color: 'text-accent-400',
      change: 'All time'
    }
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
              Artist Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your bookings and grow your music career
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" icon={<Edit className="w-5 h-5" />}>
              Edit Profile
            </Button>
            <Button icon={<Plus className="w-5 h-5" />}>
              Add Availability
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
                  <span className="text-xs text-gray-400">{stat.change}</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              </Card>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">
                  Upcoming Bookings
                </h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {booking.client?.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-100">
                            {booking.service.name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {booking.client?.name} • {new Date(booking.start).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-100">${booking.price}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(booking.start).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No upcoming bookings</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick Stats & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Profile Completion */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Profile Completion</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Overall</span>
                  <span className="text-gray-100">85%</span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>✓ Basic Info</span>
                    <span>Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Portfolio</span>
                    <span>Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>⚬ Verification</span>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-100">New booking confirmed</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-100">Review received</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-100">Profile updated</p>
                    <p className="text-xs text-gray-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Update Availability
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Portfolio
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ArtistDashboard
