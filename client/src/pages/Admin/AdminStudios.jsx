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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
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

  const handleStudioClick = (studio) => {
    // Show studio details in read-only modal
    setSelectedStudio(studio)
    setIsDetailsModalOpen(true)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-3 lg:space-y-0"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Studio Management
                </h1>
                <p className="text-gray-400 flex items-center space-x-2 text-sm">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Studio oversight & analytics</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl">
                <span className="text-blue-300 text-sm font-semibold">
                  {studiosData?.data?.studios?.length || 0} Studios
                </span>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 px-3 py-2 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-xs font-medium">Online</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Compact Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            {/* Total Studios Card */}
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="group"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Total Studios</p>
                      <p className="text-2xl font-bold text-white">
                        {statsData?.totalStudios || studiosData?.data?.studios?.length || 0}
                      </p>
                      <p className="text-xs text-blue-400">+12% this month</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Pending Review Card */}
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.05 }}
              className="group"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-yellow-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Pending Review</p>
                      <p className="text-2xl font-bold text-white">
                        {statsData?.pendingStudios || studiosData?.data?.studios?.filter(s => !s.isApproved && s.verificationStatus !== 'rejected').length || 0}
                      </p>
                      <p className="text-xs text-yellow-400">Needs attention</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-yellow-500/20">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Approved Studios Card */}
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
              className="group"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Approved Studios</p>
                      <p className="text-2xl font-bold text-white">
                        {statsData?.approvedStudios || studiosData?.data?.studios?.filter(s => s.isApproved).length || 0}
                      </p>
                      <p className="text-xs text-green-400">Active & verified</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-green-500/20">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Compact Search & Actions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Compact Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search studios, owners..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 backdrop-blur border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm"
                      />
                    </div>
                    
                    {/* Compact Status Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-white/5 backdrop-blur border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[140px] appearance-none cursor-pointer transition-all duration-200 text-sm"
                      >
                        <option value="all" className="bg-slate-800 text-white">All Status</option>
                        <option value="approved" className="bg-slate-800 text-white">✓ Approved</option>
                        <option value="pending" className="bg-slate-800 text-white">⏳ Pending</option>
                        <option value="rejected" className="bg-slate-800 text-white">✗ Rejected</option>
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Compact Create Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Studio
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>        {/* Studios List */}
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
            className="space-y-2"
          >
            {studiosData?.data?.studios?.map((studio, index) => (
              <motion.div
                key={studio._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                      onClick={() => handleStudioClick(studio)}>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Compact Studio Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                            <Building2 className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors duration-200 truncate">
                                {studio.name}
                              </h3>
                              {studio.features?.featured && (
                                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium">
                                  ✨
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs">Created {new Date(studio.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {/* Compact Info Row */}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="truncate">{studio.location?.city || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="truncate">{studio.user?.name || 'Unknown'}</span>
                          </div>
                          {studio.averageRating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-yellow-400">{studio.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-3 ml-4">
                        {/* Status Badge */}
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
                          studio.isApproved
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : studio.verificationStatus === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        }`}>
                          {studio.isApproved 
                            ? '✓ Approved' 
                            : studio.verificationStatus === 'rejected' 
                            ? '✗ Rejected' 
                            : '⏳ Pending'}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {!studio.isApproved && studio.verificationStatus !== 'rejected' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(studio._id, 'approve');
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(studio._id, 'reject', 'Quality standards not met');
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                Reject
                              </Button>
                            </>
                          ) : studio.isApproved ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(studio._id, 'revoke', 'Re-review required');
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                            >
                              <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                              Revoke
                            </Button>
                          ) : null}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStudio(studio._id);
                            }}
                            className="border border-red-500/50 text-red-400 hover:bg-red-500/20 w-8 h-8 p-0 rounded-lg"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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
            className="flex justify-center mt-4"
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

        {/* Studio Details Modal */}
        <StudioDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedStudio(null)
          }}
          studio={selectedStudio}
        />
        </div>
      </div>
    </div>
  )
}

// Modern Studio Details Modal Component
const StudioDetailsModal = ({ isOpen, onClose, studio }) => {
  if (!studio) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/10">
          <Building2 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{studio.name}</h2>
          <p className="text-gray-400 text-sm">Studio Information</p>
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Studio Header Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <label className="text-sm font-semibold text-blue-200">Studio Owner</label>
              </div>
              <p className="text-lg font-medium text-white bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10">
                {studio.user?.name || 'Unknown Owner'}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-400" />
                <label className="text-sm font-semibold text-green-200">Location</label>
              </div>
              <p className="text-lg font-medium text-white bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10">
                {studio.location?.city || 'N/A'}, {studio.location?.country || 'N/A'}
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Status and Rating Section */}
        <div className="grid grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full ${
                studio.isApproved ? 'bg-green-400' : studio.verificationStatus === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <label className="text-sm font-semibold text-gray-200">Studio Status</label>
            </div>
            <div className={`p-4 rounded-2xl text-center font-semibold backdrop-blur border shadow-lg ${
              studio.isApproved
                ? 'bg-green-500/20 text-green-300 border-green-500/30 shadow-green-500/20'
                : studio.verificationStatus === 'rejected'
                ? 'bg-red-500/20 text-red-300 border-red-500/30 shadow-red-500/20'
                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-yellow-500/20'
            }`}>
              {studio.isApproved 
                ? '✓ Approved & Active' 
                : studio.verificationStatus === 'rejected' 
                ? '✗ Rejected' 
                : '⏳ Pending Review'}
            </div>
          </motion.div>
          
          {studio.averageRating && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <label className="text-sm font-semibold text-yellow-200">Studio Rating</label>
              </div>
              <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-white">{studio.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">/ 5.0</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Description Section */}
        {studio.description && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded" />
              <label className="text-sm font-semibold text-purple-200">Description</label>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
              <p className="text-white leading-relaxed">{studio.description}</p>
            </div>
          </motion.div>
        )}

        {/* Additional Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <label className="text-sm font-semibold text-indigo-200">Created</label>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
            <p className="text-white font-medium">
              {new Date(studio.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </motion.div>

        {/* Featured Badge */}
        {studio.features?.featured && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <span className="text-purple-300 font-bold text-lg">Featured Studio</span>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🌟</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
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