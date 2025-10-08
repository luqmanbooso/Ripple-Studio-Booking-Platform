import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  Building2,
  Clock,
  BarChart3,
  TrendingUp,
  Shield,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { 
  useGetAllReviewsForModerationQuery,
  useModerateReviewMutation,
  useDeleteReviewMutation,
  useBulkModerateReviewsMutation
} from '../../store/reviewApi'

const AdminReviews = () => {
  const { user } = useSelector(state => state.auth)
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [selectedReviews, setSelectedReviews] = useState([])
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [moderatorNotes, setModeratorNotes] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAction, setBulkAction] = useState('approve')

  // Check if we're in admin context (accessing admin routes means we should try the API)
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  
  // API hooks
  const { data: reviewsData, isLoading, error, refetch } = useGetAllReviewsForModerationQuery({
    page: 1,
    limit: 20,
    ...filters
  })

  const [moderateReview, { isLoading: moderating }] = useModerateReviewMutation()
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation()
  const [bulkModerate, { isLoading: bulkModerating }] = useBulkModerateReviewsMutation()

  const reviews = reviewsData?.data?.reviews || []
  const statistics = reviewsData?.data?.statistics || {}

  // Debug logging (remove in production)
  // console.log('AdminReviews Debug:', { reviewsData, isLoading, error, reviews: reviews.length, statistics })

  // Debug function to test auth
  const testAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('=== AUTHENTICATION DEBUG ===')
      console.log('1. Token status:', token ? 'Present' : 'Missing')
      console.log('2. Token preview:', token ? token.substring(0, 50) + '...' : 'N/A')
      console.log('3. Current user from Redux:', user)
      console.log('4. User role:', user?.role)
      
      // Test /api/auth/me endpoint
      console.log('\n--- Testing /api/auth/me ---')
      const authResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('Auth response status:', authResponse.status, authResponse.statusText)
      const authData = await authResponse.json()
      console.log('Auth response data:', authData)
      
      // Test review endpoint directly
      console.log('\n--- Testing /api/reviews/admin/all ---')
      const reviewResponse = await fetch('/api/reviews/admin/all?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Review response status:', reviewResponse.status, reviewResponse.statusText)
      
      if (reviewResponse.status === 403) {
        console.log('❌ 403 Forbidden - User lacks admin privileges')
      } else if (reviewResponse.status === 401) {
        console.log('❌ 401 Unauthorized - Authentication failed')
      } else if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json()
        console.log('✅ Review data:', reviewData)
      }
      
      console.log('=== END DEBUG ===')
    } catch (error) {
      console.error('Debug error:', error)
    }
  }

  const handleModerateReview = async (reviewId, action) => {
    try {
      await moderateReview({
        reviewId,
        action,
        moderatorNotes
      }).unwrap()
      
      toast.success(`Review ${action}d successfully`)
      setShowModerationModal(false)
      setSelectedReview(null)
      setModeratorNotes('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || `Failed to ${action} review`)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      await deleteReview(reviewId).unwrap()
      toast.success('Review deleted successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete review')
    }
  }

  const handleBulkModerate = async () => {
    if (selectedReviews.length === 0) {
      toast.error('Please select reviews to moderate')
      return
    }

    try {
      await bulkModerate({
        reviewIds: selectedReviews,
        action: bulkAction,
        moderatorNotes
      }).unwrap()
      
      toast.success(`${selectedReviews.length} reviews ${bulkAction}d successfully`)
      setShowBulkModal(false)
      setSelectedReviews([])
      setModeratorNotes('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to moderate reviews')
    }
  }

  const toggleReviewSelection = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const selectAllReviews = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(reviews.map(r => r._id))
    }
  }

  const getStatusColor = (status) => {
    if (status) return 'text-green-400 bg-green-400/20'
    return 'text-yellow-400 bg-yellow-400/20'
  }

  const getStatusText = (isApproved) => {
    return isApproved ? 'Approved' : 'Pending'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Review Moderation</h1>
            <p className="text-gray-400">Approve, reject, and manage user reviews</p>
          </div>
          
          {selectedReviews.length > 0 && (
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">
                {selectedReviews.length} selected
              </span>
              <Button
                onClick={() => setShowBulkModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
                icon={<Shield className="w-4 h-4" />}
              >
                Bulk Moderate
              </Button>
            </div>
          )}
        </div>

        {/* Status Message */}
        {error?.status === 403 ? (
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 text-center">
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="w-12 h-12 text-red-400" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Authentication Issue</h3>
                <p className="text-gray-300 mb-4">
                  You're on the admin panel but don't have proper admin authentication. 
                  The current user session may not have admin privileges.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-300 mb-2"><strong>Try these solutions:</strong></p>
                  <p className="text-sm text-yellow-300">🔄 Refresh the page</p>
                  <p className="text-sm text-yellow-300">🔑 Re-login with admin credentials</p>
                  <p className="text-sm text-yellow-300">📧 admin@musicbooking.com / admin123</p>
                </div>
                <p className="text-sm text-gray-400">
                  Current user: {user?.email || 'Not logged in'} | Role: {user?.role || 'Unknown'}
                </p>
                <div className="flex space-x-3 mt-4">
                  <Button
                    onClick={testAuth}
                    className="bg-yellow-600 hover:bg-yellow-700"
                    size="sm"
                  >
                    🔍 Debug Authentication
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/login'}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    🔑 Re-login as Admin
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Shield className="w-12 h-12 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Review Moderation System</h3>
                <p className="text-gray-300 mb-4">
                  {isLoading ? 'Loading review data...' : 
                   reviews.length > 0 ? `Found ${reviews.length} reviews in the system.` :
                   'No reviews found. The system is ready to moderate reviews when they are submitted.'}
                </p>
                <p className="text-sm text-gray-400">
                  💡 Use the tools below to moderate reviews, approve/reject content, and maintain platform quality.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Reviews</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {statistics.total || 0}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {statistics.approved || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {statistics.pending || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {statistics.avgRating ? statistics.avgRating.toFixed(1) : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gray-800/50 border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="reported">Reported</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => setFilters({
                status: '',
                rating: '',
                search: '',
                sortBy: 'createdAt',
                sortOrder: 'desc'
              })}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Reviews List */}
        <Card className="p-6 bg-gray-800/50 border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Reviews</h2>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedReviews.length === reviews.length && reviews.length > 0}
                  onChange={selectAllReviews}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Select All</span>
              </label>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No reviews found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review._id)}
                        onChange={() => toggleReviewSelection(review._id)}
                        className="mt-1 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.isApproved)}`}
                          >
                            {getStatusText(review.isApproved)}
                          </span>
                          {review.reported && review.reported.length > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium text-red-400 bg-red-400/20">
                              Reported ({review.reported.length})
                            </span>
                          )}
                        </div>

                        <p className="text-gray-300 mb-3 line-clamp-2">
                          {review.comment || 'No comment provided'}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{review.author?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{review.targetId?.name || 'Unknown Studio'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                        </div>

                        {review.moderatorNotes && (
                          <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                            <p className="text-sm text-gray-300">
                              <strong>Moderator Notes:</strong> {review.moderatorNotes}
                            </p>
                            {review.moderatedBy && (
                              <p className="text-xs text-gray-400 mt-1">
                                By {review.moderatedBy.name} on {formatDate(review.moderatedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedReview(review)
                          setShowModerationModal(true)
                        }}
                        icon={<Eye className="w-4 h-4" />}
                      >
                        Moderate
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-400 hover:text-red-300"
                        icon={<Trash2 className="w-4 h-4" />}
                        disabled={deleting}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Moderation Modal */}
        <Modal
          isOpen={showModerationModal}
          onClose={() => {
            setShowModerationModal(false)
            setSelectedReview(null)
            setModeratorNotes('')
          }}
          title="Moderate Review"
        >
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Review Details</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < selectedReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-500'
                        }`}
                      />
                    ))}
                    <span className="text-gray-300">by {selectedReview.author?.name}</span>
                  </div>
                  <p className="text-gray-300">
                    {selectedReview.comment || 'No comment provided'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Moderator Notes (Optional)
                </label>
                <textarea
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Add notes about your moderation decision..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModerationModal(false)
                    setSelectedReview(null)
                    setModeratorNotes('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleModerateReview(selectedReview._id, 'reject')}
                  disabled={moderating}
                  className="bg-red-600 hover:bg-red-700"
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleModerateReview(selectedReview._id, 'approve')}
                  disabled={moderating}
                  className="bg-green-600 hover:bg-green-700"
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Bulk Moderation Modal */}
        <Modal
          isOpen={showBulkModal}
          onClose={() => {
            setShowBulkModal(false)
            setModeratorNotes('')
          }}
          title="Bulk Moderate Reviews"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              You are about to moderate {selectedReviews.length} reviews.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action
              </label>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moderator Notes (Optional)
              </label>
              <textarea
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder="Add notes about your moderation decision..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkModal(false)
                  setModeratorNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkModerate}
                disabled={bulkModerating}
                className={bulkAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                icon={bulkAction === 'approve' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              >
                {bulkAction === 'approve' ? 'Approve All' : 'Reject All'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default AdminReviews
