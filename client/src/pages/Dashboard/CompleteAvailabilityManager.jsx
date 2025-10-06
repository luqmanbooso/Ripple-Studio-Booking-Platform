import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Plus, Save, Trash2, Edit2, ChevronLeft, ChevronRight, 
  DollarSign, Users, AlertCircle, X, Info, MapPin, Mail, Phone, User
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGetStudioQuery, useAddAvailabilityMutation, useDeleteAvailabilityMutation } from '../../store/studioApi'
import { useGetMyBookingsQuery } from '../../store/bookingApi'

const CompleteAvailabilityManager = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSlots, setSelectedSlots] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedAvailability, setSelectedAvailability] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedSlotsForDeletion, setSelectedSlotsForDeletion] = useState([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  
  const [slotForm, setSlotForm] = useState({
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    specificDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    price: 5000,
    description: ''
  })

  const { data: studioData, isLoading, refetch } = useGetStudioQuery(studioId, { skip: !studioId })
  const { data: bookingsData } = useGetMyBookingsQuery({ page: 1, limit: 50 })
  const [addAvailability, { isLoading: isAdding }] = useAddAvailabilityMutation()
  const [deleteAvailability, { isLoading: isDeleting }] = useDeleteAvailabilityMutation()

  const studio = studioData?.data?.studio
  
  // Try multiple possible data structures
  let availability = []
  if (Array.isArray(studio?.availability)) {
    availability = studio.availability
  } else if (Array.isArray(studio?.availability?.schedule)) {
    availability = studio.availability.schedule
  } else if (studio?.availability) {
    console.warn('Unexpected availability structure:', studio.availability)
  }
  
  const bookings = bookingsData?.data?.bookings || []
  const confirmedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(b.status))

  // Removed debug logging to prevent console spam

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

  // Get week dates
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

  const weekDates = getWeekDates(currentDate)

  // Check if slot is available
  const isSlotAvailable = (date, time) => {
    if (!availability || availability.length === 0) return false
    
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const dateString = date.toISOString().split('T')[0]
    const [hours, minutes] = time.split(':').map(Number)
    const timeInMinutes = hours * 60 + minutes
    
    const result = availability.some(slot => {
      if (slot.isRecurring) {
        // Check if this day is in the recurring schedule
        if (!slot.daysOfWeek?.includes(dayOfWeek)) return false
        
        // Parse slot times
        const slotStart = new Date(slot.start)
        const slotEnd = new Date(slot.end)
        const slotStartMinutes = slotStart.getUTCHours() * 60 + slotStart.getUTCMinutes()
        const slotEndMinutes = slotEnd.getUTCHours() * 60 + slotEnd.getUTCMinutes()
        
        const isAvailable = timeInMinutes >= slotStartMinutes && timeInMinutes < slotEndMinutes
        
        // Removed debug logging to prevent console spam
        
        return isAvailable
      } else {
        // One-time slot - check specific date
        return slot.date === dateString &&
               timeInMinutes >= slot.startTime && timeInMinutes < slot.endTime
      }
    })
    
    return result
  }

  // Check if slot is booked
  const isSlotBooked = (date, time) => {
    const slotDateTime = new Date(date)
    const [hours] = time.split(':')
    slotDateTime.setHours(parseInt(hours), 0, 0, 0)
    
    return confirmedBookings.some(booking => {
      if (!booking.start || !booking.end) return false
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      return slotDateTime >= bookingStart && slotDateTime < bookingEnd
    })
  }

  // Get booking for slot
  const getSlotBooking = (date, time) => {
    const slotDateTime = new Date(date)
    const [hours] = time.split(':')
    slotDateTime.setHours(parseInt(hours), 0, 0, 0)
    
    return confirmedBookings.find(booking => {
      if (!booking.start || !booking.end) return false
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      return slotDateTime >= bookingStart && slotDateTime < bookingEnd
    })
  }

  // Get slot color
  const getSlotColor = (date, time) => {
    const slotKey = `${date.toISOString().split('T')[0]}-${time}`
    
    if (selectedSlots.includes(slotKey)) {
      return 'bg-blue-500 border-blue-600 shadow-lg text-white cursor-pointer'
    }
    
    if (isSlotBooked(date, time)) {
      return 'bg-red-100 border-red-300 text-red-800 cursor-pointer hover:bg-red-200'
    }
    
    if (isSlotAvailable(date, time)) {
      return 'bg-green-100 border-green-300 text-green-800 cursor-pointer hover:bg-green-200 hover:shadow-md transition-all'
    }
    
    return 'bg-black dark:bg-gray-900 border-gray-800 text-white hover:bg-gray-800 cursor-pointer'
  }

  // Get availability slot for a time
  const getAvailabilitySlot = (date, time) => {
    const dayOfWeek = date.getDay()
    const [hours, minutes] = time.split(':').map(Number)
    const timeInMinutes = hours * 60 + minutes
    
    return availability.find(slot => {
      if (slot.isRecurring) {
        if (!slot.daysOfWeek?.includes(dayOfWeek)) return false
        const slotStart = new Date(slot.start)
        const slotEnd = new Date(slot.end)
        const slotStartMinutes = slotStart.getUTCHours() * 60 + slotStart.getUTCMinutes()
        const slotEndMinutes = slotEnd.getUTCHours() * 60 + slotEnd.getUTCMinutes()
        return timeInMinutes >= slotStartMinutes && timeInMinutes < slotEndMinutes
      }
      return false
    })
  }

  // Handle slot click
  const handleSlotClick = (date, time) => {
    // Check if slot is booked - show booking details
    const booking = getSlotBooking(date, time)
    if (booking) {
      setSelectedBooking(booking)
      setShowBookingModal(true)
      return
    }

    // Check if slot has availability - show edit/delete
    const availabilitySlot = getAvailabilitySlot(date, time)
    if (availabilitySlot) {
      setSelectedAvailability(availabilitySlot)
      setShowEditModal(true)
      return
    }

    // Otherwise, allow adding new availability
    const slotKey = `${date.toISOString().split('T')[0]}-${time}`
    
    if (!isSelecting) {
      setIsSelecting(true)
      setSelectionStart({ date, time })
      setSelectedSlots([slotKey])
    } else {
      setIsSelecting(false)
      
      if (selectedSlots.length > 0 && selectionStart) {
        // Calculate start and end time from selection
        const times = selectedSlots.map(key => key.split('-')[3])
        const sortedTimes = times.sort()
        const startTime = sortedTimes[0]
        const endHour = parseInt(sortedTimes[sortedTimes.length - 1].split(':')[0]) + 1
        const endTime = `${endHour.toString().padStart(2, '0')}:00`
        
        // Get day of week
        const dayOfWeek = selectionStart.date.toLocaleDateString('en-US', { weekday: 'long' })
        
        // Pre-populate form
        setSlotForm({
          ...slotForm,
          startTime: startTime,
          endTime: endTime,
          daysOfWeek: [dayOfWeek]
        })
        
        setShowAddModal(true)
      }
      
      setSelectionStart(null)
    }
  }

  // Handle slot hover
  const handleSlotHover = (date, time) => {
    if (isSelecting && selectionStart) {
      const range = calculateSlotRange(selectionStart, { date, time })
      setSelectedSlots(range)
    }
  }

  // Calculate slot range
  const calculateSlotRange = (start, end) => {
    const range = []
    const startDate = new Date(start.date)
    const endDate = new Date(end.date)
    const startHour = parseInt(start.time.split(':')[0])
    const endHour = parseInt(end.time.split(':')[0])
    
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

  // Convert day names to numbers (Sunday=0, Monday=1, etc.)
  const dayNameToNumber = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  }

  // Handle add time slot
  const handleAddTimeSlot = async () => {
    try {
      // Validate form
      if (!slotForm.startTime || !slotForm.endTime) {
        toast.error('Please select start and end time')
        return
      }

      if (slotForm.startTime >= slotForm.endTime) {
        toast.error('End time must be after start time')
        return
      }

      if (slotForm.isRecurring && slotForm.daysOfWeek.length === 0) {
        toast.error('Please select at least one day')
        return
      }

      let slotData;
      
      if (slotForm.isRecurring) {
        // Recurring slot - use start/end times with days of week
        const startDate = new Date(`2000-01-01T${slotForm.startTime}:00Z`)
        const endDate = new Date(`2000-01-01T${slotForm.endTime}:00Z`)
        
        slotData = {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          isRecurring: true,
          daysOfWeek: slotForm.daysOfWeek.map(day => dayNameToNumber[day]),
          price: parseFloat(slotForm.price) || 0,
          description: slotForm.description
        }
      } else {
        // Non-recurring slot - use specific date with start/end times in minutes
        const startTimeMinutes = parseInt(slotForm.startTime.split(':')[0]) * 60 + parseInt(slotForm.startTime.split(':')[1])
        const endTimeMinutes = parseInt(slotForm.endTime.split(':')[0]) * 60 + parseInt(slotForm.endTime.split(':')[1])
        
        slotData = {
          date: slotForm.specificDate || new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          startTime: startTimeMinutes,
          endTime: endTimeMinutes,
          isRecurring: false,
          price: parseFloat(slotForm.price) || 0,
          description: slotForm.description
        }
      }

      const result = await addAvailability({ id: studioId, ...slotData }).unwrap()
      
      // Force refetch to update the calendar
      await refetch()
      
      toast.success('Time slot added successfully! Calendar updated.')
      setShowAddModal(false)
      setSelectedSlots([])
      setIsSelecting(false)
      setSelectionStart(null)
      
      // Reset form
      setSlotForm({
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        specificDate: new Date().toISOString().split('T')[0],
        price: 5000,
        description: ''
      })
    } catch (error) {
      console.error('Failed to add time slot:', error)
      const errorMessage = error?.data?.message || error?.data?.error || 'Failed to add time slot'
      toast.error(errorMessage)
    }
  }

  // Navigate week
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  // Toggle day of week
  const toggleDayOfWeek = (day) => {
    setSlotForm(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }))
  }

  // Handle delete availability
  const handleDeleteAvailability = async () => {
    if (!selectedAvailability?._id) {
      toast.error('Invalid availability slot')
      return
    }

    try {
      await deleteAvailability({ 
        studioId, 
        slotId: selectedAvailability._id 
      }).unwrap()
      
      toast.success('Availability slot deleted successfully!')
      setShowEditModal(false)
      setSelectedAvailability(null)
      await refetch()
    } catch (error) {
      console.error('Failed to delete availability:', error)
      toast.error(error?.data?.message || 'Failed to delete availability slot')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Availability Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your studio's time slots and view bookings
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Time Slot</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">How to use:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li>• <strong>⬛ Black slots</strong>: Click to add new availability</li>
              <li>• <strong>🟩 Green slots</strong>: Available slots (click to view/delete)</li>
              <li>• <strong>🟥 Red slots</strong>: Booked by clients (click for details)</li>
              <li>• <strong>🟦 Blue slots</strong>: Currently selected for adding</li>
              <li>• Click and drag black slots to select multiple hours at once</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl border hover:shadow-md transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold">
            {weekDates[0]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
            {' '}{weekDates[6]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          
          <button
            onClick={() => navigateWeek(1)}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl border hover:shadow-md transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-xl overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 font-semibold">Time</div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
              <div className="font-semibold">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-r font-medium">
                {time}
              </div>
              {weekDates.map((date, index) => {
                const booking = getSlotBooking(date, time)
                
                return (
                  <div
                    key={index}
                    className={`p-2 border-r last:border-r-0 transition-all min-h-[60px] ${getSlotColor(date, time)}`}
                    onClick={() => handleSlotClick(date, time)}
                    onMouseEnter={() => handleSlotHover(date, time)}
                  >
                    {booking && (
                      <div className="bg-red-500 text-white rounded p-1 space-y-1 shadow-sm">
                        <div className="text-xs font-semibold truncate flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-1 flex-shrink-0"></div>
                          {booking.client?.name || booking.user?.name || 'Client'}
                        </div>
                        <div className="text-xs opacity-90 truncate">
                          {booking.service?.name || 'Session'}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {new Date(booking.start).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })} - {new Date(booking.end).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </div>
                        {booking.notes && (
                          <div className="text-xs opacity-75 truncate italic">
                            "{booking.notes.substring(0, 20)}{booking.notes.length > 20 ? '...' : ''}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Time Slot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Time Slot</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setSelectedSlots([])
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Time</label>
                    <input
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Time</label>
                    <input
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Recurring */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slotForm.isRecurring}
                      onChange={(e) => setSlotForm({ ...slotForm, isRecurring: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Recurring weekly</span>
                  </label>
                </div>

                {/* Specific Date for Non-Recurring */}
                {!slotForm.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Specific Date</label>
                    <input
                      type="date"
                      value={slotForm.specificDate}
                      onChange={(e) => setSlotForm({ ...slotForm, specificDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Days of Week */}
                {slotForm.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Select Days</label>
                    <div className="grid grid-cols-4 gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDayOfWeek(day)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            slotForm.daysOfWeek.includes(day)
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Price (LKR per hour)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="number"
                      value={slotForm.price}
                      onChange={(e) => setSlotForm({ ...slotForm, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5000"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description (Optional)</label>
                  <textarea
                    value={slotForm.description}
                    onChange={(e) => setSlotForm({ ...slotForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="e.g., Full equipment access, includes engineer..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedSlots([])
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTimeSlot}
                  disabled={isAdding}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? 'Adding...' : 'Add Time Slot'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Client Info */}
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Client</div>
                    <div className="font-semibold">{selectedBooking.client?.name || 'N/A'}</div>
                  </div>
                </div>

                {/* Email */}
                {selectedBooking.client?.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                      <div className="font-semibold">{selectedBooking.client.email}</div>
                    </div>
                  </div>
                )}

                {/* Time */}
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                    <div className="font-semibold">
                      {new Date(selectedBooking.start).toLocaleString()} - 
                      {new Date(selectedBooking.end).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Service */}
                {selectedBooking.service && (
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Service</div>
                      <div className="font-semibold">{selectedBooking.service}</div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                    <div className="font-semibold capitalize">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedBooking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit/Delete Availability Modal */}
      <AnimatePresence>
        {showEditModal && selectedAvailability && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Availability Slot</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedAvailability(null)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Time Range */}
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedAvailability.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(selectedAvailability.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Days of Week */}
                {selectedAvailability.isRecurring && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Repeats On</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedAvailability.daysOfWeek?.map(day => 
                          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                        ).join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Price per hour</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      LKR {selectedAvailability.price?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedAvailability.description && (
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Description</div>
                      <div className="text-gray-900 dark:text-white">{selectedAvailability.description}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  onClick={handleDeleteAvailability}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Slot'}</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedAvailability(null)
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                    Booking Details
                  </h2>
                  <button
                    onClick={() => {
                      setShowBookingModal(false)
                      setSelectedBooking(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Client Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Client Information
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedBooking.client?.name || selectedBooking.user?.name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedBooking.client?.email || selectedBooking.user?.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedBooking.client?.phone || selectedBooking.user?.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Session Details
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Service:</span> {selectedBooking.service?.name || 'Recording Session'}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedBooking.start).toLocaleDateString()}</p>
                    <p><span className="font-medium">Time:</span> {new Date(selectedBooking.start).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })} - {new Date(selectedBooking.end).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}</p>
                    <p><span className="font-medium">Duration:</span> {Math.round((new Date(selectedBooking.end) - new Date(selectedBooking.start)) / (1000 * 60))} minutes</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedBooking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Payment Info */}
                {selectedBooking.totalAmount && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Payment Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Amount:</span> LKR {selectedBooking.totalAmount?.toLocaleString()}</p>
                      <p><span className="font-medium">Payment Status:</span> 
                        <span className="ml-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => {
                    setShowBookingModal(false)
                    setSelectedBooking(null)
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CompleteAvailabilityManager
