import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { 
  useGetStudiosQuery,
  useCreateStudioMutation,
  useUpdateStudioMutation,
  useDeleteStudioMutation,
  useToggleStudioStatusMutation
} from '../../store/adminApi'

const AdminStudios = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudio, setSelectedStudio] = useState(null)

  // API hooks
  const { data: studiosData, isLoading } = useGetStudiosQuery({ 
    page, 
    search, 
    city: selectedCity,
    limit: 10 
  })
  const [createStudio, { isLoading: isCreating }] = useCreateStudioMutation()
  const [updateStudio, { isLoading: isUpdating }] = useUpdateStudioMutation()
  const [deleteStudio, { isLoading: isDeleting }] = useDeleteStudioMutation()
  const [toggleStudioStatus] = useToggleStudioStatusMutation()

  const cities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 'Negombo', 'Matara']
  
  const handleCreateStudio = async (studioData) => {
    try {
      await createStudio(studioData).unwrap()
      toast.success('Studio created successfully!')
      setIsCreateModalOpen(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create studio')
    }
  }

  const handleUpdateStudio = async (studioData) => {
    try {
      await updateStudio({ id: selectedStudio._id, ...studioData }).unwrap()
      toast.success('Studio updated successfully!')
      setIsEditModalOpen(false)
      setSelectedStudio(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update studio')
    }
  }

  const handleDeleteStudio = async (studioId, studioName) => {
    if (window.confirm(`Are you sure you want to delete "${studioName}"? This action cannot be undone.`)) {
      try {
        await deleteStudio(studioId).unwrap()
        toast.success('Studio deleted successfully!')
      } catch (error) {
        toast.error(error.data?.message || 'Failed to delete studio')
      }
    }
  }

  const handleToggleStatus = async (studioId, currentStatus) => {
    try {
      await toggleStudioStatus({ id: studioId, isActive: !currentStatus }).unwrap()
      toast.success(`Studio ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update studio status')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                Studio Management
              </h1>
              <p className="text-gray-400 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Manage recording studios and availability</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Studio
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search studios by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>
              
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field min-w-[150px]"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              
              <Button variant="outline" size="sm" className="border-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Studios Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {studiosData?.data?.studios?.map((studio, index) => (
              <motion.div
                key={studio._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="relative overflow-hidden border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full ${
                      studio.user?.isActive !== false ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                    } animate-pulse`} />
                  </div>

                  <div className="p-6">
                    {/* Studio Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {studio.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {studio.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{studio.location?.city}, Sri Lanka</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Capacity: {studio.capacity || 'Not specified'}</span>
                      </div>

                      <div className="flex items-center text-gray-400 text-sm">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>Rate: ${studio.hourlyRate || 0}/hour</span>
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Owner</p>
                      <p className="text-sm font-medium text-white">{studio.user?.name}</p>
                      <p className="text-xs text-gray-400">{studio.user?.email}</p>
                      <div className="flex items-center mt-1">
                        {studio.user?.verified ? (
                          <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400 mr-1" />
                        )}
                        <span className="text-xs text-gray-400">
                          {studio.user?.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>

                    {/* Equipment */}
                    {studio.equipment && studio.equipment.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Equipment</p>
                        <div className="flex flex-wrap gap-1">
                          {studio.equipment.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                              {item}
                            </span>
                          ))}
                          {studio.equipment.length > 3 && (
                            <span className="text-xs text-gray-400">+{studio.equipment.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudio(studio)
                            setIsEditModalOpen(true)
                          }}
                          className="border-slate-600 hover:border-blue-500 hover:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudio(studio._id, studio.name)}
                          className="border-slate-600 hover:border-red-500 hover:text-red-400"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(studio._id, studio.user?.isActive !== false)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          studio.user?.isActive !== false
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {studio.user?.isActive !== false ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        <span>{studio.user?.isActive !== false ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {studiosData?.data?.pagination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="border-slate-700"
              >
                Previous
              </Button>
              
              <span className="text-gray-400 px-4">
                Page {page} of {studiosData.data.pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= studiosData.data.pagination.pages}
                className="border-slate-700"
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Create Studio Modal */}
        <StudioFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateStudio}
          isLoading={isCreating}
          title="Create New Studio"
          cities={cities}
        />

        {/* Edit Studio Modal */}
        <StudioFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedStudio(null)
          }}
          onSubmit={handleUpdateStudio}
          isLoading={isUpdating}
          title="Edit Studio"
          studio={selectedStudio}
          cities={cities}
        />
      </div>
    </div>
  )
}

// Studio Form Modal Component
const StudioFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  title, 
  studio = null, 
  cities 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ownerEmail: '',
    location: {
      city: '',
      address: ''
    },
    hourlyRate: 100,
    capacity: 10,
    equipment: [],
    amenities: [],
    services: []
  })

  // Initialize form with studio data when editing
  React.useEffect(() => {
    if (studio) {
      setFormData({
        name: studio.name || '',
        description: studio.description || '',
        ownerEmail: studio.user?.email || '',
        location: {
          city: studio.location?.city || '',
          address: studio.location?.address || ''
        },
        hourlyRate: studio.hourlyRate || 100,
        capacity: studio.capacity || 10,
        equipment: studio.equipment || [],
        amenities: studio.amenities || [],
        services: studio.services || []
      })
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        ownerEmail: '',
        location: { city: '', address: '' },
        hourlyRate: 100,
        capacity: 10,
        equipment: [],
        amenities: [],
        services: []
      })
    }
  }, [studio, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addEquipment = (equipment) => {
    if (equipment.trim() && !formData.equipment.includes(equipment.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipment.trim()]
      }))
    }
  }

  const removeEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Studio Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Owner Email *
            </label>
            <input
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
              className="input-field w-full"
              required
              disabled={!!studio} // Disable when editing
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="input-field w-full h-24 resize-none"
            placeholder="Describe the studio..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City *
            </label>
            <select
              value={formData.location.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, city: e.target.value }
              }))}
              className="input-field w-full"
              required
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, address: e.target.value }
              }))}
              className="input-field w-full"
              placeholder="Street address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
              className="input-field w-full"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capacity (people)
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              className="input-field w-full"
              min="1"
            />
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Equipment
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="Add equipment..."
              className="input-field flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addEquipment(e.target.value)
                  e.target.value = ''
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                const input = e.target.closest('.flex').querySelector('input')
                addEquipment(input.value)
                input.value = ''
              }}
              className="border-slate-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.equipment.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeEquipment(index)}
                  className="ml-2 text-blue-300 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              studio ? 'Update Studio' : 'Create Studio'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminStudios