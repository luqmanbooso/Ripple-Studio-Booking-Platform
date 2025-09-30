import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, DollarSign, CheckCircle, ArrowRight, 
  ArrowLeft, AlertTriangle, Info, Star, MapPin
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Button from '../ui/Button'
import Card from '../ui/Card'
import ServiceEquipmentSelector from './ServiceEquipmentSelector'
import { useGetStudioQuery } from '../../store/studioApi'
import { useCreateBookingMutation } from '../../store/bookingApi'

const IntegratedBookingFlow = ({ studioId, onClose, onBookingCreated }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    selectedServices: [],
    selectedEquipment: [],
    selectedDate: null,
    selectedTimeSlot: null,
    duration: 0,
    totalPrice: 0,
    notes: ''
  })

  const { data: studioData, isLoading } = useGetStudioQuery(studioId)
  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation()

  const studio = studioData?.data?.studio

  const steps = [
    { id: 1, name: 'Services', description: 'Choose your services' },
    { id: 2, name: 'Equipment', description: 'Select equipment' },
    { id: 3, name: 'Schedule', description: 'Pick date & time' },
    { id: 4, name: 'Review', description: 'Confirm booking' }
  ]

  // Calculate total price and duration
  useEffect(() => {
    const servicesTotal = bookingData.selectedServices.reduce((sum, service) => 
      sum + (service.price || 0), 0
    )
    const duration = bookingData.selectedServices.reduce((sum, service) => 
      sum + (service.durationMins || 60), 0
    )
    
    setBookingData(prev => ({
      ...prev,
      totalPrice: servicesTotal,
      duration: duration
    }))
  }, [bookingData.selectedServices])

  const handleServiceSelection = (services) => {
    setBookingData(prev => ({ ...prev, selectedServices: services }))
  }

  const handleEquipmentSelection = (equipment) => {
    setBookingData(prev => ({ ...prev, selectedEquipment: equipment }))
  }

  const handleDateTimeSelection = (date, timeSlot) => {
    setBookingData(prev => ({ 
      ...prev, 
      selectedDate: date, 
      selectedTimeSlot: timeSlot 
    }))
  }

  const handleCreateBooking = async () => {
    try {
      const bookingPayload = {
        studio: studioId,
        services: bookingData.selectedServices.map(s => s.id),
        equipment: bookingData.selectedEquipment.map(e => e.id),
        start: new Date(`${bookingData.selectedDate}T${bookingData.selectedTimeSlot}`),
        end: new Date(new Date(`${bookingData.selectedDate}T${bookingData.selectedTimeSlot}`).getTime() + bookingData.duration * 60000),
        price: bookingData.totalPrice,
        notes: bookingData.notes
      }

      await createBooking(bookingPayload).unwrap()
      toast.success('Booking created successfully!')
      onBookingCreated?.()
      onClose?.()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create booking')
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return bookingData.selectedServices.length > 0
      case 2: return true // Equipment is optional
      case 3: return bookingData.selectedDate && bookingData.selectedTimeSlot
      case 4: return true
      default: return false
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Studio Info Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{studio?.name}</h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{studio?.location?.city}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{studio?.rating || 'No ratings'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <ServiceSelectionStep
              services={studio?.services || []}
              selectedServices={bookingData.selectedServices}
              onSelectionChange={handleServiceSelection}
            />
          )}

          {currentStep === 2 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Equipment
              </h3>
              <ServiceEquipmentSelector
                selectedServices={bookingData.selectedServices}
                availableEquipment={studio?.equipment || []}
                onEquipmentChange={handleEquipmentSelection}
                bookingDate={bookingData.selectedDate}
                timeSlot={bookingData.selectedTimeSlot}
              />
            </Card>
          )}

          {currentStep === 3 && (
            <ScheduleSelectionStep
              studioId={studioId}
              duration={bookingData.duration}
              selectedDate={bookingData.selectedDate}
              selectedTimeSlot={bookingData.selectedTimeSlot}
              onSelectionChange={handleDateTimeSelection}
            />
          )}

          {currentStep === 4 && (
            <BookingReviewStep
              bookingData={bookingData}
              studio={studio}
              onNotesChange={(notes) => setBookingData(prev => ({ ...prev, notes }))}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose?.()}
          disabled={isCreating}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceedToNext()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreateBooking}
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isCreating ? 'Creating...' : 'Confirm Booking'}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Service Selection Step Component
const ServiceSelectionStep = ({ services, selectedServices, onSelectionChange }) => {
  const handleServiceToggle = (service) => {
    const isSelected = selectedServices.find(s => s.id === service.id)
    let newSelection
    
    if (isSelected) {
      newSelection = selectedServices.filter(s => s.id !== service.id)
    } else {
      newSelection = [...selectedServices, service]
    }
    
    onSelectionChange(newSelection)
  }

  const serviceCategories = [...new Set(services.map(s => s.category))]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Choose Your Services ({selectedServices.length} selected)
      </h3>
      
      <div className="space-y-6">
        {serviceCategories.map(category => {
          const categoryServices = services.filter(s => s.category === category)
          
          return (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                {category} Services
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryServices.map(service => {
                  const isSelected = selectedServices.find(s => s.id === service.id)
                  
                  return (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={() => handleServiceToggle(service)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </h5>
                            {service.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>${service.price}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{service.durationMins} mins</span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Schedule Selection Step Component  
const ScheduleSelectionStep = ({ studioId, duration, selectedDate, selectedTimeSlot, onSelectionChange }) => {
  // This would integrate with the availability system
  // For now, showing a simplified version
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Select Date & Time
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Date</h4>
          {/* Calendar component would go here */}
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Calendar integration needed</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Available Times</h4>
          {/* Time slots would go here */}
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Time slots based on availability</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Booking Review Step Component
const BookingReviewStep = ({ bookingData, studio, onNotesChange }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Review Your Booking
      </h3>
      
      <div className="space-y-6">
        {/* Services Summary */}
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Selected Services</h4>
          <div className="space-y-2">
            {bookingData.selectedServices.map(service => (
              <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({service.durationMins} mins)</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">${service.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Summary */}
        {bookingData.selectedEquipment.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Selected Equipment</h4>
            <div className="grid grid-cols-2 gap-2">
              {bookingData.selectedEquipment.map(equipment => (
                <div key={equipment.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  {equipment.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Date & Time</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {bookingData.selectedDate} at {bookingData.selectedTimeSlot}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Duration</h4>
            <p className="text-gray-600 dark:text-gray-400">{bookingData.duration} minutes</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Additional Notes</h4>
          <textarea
            value={bookingData.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Any special requirements or notes..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
          />
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-gray-900 dark:text-white">${bookingData.totalPrice}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default IntegratedBookingFlow
