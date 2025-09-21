import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users,
  Search,
  Filter,
  Eye,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Trash2,
  MoreHorizontal,
  Zap,
  Crown,
  Star,
  Building2,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { 
  useGetUsersQuery, 
  useGetUserStatsQuery,
  useUpdateUserRoleMutation,
  useVerifyUserMutation,
  useUnverifyUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useBulkUserActionsMutation
} from '../../store/adminApi'
import { toast } from 'react-hot-toast'

const AdminUsers = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [blockReason, setBlockReason] = useState('')

  // API hooks
  const { data: usersData, isLoading, error } = useGetUsersQuery({ 
    page,
    search,
    role: roleFilter,
    status: statusFilter,
    limit: 15 
  })
  
  const { data: userStats } = useGetUserStatsQuery()
  
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation()
  const [verifyUser, { isLoading: isVerifying }] = useVerifyUserMutation()
  const [unverifyUser, { isLoading: isUnverifying }] = useUnverifyUserMutation()
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation()
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation()
  const [toggleUserStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()
  const [bulkUserActions, { isLoading: isBulkActing }] = useBulkUserActionsMutation()

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'artist', label: 'Artist' },
    { value: 'studio_owner', label: 'Studio Owner' },
    { value: 'admin', label: 'Admin' }
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'unverified', label: 'Unverified' }
  ]

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-purple-400" />
      case 'studio_owner': return <Building2 className="w-4 h-4 text-blue-400" />
      case 'artist': return <Star className="w-4 h-4 text-yellow-400" />
      default: return <UserCheck className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'studio_owner': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'artist': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getUserStatus = (user) => {
    if (user.isBlocked) return 'blocked'
    if (!user.isActive) return 'inactive'
    if (!user.verified) return 'unverified'
    return 'active'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'blocked': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'inactive': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'unverified': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'blocked': return <Ban className="w-3 h-3" />
      case 'inactive': return <XCircle className="w-3 h-3" />
      case 'unverified': return <AlertTriangle className="w-3 h-3" />
      default: return <XCircle className="w-3 h-3" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setIsRoleModalOpen(true)
  }

  const handleRoleUpdate = async (newRole) => {
    if (!selectedUser) return
    
    try {
      await updateUserRole({ id: selectedUser._id, role: newRole }).unwrap()
      toast.success('User role updated successfully')
      setIsRoleModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update user role')
    }
  }

  const handleVerifyUser = async (userId) => {
    try {
      await verifyUser(userId).unwrap()
      toast.success('User verified successfully')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to verify user')
    }
  }

  const handleUnverifyUser = async (userId) => {
    try {
      await unverifyUser(userId).unwrap()
      toast.success('User unverified successfully')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to unverify user')
    }
  }

  const handleBlockUser = async () => {
    if (!selectedUser) return
    
    try {
      await blockUser({ id: selectedUser._id, reason: blockReason }).unwrap()
      toast.success('User blocked successfully')
      setIsBlockModalOpen(false)
      setSelectedUser(null)
      setBlockReason('')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to block user')
    }
  }

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId).unwrap()
      toast.success('User unblocked successfully')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to unblock user')
    }
  }

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await toggleUserStatus({ id: userId, isActive }).unwrap()
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update user status')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      await deleteUser(selectedUser._id).unwrap()
      toast.success('User deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete user')
    }
  }

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) return
    
    try {
      await bulkUserActions({ 
        userIds: selectedUsers, 
        action: bulkAction,
        reason: bulkAction === 'block' ? blockReason : undefined
      }).unwrap()
      toast.success(`Bulk ${bulkAction} completed successfully`)
      setIsBulkActionModalOpen(false)
      setSelectedUsers([])
      setBulkAction('')
      setBlockReason('')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to perform bulk action')
    }
  }

  const openBlockModal = (user) => {
    setSelectedUser(user)
    setIsBlockModalOpen(true)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const openBulkActionModal = (action) => {
    setBulkAction(action)
    setIsBulkActionModalOpen(true)
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    const allUserIds = usersData?.data?.users?.map(user => user._id) || []
    setSelectedUsers(selectedUsers.length === allUserIds.length ? [] : allUserIds)
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-3 lg:space-y-0"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-400 flex items-center space-x-2 text-sm">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Manage users, roles & permissions</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-400">{selectedUsers.length} selected</span>
                  <Button
                    size="sm"
                    onClick={() => openBulkActionModal('verify')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openBulkActionModal('block')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                  >
                    <Ban className="w-3 h-3 mr-1" />
                    Block
                  </Button>
                </div>
              )}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl">
                <span className="text-xs text-gray-400">Total Users</span>
                <div className="font-semibold text-white">{userStats?.data?.total || usersData?.data?.pagination?.total || 0}</div>
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
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Users</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {userStats?.data?.total || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Verified</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {userStats?.data?.verified || 0}
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
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Active</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {userStats?.data?.active || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Blocked</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {userStats?.data?.blocked || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Ban className="w-5 h-5 text-red-400" />
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
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === (usersData?.data?.users?.length || 0) && selectedUsers.length > 0}
                      onChange={selectAllUsers}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-400">Select All</span>
                  </label>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                </div>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 min-w-[150px]"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 min-w-[150px]"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          </motion.div>

          {/* Users List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <UserX className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 text-lg font-medium">Error loading users</p>
                <p className="text-gray-500 text-sm">{error?.data?.message || 'Something went wrong'}</p>
              </div>
            </div>
          ) : !usersData?.data?.users?.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">No users found</p>
                <p className="text-gray-500 text-sm">Users will appear here when they register</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              {usersData?.data?.users?.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            {/* User Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                                {getRoleIcon(user.role)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors duration-200 truncate">
                                    {user.name}
                                  </h3>
                                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                                    {getRoleIcon(user.role)}
                                    <span className="capitalize">{user.role.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <p className="text-gray-500 text-xs">Joined {formatDate(user.createdAt)}</p>
                              </div>
                            </div>
                          
                          {/* User Info Row */}
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4 text-blue-400" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4 text-green-400" />
                                <span className="truncate">{user.phone}</span>
                              </div>
                            )}
                            {user.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                <span className="truncate">{user.city}</span>
                              </div>
                            )}
                          </div>
                          </div>
                        </div>
                        
                        {/* Status and Actions */}
                        <div className="flex flex-col items-end gap-3 ml-4">
                          {/* Status Badge */}
                          <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${getStatusColor(getUserStatus(user))}`}>
                            {getStatusIcon(getUserStatus(user))}
                            <span className="capitalize">{getUserStatus(user)}</span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewUserDetails(user);
                              }}
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-2 py-1 text-xs"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            
                            {!user.verified ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerifyUser(user._id);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs"
                                disabled={isVerifying}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnverifyUser(user._id);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 text-xs"
                                disabled={isUnverifying}
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {user.isBlocked ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnblockUser(user._id);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
                                disabled={isUnblocking}
                              >
                                <Unlock className="w-3 h-3" />
                              </Button>
                            ) : user.role !== 'admin' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBlockModal(user);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
                              >
                                <Lock className="w-3 h-3" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRoleModal(user);
                              }}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 text-xs"
                            >
                              <Shield className="w-3 h-3" />
                            </Button>
                            
                            {user.role !== 'admin' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteModal(user);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
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
          {usersData?.data?.pagination && (
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
                  Page {page} of {usersData.data.pagination.pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= usersData.data.pagination.pages}
                  className="border-slate-700"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* Block User Modal */}
          {selectedUser && (
            <BlockUserModal
              user={selectedUser}
              isOpen={isBlockModalOpen}
              onClose={() => {
                setIsBlockModalOpen(false)
                setSelectedUser(null)
                setBlockReason('')
              }}
              onBlock={handleBlockUser}
              reason={blockReason}
              setReason={setBlockReason}
              isLoading={isBlocking}
            />
          )}

          {/* Delete User Modal */}
          {selectedUser && (
            <DeleteUserModal
              user={selectedUser}
              isOpen={isDeleteModalOpen}
              onClose={() => {
                setIsDeleteModalOpen(false)
                setSelectedUser(null)
              }}
              onDelete={handleDeleteUser}
              isLoading={isDeleting}
            />
          )}

          {/* Bulk Action Modal */}
          <BulkActionModal
            isOpen={isBulkActionModalOpen}
            onClose={() => {
              setIsBulkActionModalOpen(false)
              setBulkAction('')
              setBlockReason('')
            }}
            onConfirm={handleBulkAction}
            action={bulkAction}
            selectedCount={selectedUsers.length}
            reason={blockReason}
            setReason={setBlockReason}
            isLoading={isBulkActing}
          />

          {/* User Detail Modal */}
          {selectedUser && (
            <UserDetailModal
              user={selectedUser}
              isOpen={isDetailModalOpen}
              onClose={() => {
                setIsDetailModalOpen(false)
                setSelectedUser(null)
              }}
            />
          )}

          {/* Role Update Modal */}
          {selectedUser && (
            <RoleUpdateModal
              user={selectedUser}
              isOpen={isRoleModalOpen}
              onClose={() => {
                setIsRoleModalOpen(false)
                setSelectedUser(null)
              }}
              onUpdateRole={handleRoleUpdate}
              isLoading={isUpdatingRole}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// User Detail Modal Component
const UserDetailModal = ({ user, isOpen, onClose }) => {
  if (!user) return null

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{user.name}</h2>
          <p className="text-gray-400 text-xs">User Details</p>
        </div>
      </div>
    } size="lg">
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Full Name</p>
              <p className="text-sm font-medium text-white">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-white">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="text-sm font-medium text-white">{user.phone}</p>
              </div>
            )}
            {user.location && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Location</p>
                <p className="text-sm font-medium text-white">{user.location}</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Role</p>
              <p className="text-sm font-medium text-white capitalize">{user.role?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <p className="text-sm font-medium text-white capitalize">{user.status || 'Active'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Joined</p>
              <p className="text-sm font-medium text-white">{formatDateTime(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-white">{formatDateTime(user.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        {user.bio && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3">Bio</h4>
            <p className="text-sm text-gray-300">{user.bio}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

// Role Update Modal Component
const RoleUpdateModal = ({ user, isOpen, onClose, onUpdateRole, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'user')

  const roles = [
    { value: 'user', label: 'User', description: 'Standard user with booking permissions' },
    { value: 'artist', label: 'Artist', description: 'Can offer services and receive bookings' },
    { value: 'studio_owner', label: 'Studio Owner', description: 'Can manage studios and equipment' },
    { value: 'admin', label: 'Admin', description: 'Full access to all system features' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdateRole(selectedRole)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update User Role" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-300 mb-4">
            Update role for <span className="font-medium text-white">{user?.name}</span>
          </p>
          
          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === role.value
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">{role.label}</div>
                  <div className="text-xs text-gray-400">{role.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || selectedRole === user?.role}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Block User Modal Component
const BlockUserModal = ({ user, isOpen, onClose, onBlock, reason, setReason, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onBlock()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">Block User</p>
            <p className="text-xs text-red-400">
              This will prevent <span className="font-medium">{user?.name}</span> from accessing the platform
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reason for blocking (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for blocking this user..."
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            {isLoading ? 'Blocking...' : 'Block User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Delete User Modal Component
const DeleteUserModal = ({ user, isOpen, onClose, onDelete, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onDelete()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">Permanent Deletion</p>
            <p className="text-xs text-red-400">
              This will permanently delete <span className="font-medium">{user?.name}</span> and all related data
            </p>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-sm text-gray-300 mb-2">This action will delete:</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• User account and profile</li>
            <li>• All bookings and transactions</li>
            <li>• Reviews and ratings</li>
            <li>• Artist/Studio profiles (if applicable)</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Bulk Action Modal Component
const BulkActionModal = ({ isOpen, onClose, onConfirm, action, selectedCount, reason, setReason, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm()
  }

  const getActionDetails = () => {
    switch (action) {
      case 'verify':
        return { title: 'Verify Users', color: 'green', description: 'Mark selected users as verified' }
      case 'unverify':
        return { title: 'Unverify Users', color: 'yellow', description: 'Remove verification from selected users' }
      case 'block':
        return { title: 'Block Users', color: 'red', description: 'Block selected users from accessing the platform' }
      case 'unblock':
        return { title: 'Unblock Users', color: 'blue', description: 'Restore access for selected users' }
      case 'activate':
        return { title: 'Activate Users', color: 'green', description: 'Activate selected user accounts' }
      case 'deactivate':
        return { title: 'Deactivate Users', color: 'gray', description: 'Deactivate selected user accounts' }
      default:
        return { title: 'Bulk Action', color: 'gray', description: 'Perform action on selected users' }
    }
  }

  const actionDetails = getActionDetails()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={actionDetails.title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`flex items-center gap-3 p-4 bg-${actionDetails.color}-500/10 border border-${actionDetails.color}-500/20 rounded-lg`}>
          <AlertTriangle className={`w-6 h-6 text-${actionDetails.color}-400`} />
          <div>
            <p className={`text-sm font-medium text-${actionDetails.color}-300`}>
              {actionDetails.title}
            </p>
            <p className={`text-xs text-${actionDetails.color}-400`}>
              {actionDetails.description} ({selectedCount} users selected)
            </p>
          </div>
        </div>
        
        {action === 'block' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for blocking (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for blocking these users..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className={`flex-1 bg-${actionDetails.color}-500 hover:bg-${actionDetails.color}-600`}
          >
            {isLoading ? 'Processing...' : `${actionDetails.title}`}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminUsers
