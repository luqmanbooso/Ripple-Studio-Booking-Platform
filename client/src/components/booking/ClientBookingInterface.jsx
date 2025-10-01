import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, DollarSign, User, MapPin, Star, 
  ChevronLeft, ChevronRight, Plus, Minus, CheckCircle,
  AlertCircle, CreditCard, Phone, Mail, MessageCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ClientBookingInterface = ({ studio, onBookingComplete }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSlots, setSelectedSlots] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [bookingStep, setBookingStep] = useState(1) // 1: Service, 2: Time, 3: Details, 4: Payment
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

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
    // Mock availability check - replace with actual API call
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
    const hour = parseInt(time.split(':')[0])
    return hour >= 9 && hour <= 17 && dayOfWeek !== 'Sunday'
  }

  const isSlotBooked = (date, time) => {
    // Mock booking check - replace with actual API call
    return Math.random() < 0.3 // 30% chance of being booked
  }

  const handleSlotClick = (date, time) => {
    if (isSlotBooked(date, time)) {
      toast.error('This time slot is already booked')
      return
    }

    if (!isSlotAvailable(date, time)) {
      toast.error('This time slot is not available')
      return
    }

    const slotKey = `${date.toISOString().split('T')[0]}-${time}`
    
    if (!isSelecting) {
      setIsSelecting(true)
      setSelectionStart({ date, time })
      setSelectedSlots([slotKey])
    } else {
      setIsSelecting(false)
      setSelectionStart(null)
    }
  }

  const handleSlotHover = (date, time) => {
    if (isSelecting && selectionStart) {
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

  const calculateTotalPrice = () => {
    if (!selectedService || selectedSlots.length === 0) return 0
    
    const basePrice = selectedService.price
    const hours = selectedSlots.length
    const discount = hours > 4 ? 0.15 : hours > 2 ? 0.1 : 0
    
    return Math.round(basePrice * hours * (1 - discount))
  }

  const getSlotStatus = (date, time) => {
    const slotKey = `${date.toISOString().split('T')[0]}-${time}`
    
    if (selectedSlots.includes(slotKey)) return 'selected'
    if (isSlotBooked(date, time)) return 'booked'
    if (isSlotAvailable(date, time)) return 'available'
    return 'unavailable'
  }

  const getSlotColor = (date, time) => {
    const status = getSlotStatus(date, time)
    
    switch (status) {
      case 'selected':
        return 'bg-blue-500 text-white border-blue-600 shadow-lg transform scale-105'
      case 'booked':
        return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed'
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
    }
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const handleBookingSubmit = async () => {
    try {
      const bookingData = {
        studio: studio._id,
        service: selectedService._id,
        slots: selectedSlots,
        client: clientInfo,
        totalPrice: calculateTotalPrice()
      }
      
      // Mock API call - replace with actual booking API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Booking request sent successfully!')
      onBookingComplete?.(bookingData)
    } catch (error) {
      toast.error('Failed to submit booking request')
    }
  }

  const weekDates = getWeekDates(currentDate)

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Book {studio.name}
        </h1>
        <div className="flex items-center justify-center space-x-6 text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{studio.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{studio.rating} ({studio.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[
          { step: 1, label: 'Service', icon: Star },
          { step: 2, label: 'Time', icon: Clock },
          { step: 3, label: 'Details', icon: User },
          { step: 4, label: 'Payment', icon: CreditCard }
        ].map(({ step, label, icon: Icon }, index) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              bookingStep >= step 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </div>
            {index < 3 && (
              <div className={`w-8 h-0.5 mx-2 ${
                bookingStep > step ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service Selection */}
        {bookingStep === 1 && (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studio.services?.map((service) => (
                <motion.div
                  key={service._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedService(service)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedService?._id === service._id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${service.price}</div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} minutes</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {selectedService && (
              <div className="flex justify-end">
                <button
                  onClick={() => setBookingStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors"
                >
                  Continue to Time Selection
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Time Selection */}
        {bookingStep === 2 && (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Select Time Slots</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg border hover:shadow-md transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg border hover:shadow-md transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedSlots.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-900 text-xl">
                        ${calculateTotalPrice()}
                      </span>
                    </div>
                    {selectedSlots.length > 2 && (
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {selectedSlots.length > 4 ? '15%' : '10%'} discount applied!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-4 bg-gray-50 font-semibold text-gray-600">Time</div>
                {weekDates.map((date, index) => (
                  <div key={index} className="p-4 bg-gray-50 text-center">
                    <div className="font-semibold text-gray-900">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-gray-700 mt-1">
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="max-h-96 overflow-y-auto">
                {timeSlots.filter(time => {
                  const hour = parseInt(time.split(':')[0])
                  return hour >= 8 && hour <= 20
                }).map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                    <div className="p-3 bg-gray-50 border-r border-gray-200 font-medium text-gray-600">
                      {time}
                    </div>
                    {weekDates.map((date, index) => (
                      <div
                        key={index}
                        className={`p-3 border-r border-gray-100 last:border-r-0 transition-all duration-200 ${getSlotColor(date, time)}`}
                        onClick={() => handleSlotClick(date, time)}
                        onMouseEnter={() => handleSlotHover(date, time)}
                      >
                        <div className="w-full h-6 flex items-center justify-center">
                          {getSlotStatus(date, time) === 'selected' && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">How to select time:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Click on an available (green) slot to start selection</li>
                    <li>• Hover over other slots to extend your booking range</li>
                    <li>• Click again to confirm your selection</li>
                    <li>• Longer bookings get automatic discounts!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setBookingStep(1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl transition-colors"
              >
                Back to Services
              </button>
              {selectedSlots.length > 0 && (
                <button
                  onClick={() => setBookingStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors"
                >
                  Continue to Details
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Client Details */}
        {bookingStep === 3 && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({...clientInfo, notes: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setBookingStep(2)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl transition-colors"
              >
                Back to Time Selection
              </button>
              {clientInfo.name && clientInfo.email && clientInfo.phone && (
                <button
                  onClick={() => setBookingStep(4)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors"
                >
                  Continue to Payment
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 4: Payment & Confirmation */}
        {bookingStep === 4 && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Booking Summary</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Studio:</span>
                  <span className="font-semibold">{studio.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{selectedSlots.length} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Price:</span>
                  <span>${selectedService?.price * selectedSlots.length}</span>
                </div>
                {selectedSlots.length > 2 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount ({selectedSlots.length > 4 ? '15%' : '10%'}):</span>
                    <span>-${selectedService?.price * selectedSlots.length * (selectedSlots.length > 4 ? 0.15 : 0.1)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setBookingStep(3)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl transition-colors"
              >
                Back to Details
              </button>
              <button
                onClick={handleBookingSubmit}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Confirm Booking
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ClientBookingInterface
