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
  AlertCircle,
  Eye,
  Settings,
  Download,
  TrendingUp,
  ArrowDownRight,
  Calendar,
  CheckSquare
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { 
  useGetAllStudiosForAdminQuery,
  useGetStudioStatsQuery,
  useCreateStudioMutation,
  useUpdateStudioMutation,
  useUpdateStudioStatusMutation,
  useToggleStudioFeatureMutation,
  useDeleteStudioMutation,
  useBulkStudioActionsMutation
} from '../../store/studioApi'

const AdminStudios = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedStudios, setSelectedStudios] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudio, setSelectedStudio] = useState(null)

  // Enhanced API hooks
  const { data: studiosData, isLoading, error: studiosError } = useGetAllStudiosForAdminQuery({ 
    page, 
    q: search, 
    status: statusFilter,
    type: typeFilter,
    limit: 10 
  })
  const { data: statsData, error: statsError } = useGetStudioStatsQuery()
  const [createStudio, { isLoading: isCreating }] = useCreateStudioMutation()
  const [updateStudio, { isLoading: isUpdating }] = useUpdateStudioMutation()
  const [updateStudioStatus] = useUpdateStudioStatusMutation()
  const [toggleStudioFeature] = useToggleStudioFeatureMutation()
  const [deleteStudioAction, { isLoading: isDeleting }] = useDeleteStudioMutation()
  const [bulkStudioActions] = useBulkStudioActionsMutation()

  const cities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 'Negombo', 'Matara']
  
  // Enhanced handlers
  const handleStatusUpdate = async (studioId, action, reason = '') => {
    try {
      let updateData = {}
      let successMessage = ''
      
      switch (action) {
        case 'approve':
          updateData = { isApproved: true, verificationStatus: 'verified' }
          successMessage = 'Studio approved successfully'
          break
        case 'reject':
          updateData = { isApproved: false, verificationStatus: 'rejected' }
          successMessage = 'Studio rejected successfully'
          break
        case 'revoke':
          updateData = { isApproved: false, verificationStatus: 'pending' }
          successMessage = 'Studio approval revoked successfully'
          break
        default:
          throw new Error('Invalid action')
      }
      
      if (reason) {
        updateData.reason = reason
      }
      
      await updateStudioStatus({ id: studioId, ...updateData }).unwrap()
      toast.success(successMessage)
    } catch (error) {
      toast.error(`Failed to ${action} studio: ${error.message}`)
    }
  }

  const handleFeatureToggle = async (studioId, feature) => {
    try {
      await toggleStudioFeature({ id: studioId, feature }).unwrap()
      toast.success(`Feature ${feature} toggled successfully`)
    } catch (error) {
      toast.error(`Failed to toggle feature`)
    }
  }

  const handleDeleteStudio = async (studioId) => {
    if (window.confirm('Are you sure you want to delete this studio? This action cannot be undone.')) {
      try {
        await deleteStudioAction(studioId).unwrap()
        toast.success('Studio deleted successfully')
      } catch (error) {
        toast.error('Failed to delete studio')
      }
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedStudios.length === 0) {
      toast.warn('Please select studios to perform bulk action')
      return
    }
    
    try {
      await bulkStudioActions({ action, studioIds: selectedStudios }).unwrap()
      toast.success(`Bulk ${action} completed successfully`)
      setSelectedStudios([])
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`)
    }
  }

  const handleStudioSelection = (studioId) => {
    setSelectedStudios(prev => 
      prev.includes(studioId) 
        ? prev.filter(id => id !== studioId)
        : [...prev, studioId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudios.length === studiosData?.data?.studios?.length) {
      setSelectedStudios([])
    } else {
      setSelectedStudios(studiosData?.data?.studios?.map(studio => studio._id) || [])
    }
  }

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
                <span>Comprehensive studio oversight & analytics</span>
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            {selectedStudios.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve ({selectedStudios.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject ({selectedStudios.length})
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Studio Overview */}
        {statsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Studios</p>
                    <p className="text-3xl font-bold text-white">{statsData.totalStudios || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/80 to-orange-800/80 border-orange-700/50 backdrop-blur-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pending Review</p>
                    <p className="text-3xl font-bold text-white">{statsData.pendingStudios || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <p className="text-xs text-orange-400 mt-2">
                  Awaiting admin approval
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/80 to-green-800/80 border-green-700/50 backdrop-blur-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Approved Studios</p>
                    <p className="text-3xl font-bold text-white">{statsData.approvedStudios || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <p className="text-xs text-green-400 mt-2">
                  Active and verified
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search studios..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                {selectedStudios.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 text-gray-300"
                    onClick={handleSelectAll}
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    {selectedStudios.length === studiosData?.data?.studios?.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Studios Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : studiosError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-2">Error loading studios</p>
              <p className="text-gray-400 text-sm">{studiosError?.data?.message || 'Something went wrong'}</p>
            </div>
          </div>
        ) : !studiosData?.data?.studios?.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-400 mb-2">No studios found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {studiosData?.data?.studios?.map((studio, index) => (
              <motion.div
                key={studio._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="relative overflow-hidden border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300">
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedStudios.includes(studio._id)}
                      onChange={() => handleStudioSelection(studio._id)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      studio.isApproved
                        ? 'bg-green-500/20 text-green-400'
                        : studio.verificationStatus === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {studio.isApproved 
                        ? 'Approved' 
                        : studio.verificationStatus === 'rejected' 
                        ? 'Rejected' 
                        : 'Pending'}
                    </div>
                    {studio.features?.featured && (
                      <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-6 pt-12">
                    {/* Studio Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                          {studio.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-yellow-400">{studio.averageRating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {studio.description || 'No description available'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{studio.location?.city || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{studio.capacity || 'N/A'} people</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>${studio.hourlyRate || 0}/hr</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{studio.totalBookings || 0} bookings</span>
                        </div>
                      </div>
                    </div>

                    {/* Studio Type & Features */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {studio.studioType || 'General'}
                        </span>
                        {studio.features?.verified && (
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            Verified
                          </span>
                        )}
                        {studio.features?.premium && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Owner</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{studio.user?.name}</p>
                          <p className="text-xs text-gray-400">{studio.user?.email}</p>
                        </div>
                        <div className="flex items-center">
                          {studio.user?.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-700/50">
                      {/* Status Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {!studio.isApproved && studio.verificationStatus !== 'rejected' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(studio._id, 'approved')}
                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50 px-3"
                                title="Approve Studio"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(studio._id, 'rejected', 'Quality standards not met')}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 px-3"
                                title="Reject Studio"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {studio.isApproved && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(studio._id, 'rejected', 'Re-review required')}
                              className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/50 px-3"
                              title="Revoke Approval"
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeatureToggle(studio._id, 'featured')}
                            className={studio.features?.featured 
                              ? "border-purple-500/50 text-purple-400" 
                              : "border-slate-600 text-gray-400"
                            }
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudio(studio._id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-800/30 rounded p-2">
                          <p className="text-xs text-gray-400">Revenue</p>
                          <p className="text-sm font-bold text-white">${studio.totalRevenue || 0}</p>
                        </div>
                        <div className="bg-slate-800/30 rounded p-2">
                          <p className="text-xs text-gray-400">Reviews</p>
                          <p className="text-sm font-bold text-white">{studio.reviewCount || 0}</p>
                        </div>
                        <div className="bg-slate-800/30 rounded p-2">
                          <p className="text-xs text-gray-400">Utilization</p>
                          <p className="text-sm font-bold text-white">{studio.utilizationRate || 0}%</p>
                        </div>
                      </div>
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