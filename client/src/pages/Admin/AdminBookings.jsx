import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Building2,
  Mic,
  DollarSign,
  Eye,
  Download,
  ArrowUpDown,
  MapPin,
  Phone,
  Mail,
  Zap,
  TrendingUp
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetBookingsQuery } from '../../store/adminApi'

const AdminBookings = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // API hook
  const { data: bookingsData, isLoading, error } = useGetBookingsQuery({ 
    page,
    search,
    status: statusFilter,
    sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
    limit: 15 
  })

  // Debug log to see data structure
  console.log('Bookings Data:', bookingsData)
  console.log('Is Loading:', isLoading)
  console.log('Error:', error)

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'payment_pending', label: 'Payment Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'cancelled':
      case 'refunded':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'payment_pending':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const bookingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffTime = bookingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    
    if (diffDays === 0) return `Today, ${timeString}`
    if (diffDays === 1) return `Tomorrow, ${timeString}`
    if (diffDays === -1) return `Yesterday, ${timeString}`
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Bookings Overview
              </h1>
              <p className="text-gray-400 flex items-center space-x-2 text-sm">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Monitor all platform booking activity</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            
            <Button variant="outline" className="border-slate-700 text-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Bookings</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {bookingsData?.data?.bookings?.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Confirmed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {bookingsData?.data?.bookings?.filter(b => b.status === 'confirmed').length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-white/10">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">
                  {bookingsData?.data?.bookings?.filter(b => b.status === 'completed').length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  ${bookingsData?.data?.bookings?.reduce((sum, booking) => {
                    const amount = booking.totalAmount || booking.amount || 0;
                    return sum + amount;
                  }, 0).toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-white/10">
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by client name, studio, or booking ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 min-w-[150px]"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Bookings Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 text-lg font-medium">Error loading bookings</p>
              <p className="text-gray-500 text-sm">{error?.data?.message || 'Something went wrong'}</p>
            </div>
          </div>
        ) : !bookingsData?.data?.bookings?.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">No bookings found</p>
              <p className="text-gray-500 text-sm">Bookings will appear here when users make reservations</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-slate-800/50 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
              {/* Table Header */}
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
                  <div className="col-span-3">
                    <button 
                      onClick={() => handleSort('client')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Client & Service</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => handleSort('start')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Date & Time</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">Provider</div>
                  <div className="col-span-1">
                    <button 
                      onClick={() => handleSort('price')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-slate-700/50">
                {bookingsData?.data?.bookings?.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="px-6 py-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Client & Service */}
                      <div className="col-span-3">
                        <div>
                          <h4 className="font-medium text-white">{booking.client?.name || 'N/A'}</h4>
                          <p className="text-sm text-gray-400">{booking.service?.name || 'Studio Booking'}</p>
                          <p className="text-xs text-gray-500">ID: {booking._id?.slice(-8) || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-white">{formatDate(booking.start)}</p>
                            <p className="text-xs text-gray-400">
                              {booking.service?.durationMins || 60}min session
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Provider */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          {booking.studio ? (
                            <>
                              <Building2 className="w-4 h-4 text-purple-400" />
                              <div>
                                <p className="text-sm text-white">{booking.studio?.name}</p>
                                <p className="text-xs text-gray-400">Studio</p>
                              </div>
                            </>
                          ) : booking.artist ? (
                            <>
                              <Mic className="w-4 h-4 text-yellow-400" />
                              <div>
                                <p className="text-sm text-white">{booking.artist?.user?.name}</p>
                                <p className="text-xs text-gray-400">Artist</p>
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-white">
                            ${booking.price || 0}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewBookingDetails(booking)}
                            className="border-slate-600 hover:border-blue-500 hover:text-blue-400"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Pagination */}
        {bookingsData?.data?.pagination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-4"
          >
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="border-slate-700"
              >
                Previous
              </Button>
              
              <span className="text-gray-400 px-4">
                Page {page} of {bookingsData.data.pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= bookingsData.data.pagination.pages}
                className="border-slate-700"
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setSelectedBooking(null)
            }}
          />
        )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Booking Detail Modal Component
const BookingDetailModal = ({ booking, isOpen, onClose }) => {
  if (!booking) return null

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'cancelled': 
      case 'refunded': return <XCircle className="w-4 h-4 text-red-400" />
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-blue-400" />
      default: return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'cancelled':
      case 'refunded': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'payment_pending': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
          <Calendar className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Booking Details</h2>
          <p className="text-gray-400 text-xs">ID: {booking._id.slice(-8)}</p>
        </div>
      </div>
    } size="lg">
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex justify-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(booking.status)}`}>
            {getStatusIcon(booking.status)}
            <span className="capitalize">{booking.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Client Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Name</p>
              <p className="text-sm font-medium text-white">{booking.client?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-white">{booking.client?.email || 'N/A'}</p>
            </div>
            {booking.client?.phone && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="text-sm font-medium text-white">{booking.client.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Booking Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Start Date & Time</p>
              <p className="text-sm font-medium text-white">{formatDateTime(booking.start)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">End Date & Time</p>
              <p className="text-sm font-medium text-white">{formatDateTime(booking.end)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Duration</p>
              <p className="text-sm font-medium text-white">{booking.service?.durationMins || 60} minutes</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Amount</p>
              <p className="text-sm font-semibold text-green-400">${booking.price || 0}</p>
            </div>
          </div>
        </div>

        {/* Studio/Artist Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            {booking.studio ? (
              <>
                <Building2 className="w-4 h-4 text-green-400" />
                Studio Information
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-yellow-400" />
                Artist Information
              </>
            )}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Name</p>
              <p className="text-sm font-medium text-white">
                {booking.studio?.name || booking.artist?.user?.name || 'N/A'}
              </p>
            </div>
            {booking.studio?.location && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Location</p>
                <p className="text-sm font-medium text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {booking.studio.location.city}, {booking.studio.location.country}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Service Details */}
        {booking.service && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Service Details
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Service Name</p>
                <p className="text-sm font-medium text-white">{booking.service.name}</p>
              </div>
              {booking.service.description && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-300">{booking.service.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {/* Additional Notes */}
        {booking.notes && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3">Additional Notes</h4>
            <p className="text-sm text-gray-300">{booking.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AdminBookings
