import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users,
  Search,
  Filter,
  Eye,
  Shield,
  ShieldCheck,
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
  Building2
} from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetUsersQuery, useUpdateUserRoleMutation } from '../../store/adminApi'
import { toast } from 'react-hot-toast'

const AdminUsers = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  // API hooks
  const { data: usersData, isLoading, error } = useGetUsersQuery({ 
    page,
    search,
    role: roleFilter,
    status: statusFilter,
    limit: 15 
  })
  
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation()

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
    { value: 'suspended', label: 'Suspended' }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'suspended': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
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
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl">
                <span className="text-xs text-gray-400">Total Users</span>
                <div className="font-semibold text-white">{usersData?.data?.pagination?.totalItems || 0}</div>
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
                    {usersData?.data?.stats?.total || usersData?.data?.pagination?.totalItems || 0}
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
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Artists</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">
                    {usersData?.data?.stats?.artists || 
                     usersData?.data?.users?.filter(u => u.role === 'artist').length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Studio Owners</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {usersData?.data?.stats?.studioOwners || 
                     usersData?.data?.users?.filter(u => u.role === 'studio_owner').length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Active Today</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {usersData?.data?.stats?.activeToday || 
                     usersData?.data?.users?.filter(u => u.status === 'active').length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <UserCheck className="w-5 h-5 text-green-400" />
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
                  <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                        onClick={() => viewUserDetails(user)}>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
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
                            {user.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                <span className="truncate">{user.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status and Actions */}
                        <div className="flex flex-col items-end gap-3 ml-4">
                          {/* Status Badge */}
                          <div className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${getStatusColor(user.status || 'active')}`}>
                            {user.status === 'active' ? '✓ Active' : 
                             user.status === 'suspended' ? '✗ Suspended' : 
                             '⏳ Inactive'}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewUserDetails(user);
                              }}
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRoleModal(user);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-xs"
                            >
                              <Shield className="w-3.5 h-3.5 mr-1.5" />
                              Role
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

export default AdminUsers
