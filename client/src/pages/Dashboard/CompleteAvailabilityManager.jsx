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
  
  // Generate week dates starting from Sunday
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate)
    const startOfWeek = date.getDate() - date.getDay()
    date.setDate(startOfWeek + i)
    return date
  })

  // Get slot status and booking info
  const getSlotInfo = (day, hour) => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
    const timeInMinutes = hour * 60
    
    // Check for bookings first
    const booking = bookings.find(booking => {
      if (booking.status === 'cancelled') return false
      
      const bookingDate = new Date(booking.date)
      const currentWeekDate = new Date(currentDate)
      currentWeekDate.setDate(currentWeekDate.getDate() - currentWeekDate.getDay() + day)
      
      const isSameDate = bookingDate.toDateString() === currentWeekDate.toDateString()
      if (!isSameDate) return false
      
      const bookingStartMinutes = new Date(booking.start).getHours() * 60 + new Date(booking.start).getMinutes()
      const bookingEndMinutes = new Date(booking.end).getHours() * 60 + new Date(booking.end).getMinutes()
      
      return timeInMinutes >= bookingStartMinutes && timeInMinutes < bookingEndMinutes
    })
    
    if (booking) {
      return {
        type: 'booked',
        booking,
        clickable: true,
        clientName: booking.client?.name || booking.clientName || 'Client',
        service: booking.service?.name || booking.service || 'Session',
        duration: Math.round((booking.endTime - booking.startTime) / 60),
        status: booking.status,
        notes: booking.notes
      }
    }
    
    // Check for availability slots
    const availableSlot = availability.find(slot => {
      if (slot.isRecurring) {
        // Recurring slot
        if (!slot.daysOfWeek || !slot.daysOfWeek.includes(day)) return false
        
        const slotStart = new Date(slot.start)
        const slotEnd = new Date(slot.end)
        const slotStartMinutes = slotStart.getHours() * 60 + slotStart.getMinutes()
        const slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes()
        
        return timeInMinutes >= slotStartMinutes && timeInMinutes < slotEndMinutes
      } else {
        // Non-recurring slot
        const currentWeekDate = new Date(currentDate)
        currentWeekDate.setDate(currentWeekDate.getDate() - currentWeekDate.getDay() + day)
        const slotDate = slot.date
        
        if (currentWeekDate.toISOString().split('T')[0] !== slotDate) return false
        
        return timeInMinutes >= slot.startTime && timeInMinutes < slot.endTime
      }
    })
    
    if (availableSlot) {
      return {
        type: 'available',
        slot: availableSlot,
        clickable: true,
        price: availableSlot.price || 0,
        description: availableSlot.description
      }
    }
    
    return {
      type: 'unavailable',
      clickable: true
    }
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

  // Get enhanced slot styling and info
  const getSlotStyle = (day, hour) => {
    const slotInfo = getSlotInfo(day, hour)
    
    const baseClasses = 'relative border transition-all duration-200 cursor-pointer min-h-[60px] p-1 text-xs overflow-hidden'
    
    switch (slotInfo.type) {
      case 'booked':
        return {
          className: `${baseClasses} bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]`,
          content: (
            <div className="h-full flex flex-col justify-between">
              <div className="font-semibold text-white truncate">
                {slotInfo.clientName}
              </div>
              <div className="text-red-100 text-[10px] truncate">
                {slotInfo.service}
              </div>
              <div className="text-red-200 text-[10px]">
                {slotInfo.duration}min • {slotInfo.status}
              </div>
            </div>
          )
        }
      case 'available':
        return {
          className: `${baseClasses} bg-gradient-to-br from-green-400 to-green-500 border-green-300 text-white shadow-md hover:shadow-lg hover:scale-[1.02]`,
          content: (
            <div className="h-full flex flex-col justify-between">
              <div className="font-medium text-white text-[10px]">
                Available
              </div>
              {slotInfo.price > 0 && (
                <div className="text-green-100 text-[10px]">
                  Rs. {slotInfo.price}
                </div>
              )}
              {slotInfo.description && (
                <div className="text-green-200 text-[9px] truncate">
                  {slotInfo.description}
                </div>
              )}
            </div>
          )
        }
      default:
        return {
          className: `${baseClasses} bg-gray-800 dark:bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600`,
          content: (
            <div className="h-full flex items-center justify-center text-[10px] opacity-50">
              +
            </div>
          )
        }
    }
  }

  // Get availability slot for a time
  const getAvailabilitySlot = (date, time) => {
    const dayOfWeek = date.getDay()
    const [hours, minutes] = time.split(':').map(Number)
    const timeInMinutes = hours * 60 + minutes
    
    return availability.find(slot => {
      if (slot.isRecurring) {
        // Recurring slot
        if (!slot.daysOfWeek?.includes(dayOfWeek)) return false
        const slotStart = new Date(slot.start)
        const slotEnd = new Date(slot.end)
        const slotStartMinutes = slotStart.getHours() * 60 + slotStart.getMinutes()
        const slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes()
        return timeInMinutes >= slotStartMinutes && timeInMinutes < slotEndMinutes
      } else {
        // Non-recurring slot
        const slotDate = slot.date
        const currentDateStr = date.toISOString().split('T')[0]
        
        if (currentDateStr !== slotDate) return false
        
        return timeInMinutes >= slot.startTime && timeInMinutes < slot.endTime
      }
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

  // Handle bulk slot creation for multiple selections
  const handleBulkSlotCreation = async () => {
    if (selectedSlots.length === 0) {
      toast.error('No slots selected')
      return
    }

    try {
      const bulkSlots = []
      
      // Create slot data for each selected slot
      for (const slotKey of selectedSlots) {
        const [dateStr, timeStr] = slotKey.split('-').slice(-2)
        const startTimeMinutes = parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1])
        const endTimeMinutes = startTimeMinutes + 60 // 1-hour slots
        
        bulkSlots.push({
          date: dateStr,
          startTime: startTimeMinutes,
          endTime: endTimeMinutes,
          isRecurring: false,
          price: parseFloat(slotForm.price) || 5000,
          description: slotForm.description || `Available slot ${timeStr}`
        })
      }

      // Add all slots in parallel
      const promises = bulkSlots.map(slotData => 
        addAvailability({ id: studioId, ...slotData }).unwrap()
      )
      
      await Promise.all(promises)
      await refetch()
      
      toast.success(`${selectedSlots.length} time slots added successfully!`)
      setShowAddModal(false)
      setSelectedSlots([])
      setIsSelecting(false)
      setSelectionStart(null)
      
    } catch (error) {
      console.error('Failed to add bulk slots:', error)
      toast.error('Failed to add some slots. Please try again.')
    }
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
      
      if (!slotForm.isRecurring && (!slotForm.specificDate || slotForm.specificDate.trim() === '')) {
        toast.error('Please select a specific date for non-recurring slots')
        return
      }
      
      console.log('Form validation passed. Complete slot form data:', slotForm)

      let slotData;
      
      if (slotForm.isRecurring) {
        // Recurring slot - use local time without timezone conversion
        const startDate = new Date(`2000-01-01T${slotForm.startTime}:00`)
        const endDate = new Date(`2000-01-01T${slotForm.endTime}:00`)
        
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
        
        // Ensure date is in YYYY-MM-DD format
        let dateValue = slotForm.specificDate
        if (!dateValue) {
          dateValue = new Date().toISOString().split('T')[0]
        }
        
        console.log('Non-recurring slot data being sent:', {
          date: dateValue,
          startTime: startTimeMinutes,
          endTime: endTimeMinutes,
          isRecurring: false,
          originalSpecificDate: slotForm.specificDate
        })
        
        slotData = {
          date: dateValue, // YYYY-MM-DD format
          startTime: startTimeMinutes,
          endTime: endTimeMinutes,
          isRecurring: false,
          price: parseFloat(slotForm.price) || 0,
          description: slotForm.description
        }
      }

      const result = await addAvailability({ id: studioId, ...slotData }).unwrap()
      
      // Force refetch to update the calendar immediately
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
      console.error('Error details:', error.data)
      console.error('Error status:', error.status)
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
      console.error('Error details:', error.data)
      toast.error(error.data?.message || 'Failed to delete availability slot')
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
        <div className="grid grid-cols-8 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
          <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold text-gray-800 dark:text-white border-r">
            Time
          </div>
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <div key={index} className={`p-4 text-center border-r last:border-r-0 ${
                isToday 
                  ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900' 
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800'
              }`}>
                <div className={`font-bold ${
                  isToday 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-gray-800 dark:text-white'
                }`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-sm mt-1 ${
                  isToday 
                    ? 'text-blue-600 dark:text-blue-300 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {date.getDate()}
                  {isToday && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time Slots Grid */}
        <div className="max-h-[600px] overflow-y-auto scrollbar-styled">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-r font-medium">
                {time}
              </div>
              {weekDates.map((date, index) => {
                const booking = getSlotBooking(date, time)
                
                const slotStyle = getSlotStyle(index, parseInt(time.split(':')[0]))
                return (
                  <div
                    key={index}
                    className={`${slotStyle.className} border-r last:border-r-0`}
                    onClick={() => handleSlotClick(date, time)}
                    onMouseEnter={() => handleSlotHover(date, time)}
                  >
                    {slotStyle.content}
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
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedSlots.length > 1 ? `Add ${selectedSlots.length} Time Slots` : 'Add Time Slot'}
                    </h2>
                    {selectedSlots.length > 1 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Creating availability for {selectedSlots.length} selected slots
                      </p>
                    )}
                  </div>
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
                {/* Show selected slots info for bulk operations */}
                {selectedSlots.length > 1 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Selected Time Slots:</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {selectedSlots.slice(0, 6).map((slot, index) => {
                        const timeStr = slot.split('-').slice(-1)[0];
                        return (
                          <div key={index} className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-center">
                            {timeStr}
                          </div>
                        );
                      })}
                      {selectedSlots.length > 6 && (
                        <div className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-center">
                          +{selectedSlots.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Time Range - Only show for single slot or recurring */}
                {(selectedSlots.length <= 1 || slotForm.isRecurring) && (
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
                )}

                {/* Recurring - Only show for single slot operations */}
                {selectedSlots.length <= 1 && (
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slotForm.isRecurring}
                      onChange={(e) => {
                        console.log('Recurring checkbox changed:', e.target.checked)
                        console.log('Current form state before change:', slotForm)
                        setSlotForm({ ...slotForm, isRecurring: e.target.checked })
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Recurring weekly</span>
                  </label>
                  </div>
                )}

                {/* Specific Date for Non-Recurring */}
                {!slotForm.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Specific Date</label>
                    <input
                      type="date"
                      value={slotForm.specificDate || ''}
                      onChange={(e) => {
                        console.log('Date input changed:', e.target.value)
                        setSlotForm({ ...slotForm, specificDate: e.target.value })
                      }}
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
                {selectedSlots.length > 1 && !slotForm.isRecurring ? (
                  <button
                    onClick={handleBulkSlotCreation}
                    disabled={isAdding}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAdding ? 'Adding...' : `Add ${selectedSlots.length} Slots`}
                  </button>
                ) : (
                  <button
                    onClick={handleAddTimeSlot}
                    disabled={isAdding}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAdding ? 'Adding...' : 'Add Time Slot'}
                  </button>
                )}
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
                      <div className="font-semibold">{selectedBooking.service?.name || selectedBooking.service || 'Session'}</div>
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
                    <p><span className="font-medium">Date:</span> {selectedBooking.start ? new Date(selectedBooking.start).toLocaleDateString() : 'Not available'}</p>
                    <p><span className="font-medium">Time:</span> {selectedBooking.start && selectedBooking.end ? `${new Date(selectedBooking.start).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })} - ${new Date(selectedBooking.end).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}` : 'Not available'}</p>
                    <p><span className="font-medium">Duration:</span> {selectedBooking.start && selectedBooking.end ? Math.round((new Date(selectedBooking.end) - new Date(selectedBooking.start)) / (1000 * 60)) : 0} minutes</p>
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
