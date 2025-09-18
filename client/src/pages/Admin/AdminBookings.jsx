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
  ArrowUpDown
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
  const { data: bookingsData, isLoading } = useGetBookingsQuery({ 
    page,
    search,
    status: statusFilter,
    sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
    limit: 15 
  })

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
    if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'HH:mm')}`
    if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`
    return format(date, 'MMM dd, yyyy HH:mm')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Bookings Overview
              </h1>
              <p className="text-gray-400 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Monitor all platform booking activity</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by client name, studio, or booking ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field min-w-[150px]"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              
              <Button variant="outline" size="sm" className="border-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Bookings Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
                          <h4 className="font-medium text-white">{booking.client?.name}</h4>
                          <p className="text-sm text-gray-400">{booking.service?.name}</p>
                          <p className="text-xs text-gray-500">ID: {booking._id.slice(-8)}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-white">{formatDate(booking.start)}</p>
                            <p className="text-xs text-gray-400">
                              {booking.service?.durationMins}min session
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
                            {booking.price?.toLocaleString()}
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
            className="flex justify-center mt-8"
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
  )
}

// Booking Detail Modal Component
const BookingDetailModal = ({ booking, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Client Information</h4>
            <div className="space-y-2">
              <p className="text-sm"><span className="text-gray-400">Name:</span> <span className="text-white">{booking.client?.name}</span></p>
              <p className="text-sm"><span className="text-gray-400">Email:</span> <span className="text-white">{booking.client?.email}</span></p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Booking Details</h4>
            <div className="space-y-2">
              <p className="text-sm"><span className="text-gray-400">ID:</span> <span className="text-white font-mono">{booking._id}</span></p>
              <p className="text-sm"><span className="text-gray-400">Created:</span> <span className="text-white">{format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</span></p>
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div>
          <h4 className="font-semibold text-white mb-3">Service Information</h4>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Service</p>
                <p className="text-white font-medium">{booking.service?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="text-white font-medium">{booking.service?.durationMins} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Price</p>
                <p className="text-white font-medium">${booking.price?.toLocaleString()}</p>
              </div>
            </div>
            {booking.service?.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-white text-sm">{booking.service.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Provider Info */}
        <div>
          <h4 className="font-semibold text-white mb-3">Provider Information</h4>
          <div className="bg-slate-800/30 rounded-lg p-4">
            {booking.studio ? (
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-purple-400" />
                <div>
                  <h5 className="font-medium text-white">{booking.studio.name}</h5>
                  <p className="text-sm text-gray-400">{booking.studio.location?.city}, Sri Lanka</p>
                </div>
              </div>
            ) : booking.artist ? (
              <div className="flex items-center space-x-3">
                <Mic className="w-8 h-8 text-yellow-400" />
                <div>
                  <h5 className="font-medium text-white">{booking.artist.user?.name}</h5>
                  <p className="text-sm text-gray-400">Professional Artist</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Provider information not available</p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h4 className="font-semibold text-white mb-3">Schedule</h4>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Start Time</p>
                <p className="text-white font-medium">{format(new Date(booking.start), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">End Time</p>
                <p className="text-white font-medium">{format(new Date(booking.end), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h4 className="font-semibold text-white mb-3">Status & Payment</h4>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Booking Status</p>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium mt-1 ${
                  booking.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  booking.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                  booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}>
                  <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Payment Status</p>
                <p className="text-white font-medium mt-1">{booking.paymentStatus || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AdminBookings
