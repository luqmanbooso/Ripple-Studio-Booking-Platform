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
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'

const StudioServicesManager = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  
  const { data: studioData, isLoading } = useGetStudioQuery(studioId, { skip: !studioId })
  const [updateStudio, { isLoading: isSaving }] = useUpdateStudioMutation()
  
  const [services, setServices] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  const studio = studioData?.data?.studio

  useEffect(() => {
    if (studio?.services) {
      setServices(studio.services.map(s => ({ ...s, id: s._id || Date.now() })))
    }
  }, [studio])

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
      let updatedServices
      if (editingService) {
        updatedServices = services.map(s => 
          s.id === editingService.id ? { ...serviceData, id: editingService.id } : s
        )
      } else {
        updatedServices = [...services, { ...serviceData, id: Date.now() }]
      }
      
      setServices(updatedServices)
      
      await updateStudio({ 
        id: studioId, 
        services: updatedServices.map(({ id, ...service }) => service)
      }).unwrap()
      
      toast.success(editingService ? 'Service updated' : 'Service added')
      setShowModal(false)
      setEditingService(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save service')
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Delete this service?')) {
      try {
        const updatedServices = services.filter(s => s.id !== serviceId)
        setServices(updatedServices)
        
        await updateStudio({ 
          id: studioId, 
          services: updatedServices.map(({ id, ...service }) => service)
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Services & Pricing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your studio services, pricing, and packages
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'category' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('category')}
          >
            By Category
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{services.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${getAveragePrice().toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${getTotalRevenue()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {serviceCategories.filter(cat => getServicesByCategory(cat.id).length > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Services Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => (setEditingService(service), setShowModal(true))}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${service.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{service.durationMins}min</span>
                  </div>
                  {service.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{service.category}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category View */}
      {viewMode === 'category' && (
        <div className="space-y-6">
          {serviceCategories.map(category => {
            const categoryServices = getServicesByCategory(category.id)
            if (categoryServices.length === 0) return null

            const CategoryIcon = category.icon
            return (
              <Card key={category.id} className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{categoryServices.length} services</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryServices.map(service => (
                    <div key={service.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => (setEditingService(service), setShowModal(true))}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{service.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">${service.price}</span>
                        <span className="text-gray-600 dark:text-gray-400">{service.durationMins}min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

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
    category: 'recording'
  })

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        durationMins: service.durationMins || 60,
        category: service.category || 'recording'
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        durationMins: 60,
        category: 'recording'
      })
    }
  }, [service, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      durationMins: parseInt(formData.durationMins)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Edit Service' : 'Add New Service'}>
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
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {service ? 'Update' : 'Add'} Service
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudioServicesManager
