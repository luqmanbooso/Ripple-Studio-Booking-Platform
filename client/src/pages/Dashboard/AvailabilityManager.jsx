import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  X,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'

const AvailabilityManager = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  
  const { data: studioData, isLoading } = useGetStudioQuery(studioId, { skip: !studioId })
  const [updateStudio, { isLoading: isSaving }] = useUpdateStudioMutation()
  
  const [availability, setAvailability] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)

  const studio = studioData?.data?.studio

  useEffect(() => {
    if (studio?.availability) {
      setAvailability(studio.availability)
    }
  }, [studio])

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

  const addAvailabilitySlot = (slotData) => {
    const newSlot = {
      _id: Date.now().toString(),
      start: new Date(`${slotData.date}T${slotData.startTime}`),
      end: new Date(`${slotData.date}T${slotData.endTime}`),
      isRecurring: slotData.isRecurring,
      daysOfWeek: slotData.isRecurring ? slotData.daysOfWeek : [],
      timezone: 'UTC'
    }
    setAvailability(prev => [...prev, newSlot])
  }

  const removeAvailabilitySlot = (slotId) => {
    setAvailability(prev => prev.filter(slot => slot._id !== slotId))
  }

  const saveAvailability = async () => {
    try {
      await updateStudio({
        id: studioId,
        availability: availability.map(slot => ({
          start: slot.start,
          end: slot.end,
          isRecurring: slot.isRecurring,
          daysOfWeek: slot.daysOfWeek,
          timezone: slot.timezone
        }))
      }).unwrap()
      toast.success('Availability updated successfully!')
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Availability Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Set your studio's available time slots for bookings
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddModal(true)}
                icon={<Plus className="w-4 h-4" />}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                Add Slot
              </Button>
              <Button
                onClick={saveAvailability}
                loading={isSaving}
                icon={<Save className="w-4 h-4" />}
                variant="success"
              >
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatDate(selectedDate)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                      icon={<ChevronRight className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map(time => {
                    const isAvailable = availability.some(slot => {
                      const slotStart = new Date(slot.start)
                      const slotEnd = new Date(slot.end)
                      const timeDate = new Date(`${selectedDate.toISOString().split('T')[0]}T${time}:00`)
                      
                      if (slot.isRecurring) {
                        return slot.daysOfWeek.includes(selectedDate.getDay()) &&
                               timeDate >= slotStart && timeDate < slotEnd
                      } else {
                        return timeDate >= slotStart && timeDate < slotEnd
                      }
                    })

                    return (
                      <motion.div
                        key={time}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isAvailable
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium">{time}</div>
                          <div className="text-xs mt-1">
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Availability Slots List */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Current Availability
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {availability.map(slot => (
                      <motion.div
                        key={slot._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {slot.isRecurring ? (
                                `Recurring: ${slot.daysOfWeek.map(day => 
                                  daysOfWeek.find(d => d.value === day)?.label.slice(0, 3)
                                ).join(', ')}`
                              ) : (
                                new Date(slot.start).toLocaleDateString()
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAvailabilitySlot(slot._id)}
                            icon={<Trash2 className="w-3 h-3" />}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {availability.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No availability slots set</p>
                      <p className="text-sm">Add slots to start receiving bookings</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Add Availability Modal */}
        <AddAvailabilityModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addAvailabilitySlot}
          daysOfWeek={daysOfWeek}
          timeSlots={timeSlots}
        />
      </div>
    </div>
  )
}

const AddAvailabilityModal = ({ isOpen, onClose, onAdd, daysOfWeek, timeSlots }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
    daysOfWeek: []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time')
      return
    }

    if (formData.isRecurring && formData.daysOfWeek.length === 0) {
      toast.error('Please select at least one day for recurring availability')
      return
    }

    onAdd(formData)
    onClose()
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      daysOfWeek: []
    })
  }

  const toggleDay = (dayValue) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter(d => d !== dayValue)
        : [...prev.daysOfWeek, dayValue]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Availability Slot
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="w-4 h-4" />}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recurring Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-900 dark:text-white">
                Recurring availability
              </label>
            </div>

            {/* Date (only for non-recurring) */}
            {!formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Days of Week (only for recurring) */}
            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Days of Week
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map(day => (
                    <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.daysOfWeek.includes(day.value)}
                        onChange={() => toggleDay(day.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                Add Slot
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default AvailabilityManager
