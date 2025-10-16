import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Plus, Filter, Search, ChevronLeft, ChevronRight,
  Users, DollarSign, MapPin, Settings, Edit, Trash2, CheckCircle,
  XCircle, AlertCircle, Eye, MessageCircle, Star, Phone, Mail
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetMyBookingsQuery, useCompleteBookingMutation, useCancelBookingMutation } from '../../store/bookingApi'

const EnhancedStudioBookings = () => {
  const { user } = useSelector(state => state.auth)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // calendar, list, timeline
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const { data: bookingsData, isLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 100,
    status: statusFilter !== 'all' ? statusFilter : undefined
  })

  const [completeBooking] = useCompleteBookingMutation()
  const [cancelBooking] = useCancelBookingMutation()

  const bookings = bookingsData?.data?.bookings || []

  // Filter bookings by search and date
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      booking.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const bookingDate = new Date(booking.start)
    const matchesDate = viewMode !== 'calendar' || 
      bookingDate.toDateString() === selectedDate.toDateString()
    
    return matchesSearch && matchesDate
  })

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      if (newStatus === 'completed') {
        await completeBooking({ id: bookingId, notes: '' }).unwrap()
        toast.success('Booking completed successfully')
      } else if (newStatus === 'cancelled') {
        await cancelBooking({ id: bookingId, reason: 'Cancelled by studio' }).unwrap()
        toast.success('Booking cancelled successfully')
      } else {
        toast.error('Unsupported status update')
        return
      }
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update booking')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    // Generate 30-minute slots from 9 AM to 9 PM
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 21) { // Don't add :30 for the last hour
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    return slots
  }

  const getBookingForTimeSlot = (timeSlot) => {
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    
    return filteredBookings.find(booking => {
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      
      // Create a time object for the slot (using selected date)
      const slotTime = new Date(selectedDate)
      slotTime.setHours(slotHour, slotMinute, 0, 0)
      
      // Check if the slot time falls within the booking duration
      return slotTime >= bookingStart && slotTime < bookingEnd
    })
  }

  // Get all bookings for the selected date (for better calendar display)
  const getDayBookings = () => {
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.start)
      return bookingDate.toDateString() === selectedDate.toDateString()
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Studio Bookings & Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your studio bookings and availability
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Users className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Bookings
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client or service..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {viewMode === 'calendar' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-end">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              <Plus className="w-4 h-4 mr-2" />
              Block Time Slot
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generateTimeSlots().map(timeSlot => {
              const booking = getBookingForTimeSlot(timeSlot)
              return (
                <motion.div
                  key={timeSlot}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    booking 
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 hover:shadow-md' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => booking && (setSelectedBooking(booking), setShowDetails(true))}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{timeSlot}</span>
                    {booking && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    )}
                  </div>
                  
                  {booking ? (
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-white">{booking.client?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service?.name}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{booking.service?.durationMins}min</span>
                        <span>LKR {booking.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                  )}
                </motion.div>
              )
            })}
          </div>
          
          {/* All Bookings for Selected Date */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              All Bookings for {selectedDate.toLocaleDateString()}
            </h4>
            {getDayBookings().length > 0 ? (
              <div className="space-y-3">
                {getDayBookings().map(booking => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => (setSelectedBooking(booking), setShowDetails(true))}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.client?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(booking.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(booking.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No bookings scheduled for this date</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="p-6">
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{booking.client?.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service?.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{new Date(booking.start).toLocaleDateString()}</span>
                      <span>{new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{booking.service?.durationMins}min</span>
                      <span>LKR {booking.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  
                  {booking.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowDetails(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Booking Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Client Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.client?.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.client?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.client?.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Booking Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(selectedBooking.start).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(selectedBooking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>LKR {selectedBooking.price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Service Details</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium">{selectedBooking.service?.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedBooking.service?.description}
                </p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>Duration: {selectedBooking.service?.durationMins} minutes</span>
                  <span>Price: LKR {selectedBooking.service?.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {selectedBooking.status === 'pending' && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EnhancedStudioBookings
