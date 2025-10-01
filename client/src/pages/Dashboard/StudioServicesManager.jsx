import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit, Trash2, Save, X, Clock, DollarSign, 
  Music, Mic, Camera, Headphones, Settings, Star,
  TrendingUp, Users, Calendar, BarChart3
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { 
  useGetStudioServicesQuery, 
  useAddServiceMutation, 
  useUpdateServiceMutation, 
  useDeleteServiceMutation 
} from '../../store/serviceApi'

const StudioServicesManager = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  
  const { data: servicesData, isLoading } = useGetStudioServicesQuery(studioId, { skip: !studioId })
  const [addService, { isLoading: isAdding }] = useAddServiceMutation()
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation()
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation()
  
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  const services = servicesData?.data || []

  const serviceCategories = [
    { id: 'recording', name: 'Recording Sessions', icon: Mic, color: 'bg-red-500', 
      description: 'Studio time for recording vocals, instruments, or full bands',
      examples: ['Vocal Recording', 'Band Recording', 'Overdub Session', 'Live Recording'] },
    { id: 'mixing', name: 'Mixing Services', icon: Settings, color: 'bg-blue-500',
      description: 'Professional mixing of recorded tracks',
      examples: ['Song Mix', 'Album Mix', 'Stem Mix', 'Radio Edit'] },
    { id: 'mastering', name: 'Mastering Services', icon: Star, color: 'bg-purple-500',
      description: 'Final polish and preparation for distribution',
      examples: ['Single Master', 'Album Master', 'Vinyl Master', 'Streaming Master'] },
    { id: 'production', name: 'Music Production', icon: Music, color: 'bg-green-500',
      description: 'Full production services from concept to completion',
      examples: ['Beat Making', 'Song Production', 'Arrangement', 'Pre-Production'] },
    { id: 'video', name: 'Video Production', icon: Camera, color: 'bg-orange-500',
      description: 'Music video and visual content creation',
      examples: ['Music Video', 'Live Session Video', 'Behind the Scenes', 'Lyric Video'] },
    { id: 'consultation', name: 'Consultation', icon: Headphones, color: 'bg-gray-500',
      description: 'Professional advice and guidance',
      examples: ['Career Consultation', 'Technical Consultation', 'Project Review', 'Equipment Advice'] }
  ]

  const handleSaveService = async (serviceData) => {
    try {
      if (editingService) {
        await updateService({ 
          studioId, 
          serviceId: editingService._id, 
          ...serviceData 
        }).unwrap()
        toast.success('Service updated')
      } else {
        await addService({ 
          studioId, 
          ...serviceData 
        }).unwrap()
        toast.success('Service added')
      }
      
      setShowModal(false)
      setEditingService(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save service')
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Delete this service?')) {
      try {
        await deleteService({ 
          studioId, 
          serviceId 
        }).unwrap()
        
        toast.success('Service deleted')
      } catch (error) {
        toast.error('Failed to delete service')
      }
    }
  }

  const getServicesByCategory = (categoryId) => {
    return services.filter(service => service.category === categoryId)
  }

  const getTotalRevenue = () => {
    return services.reduce((total, service) => total + (service.price || 0), 0)
  }

  const getAveragePrice = () => {
    if (services.length === 0) return 0
    return getTotalRevenue() / services.length
  }

  const getBookableServices = () => {
    return services.filter(service => service.isBookable !== false).length
  }

  const getAverageDuration = () => {
    if (services.length === 0) return 0
    return services.reduce((total, service) => total + (service.durationMins || 0), 0) / services.length
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Studio Services</h1>
            <p className="text-blue-100">
              Create and manage your bookable services with professional pricing
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Service
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Services</p>
              <p className="text-2xl font-bold">{getBookableServices()}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Avg Price</p>
              <p className="text-2xl font-bold">${getAveragePrice().toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Duration</p>
              <p className="text-2xl font-bold">{Math.round(getAverageDuration())}min</p>
            </div>
            <Clock className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Revenue Potential</p>
              <p className="text-2xl font-bold">${getTotalRevenue()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Services</h2>
          {services.length > 0 && (
            <p className="text-sm text-gray-500">{services.length} service{services.length !== 1 ? 's' : ''} total</p>
          )}
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services yet</h3>
            <p className="text-gray-500 mb-6">Create your first service to start accepting bookings</p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Service
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map(service => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.isBookable !== false 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {service.isBookable !== false ? '✓ Bookable' : '✗ Unavailable'}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium capitalize">
                        {service.category}
                      </span>
                    </div>
                    
                    {service.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">${service.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{service.durationMins}min</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-500">Advance Booking</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {service.advanceBookingHours ? `${service.advanceBookingHours}h` : 'Same day'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">Max/Day</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {service.maxBookingsPerDay || 'Unlimited'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => (setEditingService(service), setShowModal(true))}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteService(service._id)}
                      className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>


      {/* Service Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={() => (setShowModal(false), setEditingService(null))}
        service={editingService}
        onSubmit={handleSaveService}
        categories={serviceCategories}
      />
    </div>
  )
}

const ServiceModal = ({ isOpen, onClose, service, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationMins: 60,
    category: 'recording',
    isBookable: true,
    advanceBookingHours: '',
    maxBookingsPerDay: '',
    requiredEquipment: [],
    cancellationPolicy: '',
    preparationTime: 15
  })

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name ?? '',
        description: service.description ?? '',
        price: service.price?.toString() ?? '',
        durationMins: service.durationMins ?? 60,
        category: service.category ?? 'recording',
        isBookable: service.isBookable ?? true,
        advanceBookingHours: service.advanceBookingHours?.toString() ?? '',
        maxBookingsPerDay: service.maxBookingsPerDay?.toString() ?? '',
        requiredEquipment: service.requiredEquipment ?? [],
        cancellationPolicy: service.cancellationPolicy ?? '',
        preparationTime: service.preparationTime ?? 15
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        durationMins: 60,
        category: 'recording',
        isBookable: true,
        advanceBookingHours: '',
        maxBookingsPerDay: '',
        requiredEquipment: [],
        cancellationPolicy: '',
        preparationTime: 15
      })
    }
  }, [service, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      durationMins: parseInt(formData.durationMins),
      advanceBookingHours: formData.advanceBookingHours ? parseInt(formData.advanceBookingHours) : null,
      maxBookingsPerDay: formData.maxBookingsPerDay ? parseInt(formData.maxBookingsPerDay) : null,
      preparationTime: parseInt(formData.preparationTime)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Edit Bookable Service' : 'Add Bookable Service'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.durationMins}
              onChange={(e) => setFormData(prev => ({ ...prev, durationMins: e.target.value }))}
              required
              min="30"
              step="15"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            placeholder="Brief description of the service..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Booking Settings */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Booking Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Advance Notice (hours)
              </label>
              <input
                type="number"
                value={formData.advanceBookingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, advanceBookingHours: e.target.value }))}
                min="0"
                placeholder="24"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">How far in advance must clients book?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily Limit
              </label>
              <input
                type="number"
                value={formData.maxBookingsPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, maxBookingsPerDay: e.target.value }))}
                min="1"
                placeholder="5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Max bookings per day (optional)</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {service ? 'Update' : 'Add'} Bookable Service
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudioServicesManager
