import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Plus, Save, Trash2, Copy, 
  ChevronLeft, ChevronRight, Settings
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'

const CompleteStudioAvailability = () => {
  const { user } = useSelector(state => state.auth)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // week, month
  const [availability, setAvailability] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
    daysOfWeek: [],
    price: ''
  })

  const { data: studioData, isLoading } = useGetStudioQuery(user?.studio?._id || user?.studio)
  const [updateStudio, { isLoading: isUpdating }] = useUpdateStudioMutation()

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

  const handleAddSlot = () => {
    setEditingSlot(null)
    setFormData({
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      daysOfWeek: [],
      price: ''
    })
    setShowAddModal(true)
  }

  const handleEditSlot = (slot) => {
    setEditingSlot(slot)
    setFormData({
      date: slot.date || '',
      startTime: slot.startTime || '09:00',
      endTime: slot.endTime || '17:00',
      isRecurring: slot.isRecurring || false,
      daysOfWeek: slot.daysOfWeek || [],
      price: slot.price || ''
    })
    setShowAddModal(true)
  }

  const handleSubmitSlot = () => {
    const slotData = {
      ...formData,
      id: editingSlot?.id || Date.now().toString(),
      price: formData.price ? parseFloat(formData.price) : null
    }

    if (editingSlot) {
      setAvailability(availability.map(slot => slot.id === editingSlot.id ? slotData : slot))
      toast.success('Time slot updated!')
    } else {
      setAvailability([...availability, slotData])
      toast.success('Time slot added!')
    }
    
    setShowAddModal(false)
  }

  const handleDeleteSlot = (slotId) => {
    setAvailability(availability.filter(slot => slot.id !== slotId))
    toast.success('Time slot deleted!')
  }

  const handleDuplicateSlot = (slot) => {
    const duplicatedSlot = {
      ...slot,
      id: Date.now().toString(),
      date: ''
    }
    setAvailability([...availability, duplicatedSlot])
    toast.success('Time slot duplicated!')
  }

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
    
    return availability.some(slot => {
      if (slot.isRecurring) {
        return slot.daysOfWeek?.includes(dayOfWeek) &&
               time >= slot.startTime && time < slot.endTime
      } else {
        return slot.date === dateString &&
               time >= slot.startTime && time < slot.endTime
      }
    })
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const weekDates = getWeekDates(currentDate)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Studio Availability</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set your available hours for bookings
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddSlot}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Time Slot</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</span>
          </div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">{time}</span>
              </div>
              {weekDates.map((date, index) => (
                <div
                  key={index}
                  className={`p-3 border-r border-gray-100 dark:border-gray-700 last:border-r-0 ${
                    isSlotAvailable(date, time)
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } transition-colors cursor-pointer`}
                >
                  {isSlotAvailable(date, time) && (
                    <div className="w-full h-6 bg-green-500 rounded-sm opacity-60"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Availability Rules */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Availability Rules
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence>
            {availability.map((slot) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    
                    {slot.isRecurring ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Every {slot.daysOfWeek?.join(', ')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {slot.date}
                        </span>
                      </div>
                    )}
                    
                    {slot.price && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ${slot.price}/hour
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDuplicateSlot(slot)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditSlot(slot)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {availability.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No availability rules set. Add your first time slot to get started.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Slot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recurring weekly
                  </label>
                </div>

                {formData.isRecurring ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Days of Week
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {daysOfWeek.map((day) => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.daysOfWeek.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  daysOfWeek: [...formData.daysOfWeek, day]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  daysOfWeek: formData.daysOfWeek.filter(d => d !== day)
                                })
                              }
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hourly Rate (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSlot}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingSlot ? 'Update' : 'Add'} Slot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CompleteStudioAvailability
