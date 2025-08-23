import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Star, 
  Search, 
  Plus,
  Filter,
  ChevronRight
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useSelector } from 'react-redux'

const ClientDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [filter, setFilter] = useState('all')
  
  const { data: bookingsData, isLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 10,
    ...(filter !== 'all' && { status: filter })
  })

  const stats = [
    {
      label: 'Total Bookings',
      value: bookingsData?.data?.pagination?.total || 0,
      icon: Calendar,
      color: 'text-primary-400'
    },
    {
      label: 'Upcoming',
      value: bookingsData?.data?.bookings?.filter(b => 
        new Date(b.start) > new Date() && b.status === 'confirmed'
      ).length || 0,
      icon: Clock,
      color: 'text-accent-400'
    },
    {
      label: 'Completed',
      value: bookingsData?.data?.bookings?.filter(b => 
        b.status === 'completed'
      ).length || 0,
      icon: Star,
      color: 'text-green-400'
    }
  ]

  const filterOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400">
            Manage your bookings and discover new talent
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <Link to="/search?type=artists">
            <Card hover className="p-6 bg-gradient-to-r from-primary-900/20 to-primary-700/20 border-primary-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-100 mb-1">Find Artists</h3>
                  <p className="text-gray-400">Discover talented musicians</p>
                </div>
                <Search className="w-8 h-8 text-primary-400" />
              </div>
            </Card>
          </Link>

          <Link to="/search?type=studios">
            <Card hover className="p-6 bg-gradient-to-r from-accent-900/20 to-accent-700/20 border-accent-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-100 mb-1">Book Studios</h3>
                  <p className="text-gray-400">Reserve recording spaces</p>
                </div>
                <Plus className="w-8 h-8 text-accent-400" />
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            )
          })}
        </motion.div>

        {/* Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-100">Your Bookings</h2>
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : bookingsData?.data?.bookings?.length > 0 ? (
            <div className="space-y-4">
              {bookingsData.data.bookings.map((booking) => {
                const provider = booking.artist || booking.studio
                const providerType = booking.artist ? 'artist' : 'studio'
                const providerName = provider?.user?.name || provider?.name
                
                const statusColors = {
                  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
                  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
                  payment_pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }

                return (
                  <Card key={booking._id} hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium">
                            {providerName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-100">
                            {booking.service.name} with {providerName}
                          </h3>
                          <div className="flex items-center space-x-4 text-gray-400 text-sm">
                            <span>{new Date(booking.start).toLocaleDateString()}</span>
                            <span>{new Date(booking.start).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                            <span className="capitalize">{providerType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status] || statusColors.confirmed}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-gray-100">
                          ${booking.price}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-100 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start by exploring our talented artists and professional studios
              </p>
              <Link to="/search">
                <Button icon={<Search className="w-5 h-5" />}>
                  Start Exploring
                </Button>
              </Link>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ClientDashboard
