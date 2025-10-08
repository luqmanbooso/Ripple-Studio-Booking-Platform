import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Star, 
  Search, 
  TrendingUp,
  Sparkles,
  CreditCard,
  BarChart3
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import BookingCard from '../../components/bookings/BookingCard'
import VerificationBanner from '../../components/common/VerificationBanner'
import { useGetMyBookingsQuery } from '../../store/bookingApi'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const ClientDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()
  
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
    { value: 'reservation_pending', label: 'Payment Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container py-8 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Manage your studio bookings and discover amazing recording spaces for your next project
          </p>
        </motion.div>

        {/* Verification Banner */}
        <VerificationBanner />

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Link to="/search?type=studios">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl cursor-pointer overflow-hidden backdrop-blur-sm"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Book Studios</h3>
                <p className="text-gray-400 leading-relaxed">Discover and reserve professional recording spaces for your next project</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/search">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl cursor-pointer overflow-hidden backdrop-blur-sm"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Explore Studios</h3>
                <p className="text-gray-400 leading-relaxed">Browse all available studios and find the perfect match for your needs</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/genres">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-8 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl cursor-pointer overflow-hidden backdrop-blur-sm"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/25">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Browse Genres</h3>
                <p className="text-gray-400 leading-relaxed">Explore studios by music genre and find specialized recording environments</p>
              </div>
            </motion.div>
          </Link>

          <Link to="/dashboard/spending">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-8 bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-2xl cursor-pointer overflow-hidden backdrop-blur-sm"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/25">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">Spending History</h3>
                <p className="text-gray-400 leading-relaxed">Track your booking expenses and download financial reports</p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm overflow-hidden"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/20 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-white group-hover:text-gray-100 transition-colors">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                    stat.label === 'Total Bookings' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' :
                    stat.label === 'Upcoming' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' :
                    'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Bookings</h2>
              <p className="text-gray-400">Track and manage your studio reservations</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/50 min-w-[160px]"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-white">
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
                  <BookingCard 
                    key={booking._id} 
                    booking={booking} 
                    userRole="client"
                  />
                )
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-2xl backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Calendar className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">No bookings yet</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Start your musical journey by discovering and booking professional recording studios</p>
              <Link to="/search?type=studios">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-purple-500/25">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Studios
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* Enhanced Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                  <p className="text-gray-400">Manage your studio experience</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/search">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-400/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">Find Studios</h3>
                        <p className="text-sm text-gray-400">Discover new spaces</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/payments')}
                  className="group p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl cursor-pointer transition-all duration-300 hover:border-green-400/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">Payment History</h3>
                      <p className="text-sm text-gray-400">View transactions</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl cursor-pointer transition-all duration-300 hover:border-purple-400/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">Analytics</h3>
                      <p className="text-sm text-gray-400">Booking insights</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ClientDashboard
