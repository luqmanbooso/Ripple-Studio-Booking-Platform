import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Edit, Trash2, DollarSign, Clock, 
  BarChart3, TrendingUp, Settings, Star, Grid, List
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { 
  useGetStudioServicesQuery, 
  useGetServiceStatsQuery,
  useAddServiceMutation, 
  useUpdateServiceMutation, 
  useDeleteServiceMutation 
} from '../../store/serviceApi'

const StudioServiceManager = () => {
  const { user } = useSelector(state => state.auth)
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [search, setSearch] = useState('')

  const studioId = user?.studio?._id || user?.studio
  
  const { data: servicesData, isLoading } = useGetStudioServicesQuery({
    studioId
  }, { skip: !studioId })
  
  const { data: statsData } = useGetServiceStatsQuery({
    studioId
  }, { skip: !studioId })

  const [addService] = useAddServiceMutation()
  const [updateService] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation()

  const services = servicesData?.data || []
  const stats = statsData?.data || {}

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddService = async (serviceData) => {
    try {
      await addService({ studioId, ...serviceData }).unwrap()
      toast.success('Service added successfully')
      setShowModal(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to add service')
    }
  }

  const handleUpdateService = async (serviceData) => {
    try {
      await updateService({ 
        studioId, 
        serviceId: selectedService._id, 
        ...serviceData 
      }).unwrap()
      toast.success('Service updated successfully')
      setShowModal(false)
      setSelectedService(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update service')
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    
    try {
      await deleteService({ studioId, serviceId }).unwrap()
      toast.success('Service deleted successfully')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete service')
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your studio services and pricing
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Services
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalServices || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Price
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.averagePrice?.toFixed(0) || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Duration
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(stats.averageDuration || 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Price Range
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.priceRange?.min || 0} - ${stats.priceRange?.max || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Services Display */}
      {filteredServices.length === 0 ? (
        <Card className="p-12 text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {search ? 'No services found' : 'No services yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {search 
              ? 'Try adjusting your search terms'
              : 'Add your first service to start accepting bookings'
            }
          </p>
          {!search && (
            <Button onClick={() => setShowModal(true)} className="mx-auto">
              Add Your First Service
            </Button>
          )}
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          <AnimatePresence>
            {filteredServices.map((service) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow'
                    : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow'
                }
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedService(service)
                              setShowModal(true)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {service.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">${service.price}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{formatDuration(service.durationMins)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">${service.price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{formatDuration(service.durationMins)}</span>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => {
                          setSelectedService(service)
                          setShowModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedService(null)
        }}
        service={selectedService}
        onSubmit={selectedService ? handleUpdateService : handleAddService}
      />
    </div>
  )
}

const ServiceModal = ({ isOpen, onClose, service, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMins: '60',
    description: ''
  })

  React.useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        price: service.price?.toString() || '',
        durationMins: service.durationMins?.toString() || '60',
        description: service.description || ''
      })
    } else {
      setFormData({
        name: '',
        price: '',
        durationMins: '60',
        description: ''
      })
    }
  }, [service, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price || !formData.durationMins) {
      toast.error('Please fill in all required fields')
      return
    }

    const submitData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      durationMins: parseInt(formData.durationMins),
      description: formData.description.trim()
    }

    onSubmit(submitData)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={service ? 'Edit Service' : 'Add Service'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Recording Session"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="150.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              min="30"
              step="30"
              value={formData.durationMins}
              onChange={(e) => setFormData({ ...formData, durationMins: e.target.value })}
              placeholder="60"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what's included in this service..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            {service ? 'Update Service' : 'Add Service'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudioServiceManager
