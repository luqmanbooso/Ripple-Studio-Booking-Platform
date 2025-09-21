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
  CheckSquare,
  MoreHorizontal
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
  const [openActionMenu, setOpenActionMenu] = useState(null)

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
  
  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenu && !event.target.closest('.relative')) {
        setOpenActionMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu])
  
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

  const handleEditStudio = (studio) => {
    setSelectedStudio(studio)
    setIsEditModalOpen(true)
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

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Studios</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statsData?.totalStudios || studiosData?.data?.studios?.length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">
                    {statsData?.pendingStudios || studiosData?.data?.studios?.filter(s => !s.isApproved && s.verificationStatus !== 'rejected').length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Approved</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {statsData?.approvedStudios || studiosData?.data?.studios?.filter(s => s.isApproved).length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Active Studios</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">
                    {statsData?.activeStudios || studiosData?.data?.studios?.filter(s => s.isApproved && s.isActive).length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by studio name, owner, or location..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative min-w-[140px]">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer text-sm"
                    >
                      <option value="all" className="bg-slate-800 text-white">All Status</option>
                      <option value="approved" className="bg-slate-800 text-white">✓ Approved</option>
                      <option value="pending" className="bg-slate-800 text-white">⏳ Pending</option>
                      <option value="rejected" className="bg-slate-800 text-white">✗ Rejected</option>
                    </select>
                  </div>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-4 py-2.5 text-sm font-medium"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Studio
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

        {/* Studios List */}
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
              <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">No studios found</p>
              <p className="text-gray-500 text-sm">Studios will appear here when they register</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-slate-800/50 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
              {/* Table Header */}
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
                <div className="grid grid-cols-12 gap-6 text-sm font-medium text-gray-300">
                  <div className="col-span-3">Studio & Owner</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-2">Rating</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-slate-700/50">
                {studiosData?.data?.studios?.map((studio, index) => (
                  <motion.div
                    key={studio._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="px-6 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => handleStudioClick(studio)}
                  >
                    <div className="grid grid-cols-12 gap-6 items-center">
                      {/* Studio & Owner */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                            <Building2 className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{studio.name}</h4>
                              {studio.features?.featured && (
                                <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-xs font-medium">
                                  ✨
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{studio.user?.name || 'Unknown Owner'}</p>
                            <p className="text-xs text-gray-500">ID: {studio._id?.slice(-8) || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-white">{studio.location?.city || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{studio.location?.state || ''}</p>
                          </div>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-white">{new Date(studio.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400">Registered</p>
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          {studio.averageRating ? (
                            <>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <div>
                                <p className="text-sm text-white">{studio.averageRating.toFixed(1)}</p>
                                <p className="text-xs text-gray-400">Rating</p>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <Star className="w-4 h-4 mr-2" />
                              <span className="text-sm">No ratings</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          studio.isApproved
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : studio.verificationStatus === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {studio.isApproved 
                            ? '✓ Approved' 
                            : studio.verificationStatus === 'rejected' 
                            ? '✗ Rejected' 
                            : '⏳ Pending'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center justify-end">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white w-8 h-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenu(openActionMenu === studio._id ? null : studio._id);
                              }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                            
                            {/* Action Dropdown Menu */}
                            {openActionMenu === studio._id && (
                              <div className="absolute right-0 top-8 mt-1 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl z-50">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStudioClick(studio);
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditStudio(studio);
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-blue-300 hover:bg-slate-700/50 hover:text-blue-200 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Studio
                                  </button>
                                  
                                  <div className="border-t border-slate-700/50 my-1"></div>
                                  
                                  {!studio.isApproved && studio.verificationStatus !== 'rejected' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(studio._id, 'approve');
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-green-300 hover:bg-slate-700/50 hover:text-green-200 flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Approve Studio
                                    </button>
                                  )}
                                  
                                  {!studio.isApproved && studio.verificationStatus !== 'rejected' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(studio._id, 'reject', 'Quality standards not met');
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-yellow-300 hover:bg-slate-700/50 hover:text-yellow-200 flex items-center gap-2"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject Studio
                                    </button>
                                  )}
                                  
                                  {studio.isApproved && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(studio._id, 'revoke', 'Re-review required');
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-orange-300 hover:bg-slate-700/50 hover:text-orange-200 flex items-center gap-2"
                                    >
                                      <AlertCircle className="w-4 h-4" />
                                      Revoke Approval
                                    </button>
                                  )}
                                  
                                  <div className="border-t border-slate-700/50 my-1"></div>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteStudio(studio._id);
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-slate-700/50 hover:text-red-200 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Studio
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
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
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{studio.name}</h2>
          <p className="text-gray-400 text-xs">Studio Information</p>
        </div>
      </div>
    }>
      <div className="space-y-4">
        {/* Studio Header Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <label className="text-xs font-medium text-blue-200">Studio Owner</label>
              </div>
              <p className="text-sm font-medium text-white bg-white/10 backdrop-blur p-3 rounded-lg border border-white/10">
                {studio.user?.name || 'Unknown Owner'}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <label className="text-xs font-medium text-green-200">Location</label>
              </div>
              <p className="text-sm font-medium text-white bg-white/10 backdrop-blur p-3 rounded-lg border border-white/10">
                {studio.location?.city || 'N/A'}, {studio.location?.country || 'N/A'}
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Status and Rating Section */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                studio.isApproved ? 'bg-green-400' : studio.verificationStatus === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <label className="text-xs font-medium text-gray-200">Studio Status</label>
            </div>
            <div className={`p-3 rounded-xl text-center text-sm font-medium backdrop-blur border ${
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
          </motion.div>
          
          {studio.averageRating && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <label className="text-xs font-medium text-yellow-200">Studio Rating</label>
              </div>
              <div className="bg-white/10 backdrop-blur p-3 rounded-xl border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold text-white">{studio.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">/ 5</span>
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
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded" />
              <label className="text-xs font-medium text-purple-200">Description</label>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
              <p className="text-white text-sm leading-relaxed">{studio.description}</p>
            </div>
          </motion.div>
        )}

        {/* Additional Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-indigo-400" />
            <label className="text-xs font-medium text-indigo-200">Created</label>
          </div>
          <div className="bg-white/10 backdrop-blur p-3 rounded-xl border border-white/10">
            <p className="text-white text-sm font-medium">
              {new Date(studio.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
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
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <span className="text-purple-300 font-semibold text-sm">Featured Studio</span>
              <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🌟</span>
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
      country: 'Sri Lanka', // Default country
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
          country: studio.location?.country || 'Sri Lanka',
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
        location: { 
          country: 'Sri Lanka',
          city: '', 
          address: '' 
        },
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
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Studio Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Studio Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder="Enter studio name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    Owner Email *
                  </span>
                </label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors disabled:opacity-50"
                  placeholder="owner@example.com"
                  required
                  disabled={!!studio} // Disable when editing
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-purple-400" />
                  Description
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors resize-none"
                placeholder="Describe the studio features and atmosphere..."
                rows="3"
              />
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-medium text-white">Location Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  value={formData.location.country}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, country: e.target.value }
                  }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                  required
                >
                  <option value="Sri Lanka" className="bg-slate-800">Sri Lanka</option>
                  <option value="India" className="bg-slate-800">India</option>
                  <option value="Singapore" className="bg-slate-800">Singapore</option>
                  <option value="Malaysia" className="bg-slate-800">Malaysia</option>
                </select>
              </div>

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
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                  required
                >
                  <option value="" className="bg-slate-800">Select City</option>
                  {cities?.map(city => (
                    <option key={city} value={city} className="bg-slate-800">{city}</option>
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
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                  placeholder="Street address"
                />
              </div>
            </div>
          </div>

          {/* Studio Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-medium text-white">Studio Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    Hourly Rate ($)
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-colors"
                  placeholder="100"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    Capacity (people)
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                  placeholder="10"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Equipment Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-medium text-white">Equipment & Amenities</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipment
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Add equipment (e.g., Microphone, Piano, Drums)..."
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
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
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20 px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full text-sm border border-orange-500/30"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="ml-2 text-orange-300 hover:text-red-400 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600/50 text-gray-300 hover:bg-slate-800/50 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{studio ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {studio ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{studio ? 'Update Studio' : 'Create Studio'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
    </Modal>
  )
}

export default AdminStudios