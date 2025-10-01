import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Plus, Save, Trash2, Copy, ChevronLeft, ChevronRight, 
  Settings, DollarSign, Users, AlertCircle, CheckCircle, X, Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'
import { useGetMyBookingsQuery } from '../../store/bookingApi'

const EnhancedStudioAvailability = () => {
  const { user } = useSelector(state => state.auth)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week')
  const [availability, setAvailability] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [filterView, setFilterView] = useState('all') // all, available, booked
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
    daysOfWeek: [],
    price: '',
    maxCapacity: 1
  })

  const { data: studioData, isLoading } = useGetStudioQuery(user?.studio?._id || user?.studio)
  const { data: bookingsData } = useGetMyBookingsQuery({ page: 1, limit: 100 })
  const [updateStudio, { isLoading: isUpdating }] = useUpdateStudioMutation()

  const bookings = bookingsData?.data?.bookings || []
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

  useEffect(() => {
    if (studioData?.data?.studio?.availability) {
      setAvailability(studioData.data.studio.availability.schedule || [])
    }
  }, [studioData])

  const getWeekDates = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const isSlotAvailable = (date, time) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
    const dateString = date.toISOString().split('T')[0]
    
    // Default availability for demo - 9 AM to 6 PM on weekdays
    const hour = parseInt(time.split(':')[0])
    const isWeekday = !['Saturday', 'Sunday'].includes(dayOfWeek)
    const defaultAvailable = isWeekday && hour >= 9 && hour <= 18
    
    // Check custom availability rules
    const hasCustomRule = availability.some(slot => {
      if (slot.isRecurring) {
        return slot.daysOfWeek?.includes(dayOfWeek) &&
               time >= slot.startTime && time < slot.endTime
      } else {
        return slot.date === dateString &&
               time >= slot.startTime && time < slot.endTime
      }
    })
    
    return hasCustomRule || defaultAvailable
  }

  const isSlotBooked = (date, time) => {
    if (!confirmedBookings || confirmedBookings.length === 0) return false
    
    const slotDateTime = new Date(date)
    const [hours] = time.split(':')
    slotDateTime.setHours(parseInt(hours), 0, 0, 0)
    
    return confirmedBookings.some(booking => {
      if (!booking.start || !booking.end) return false
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      // Check if the slot falls within the booking time
      return slotDateTime >= bookingStart && slotDateTime < bookingEnd
    })
  }

  const getSlotBooking = (date, time) => {
    const slotDateTime = new Date(date)
    const [hours] = time.split(':')
    slotDateTime.setHours(parseInt(hours), 0, 0, 0)
    
    return confirmedBookings.find(booking => {
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      return slotDateTime >= bookingStart && slotDateTime < bookingEnd
    })
  }

  const handleSlotClick = (date, time) => {
    const slotKey = `${date.toISOString().split('T')[0]}-${time}`
    
    if (isSlotBooked(date, time)) {
      // Show booking details
      const booking = getSlotBooking(date, time)
      toast.info(`Booked by ${booking.client?.name || 'Client'} - ${booking.service?.name || 'Service'}`)
      return
    }

    // Studio owners can add ANY slot - no availability check needed
    // (Availability check is only for clients booking slots)

    if (!isSelecting) {
      setIsSelecting(true)
      setSelectionStart({ date, time })
      setSelectedSlots([slotKey])
    } else {
      // End selection
      setIsSelecting(false)
      if (selectedSlots.length > 1) {
        setShowPricingModal(true)
      }
    }
  }

  const handleSlotHover = (date, time) => {
    if (isSelecting && selectionStart) {
      const slotKey = `${date.toISOString().split('T')[0]}-${time}`
      const startKey = `${selectionStart.date.toISOString().split('T')[0]}-${selectionStart.time}`
      
      // Calculate range
      const range = calculateSlotRange(selectionStart, { date, time })
      setSelectedSlots(range)
    }
  }

  const calculateSlotRange = (start, end) => {
    const range = []
    const startDate = new Date(start.date)
    const endDate = new Date(end.date)
    const startHour = parseInt(start.time.split(':')[0])
    const endHour = parseInt(end.time.split(':')[0])
    
    // For same day selection
    if (startDate.toDateString() === endDate.toDateString()) {
      const minHour = Math.min(startHour, endHour)
      const maxHour = Math.max(startHour, endHour)
      
      for (let hour = minHour; hour <= maxHour; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`
        const slotKey = `${startDate.toISOString().split('T')[0]}-${timeStr}`
        range.push(slotKey)
      }
    }
    
    return range
  }

  const calculateSelectionPrice = () => {
    if (selectedSlots.length === 0) return 0
    
    // Get base hourly rate from availability settings
    const baseRate = availability.find(slot => slot.price)?.price || 50
    const totalHours = selectedSlots.length
    const discount = totalHours > 4 ? 0.1 : totalHours > 2 ? 0.05 : 0
    
    return Math.round(baseRate * totalHours * (1 - discount))
  }

  const handleSave = async () => {
    try {
      await updateStudio({
        id: user?.studio?._id || user?.studio,
        availability: { schedule: availability }
      }).unwrap()
      toast.success('Availability updated successfully!')
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const getSlotStatus = (date, time) => {
    if (isSlotBooked(date, time)) return 'booked'
    if (isSlotAvailable(date, time)) return 'available'
    return 'unavailable'
  }

  const getSlotColor = (date, time) => {
    const slotKey = `${date.toISOString().split('T')[0]}-${time}`
    const status = getSlotStatus(date, time)
    
    if (selectedSlots.includes(slotKey)) {
      return 'bg-blue-500 border-blue-600 shadow-lg transform scale-105 text-white'
    }
    
    switch (status) {
      case 'booked':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer'
      default:
        return 'bg-black dark:bg-gray-900 border-gray-800 text-white hover:bg-gray-900 cursor-pointer'
    }
  }

  const weekDates = getWeekDates(currentDate)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Studio Availability
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Manage your available hours and view bookings
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            {['all', 'available', 'booked'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterView(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  filterView === filter
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Add Time Slot</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Selection Info */}
      <AnimatePresence>
        {selectedSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-900 dark:text-green-100">
                    ${calculateSelectionPrice()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSlots([])
                  setIsSelecting(false)
                  setSelectionStart(null)
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Calendar Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button
              onClick={() => navigateWeek(1)}
              className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
          </div>
        </div>
      </div>

      {/* Enhanced Weekly Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Time</span>
          </div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-center">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">
                {date.getDate()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {confirmedBookings.filter(booking => {
                  const bookingDate = new Date(booking.start).toDateString()
                  return bookingDate === date.toDateString()
                }).length} bookings
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{time}</span>
              </div>
              {weekDates.map((date, index) => {
                const status = getSlotStatus(date, time)
                const booking = getSlotBooking(date, time)
                
                return (
                  <div
                    key={index}
                    className={`p-3 border-r border-gray-100 dark:border-gray-700 last:border-r-0 transition-all duration-200 ${getSlotColor(date, time)}`}
                    onClick={() => handleSlotClick(date, time)}
                    onMouseEnter={() => handleSlotHover(date, time)}
                  >
                    {status === 'booked' && booking && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium truncate">
                          {booking.client?.name || 'Client'}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {booking.service?.name || 'Service'}
                        </div>
                      </div>
                    )}
                    {status === 'available' && (
                      <div className="w-full h-8 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full opacity-60"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              How to select time ranges:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Click on an available slot to start selection</li>
              <li>• Hover over other slots to extend the range</li>
              <li>• Click again to confirm selection and see pricing</li>
              <li>• Red slots are already booked by clients</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Enhanced Availability Rules */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Current Availability Rules
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {availability.map((slot) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {slot.startTime} - {slot.endTime}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {slot.isRecurring ? `Every ${slot.daysOfWeek?.join(', ')}` : slot.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {slot.price && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${slot.price}/hour</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {availability.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No availability rules set
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your first time slot to start accepting bookings
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Add Time Slot
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedStudioAvailability
