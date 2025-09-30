import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Plus, Save, X, ChevronLeft, ChevronRight,
  Settings, Copy, Trash2, AlertCircle, CheckCircle, Edit,
  RefreshCw, ToggleLeft, ToggleRight, Moon, Sun
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'

const StudioAvailabilityManager = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  
  const { data: studioData, isLoading } = useGetStudioQuery(studioId, { skip: !studioId })
  const [updateStudio, { isLoading: isSaving }] = useUpdateStudioMutation()
  
  const [availability, setAvailability] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('weekly') // daily, weekly, monthly
  const [showModal, setShowModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState([])

  const studio = studioData?.data?.studio

  useEffect(() => {
    if (studio?.availability) {
      setAvailability(studio.availability.map(slot => ({
        ...slot,
        id: slot._id || Date.now() + Math.random()
      })))
    }
  }, [studio])

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  const timeSlots = []
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  const getCurrentWeek = () => {
    const start = new Date(selectedDate)
    const day = start.getDay()
    const diff = start.getDate() - day
    start.setDate(diff)
    
    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      week.push(date)
    }
    return week
  }

  const isSlotAvailable = (date, time) => {
    const dayOfWeek = date.getDay()
    const [hours, minutes] = time.split(':').map(Number)
    const slotDateTime = new Date(date)
    slotDateTime.setHours(hours, minutes, 0, 0)

    return availability.some(slot => {
      if (slot.isRecurring) {
        return slot.daysOfWeek?.includes(dayOfWeek) &&
               new Date(`1970-01-01T${slot.startTime}`) <= new Date(`1970-01-01T${time}:00`) &&
               new Date(`1970-01-01T${slot.endTime}`) > new Date(`1970-01-01T${time}:00`)
      } else {
        const slotStart = new Date(slot.start)
        const slotEnd = new Date(slot.end)
        return slotDateTime >= slotStart && slotDateTime < slotEnd
      }
    })
  }

  const handleSaveAvailability = async () => {
    try {
      const availabilityData = {
        schedule: availability,
        timeZone: 'UTC', // You might want to make this configurable
        equipmentSchedule: equipmentAvailability || {}
      }
      
      await updateStudio({ id: studioId, availability: availabilityData }).unwrap()
      toast.success('Availability updated successfully')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update availability')
    }
  }

  const handleAddSlot = (slotData) => {
    const newSlot = {
      ...slotData,
      id: Date.now() + Math.random()
    }
    
    if (editingSlot) {
      setAvailability(prev => prev.map(slot => 
        slot.id === editingSlot.id ? newSlot : slot
      ))
    } else {
      setAvailability(prev => [...prev, newSlot])
    }
    
    setShowModal(false)
    setEditingSlot(null)
  }

  const handleDeleteSlot = (slotId) => {
    setAvailability(prev => prev.filter(slot => slot.id !== slotId))
  }

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      setAvailability(prev => prev.filter(slot => !selectedSlots.includes(slot.id)))
      setSelectedSlots([])
      toast.success('Selected slots deleted')
    }
  }

  const copyWeekTemplate = () => {
    const currentWeek = getCurrentWeek()
    const nextWeek = currentWeek.map(date => {
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 7)
      return nextDate
    })
    
    // Copy recurring slots to next week as one-time slots
    const newSlots = availability
      .filter(slot => slot.isRecurring)
      .flatMap(slot => {
        return slot.daysOfWeek.map(dayOfWeek => {
          const targetDate = nextWeek[dayOfWeek]
          const startDateTime = new Date(targetDate)
          const endDateTime = new Date(targetDate)
          
          const [startHour, startMin] = slot.startTime.split(':')
          const [endHour, endMin] = slot.endTime.split(':')
          
          startDateTime.setHours(parseInt(startHour), parseInt(startMin))
          endDateTime.setHours(parseInt(endHour), parseInt(endMin))
          
          return {
            id: Date.now() + Math.random(),
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            isRecurring: false,
            timezone: slot.timezone || 'UTC'
          }
        })
      })
    
    setAvailability(prev => [...prev, ...newSlots])
    toast.success('Week template copied to next week')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Availability Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set your studio's available time slots and recurring schedules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'daily' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('daily')}
          >
            Daily
          </Button>
          <Button
            variant={viewMode === 'weekly' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('weekly')}
          >
            Weekly
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Availability
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setDate(selectedDate.getDate() - (viewMode === 'weekly' ? 7 : 1))
                setSelectedDate(newDate)
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {viewMode === 'weekly' 
                  ? `Week of ${getCurrentWeek()[0].toLocaleDateString()}`
                  : selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                }
              </h3>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setDate(selectedDate.getDate() + (viewMode === 'weekly' ? 7 : 1))
                setSelectedDate(newDate)
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkMode(!bulkMode)}
            >
              {bulkMode ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
              Bulk Edit
            </Button>
            
            {viewMode === 'weekly' && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyWeekTemplate}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Week
              </Button>
            )}
            
            <Button
              onClick={handleSaveAvailability}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {bulkMode && selectedSlots.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedSlots.length} slots selected
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSlots([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <Card className="p-6 overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="font-medium text-gray-600 dark:text-gray-400 text-sm">Time</div>
              {getCurrentWeek().map((date, index) => (
                <div key={index} className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {daysOfWeek[date.getDay()]}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-1">
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-8 gap-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 py-2">
                    {time}
                  </div>
                  {getCurrentWeek().map((date, dayIndex) => {
                    const isAvailable = isSlotAvailable(date, time)
                    const slotKey = `${date.toDateString()}-${time}`
                    
                    return (
                      <motion.div
                        key={dayIndex}
                        className={`h-8 rounded cursor-pointer border-2 transition-all duration-200 ${
                          isAvailable
                            ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700'
                            : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                        } ${
                          bulkMode && selectedSlots.includes(slotKey)
                            ? 'ring-2 ring-blue-500'
                            : ''
                        }`}
                        onClick={() => {
                          if (bulkMode) {
                            setSelectedSlots(prev => 
                              prev.includes(slotKey)
                                ? prev.filter(id => id !== slotKey)
                                : [...prev, slotKey]
                            )
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isAvailable && (
                          <div className="w-full h-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Recurring Slots Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recurring Availability
          </h3>
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Add Recurring
          </Button>
        </div>
        
        <div className="space-y-3">
          {availability.filter(slot => slot.isRecurring).map(slot => (
            <div key={slot.id} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {slot.daysOfWeek?.map(day => daysOfWeek[day]).join(', ')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => (setEditingSlot(slot), setShowModal(true))}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={showModal}
        onClose={() => (setShowModal(false), setEditingSlot(null))}
        slot={editingSlot}
        onSubmit={handleAddSlot}
      />
    </div>
  )
}

const AvailabilityModal = ({ isOpen, onClose, slot, onSubmit }) => {
  const [formData, setFormData] = useState({
    isRecurring: false,
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [],
    start: '',
    end: '',
    timezone: 'UTC'
  })

  useEffect(() => {
    if (slot) {
      setFormData({
        isRecurring: slot.isRecurring || false,
        startTime: slot.startTime || '09:00',
        endTime: slot.endTime || '17:00',
        daysOfWeek: slot.daysOfWeek || [],
        start: slot.start ? new Date(slot.start).toISOString().slice(0, 16) : '',
        end: slot.end ? new Date(slot.end).toISOString().slice(0, 16) : '',
        timezone: slot.timezone || 'UTC'
      })
    } else {
      setFormData({
        isRecurring: false,
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: [],
        start: '',
        end: '',
        timezone: 'UTC'
      })
    }
  }, [slot, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const submitData = { ...formData }
    
    if (!formData.isRecurring) {
      submitData.start = new Date(formData.start).toISOString()
      submitData.end = new Date(formData.end).toISOString()
    }
    
    onSubmit(submitData)
  }

  const toggleDay = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter(d => d !== dayIndex)
        : [...prev.daysOfWeek, dayIndex]
    }))
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={slot ? 'Edit Availability' : 'Add Availability'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recurring weekly schedule
            </span>
          </label>
        </div>

        {formData.isRecurring ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days of Week
              </label>
              <div className="flex space-x-2">
                {daysOfWeek.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.daysOfWeek.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {slot ? 'Update' : 'Add'} Availability
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudioAvailabilityManager
