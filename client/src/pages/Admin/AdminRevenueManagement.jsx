import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, Users, Building2, 
  CheckCircle, XCircle, Clock, AlertTriangle,
  Download, Filter, Search, Eye, Settings,
  PieChart, BarChart3, CreditCard, Wallet
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { 
  useGetPlatformRevenueQuery,
  useGetAllPayoutRequestsQuery,
  useProcessPayoutRequestMutation,
  useUpdateCommissionRateMutation
} from '../../store/revenueApi'

const AdminRevenueManagement = () => {
  const { user, token } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  const [payoutStatus, setPayoutStatus] = useState('requested')
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)

  // Helper functions - memoize dates to prevent constant re-renders
  const getStartDate = useMemo(() => {
    const now = new Date()
    switch (timeframe) {
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return weekAgo.toISOString().split('T')[0] // Use date only, not time
      case 'month':
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return monthAgo.toISOString().split('T')[0]
      case 'quarter':
        const quarterAgo = new Date(now)
        quarterAgo.setMonth(quarterAgo.getMonth() - 3)
        return quarterAgo.toISOString().split('T')[0]
      case 'year':
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return yearAgo.toISOString().split('T')[0]
      default:
        const defaultMonthAgo = new Date(now)
        defaultMonthAgo.setMonth(defaultMonthAgo.getMonth() - 1)
        return defaultMonthAgo.toISOString().split('T')[0]
    }
  }, [timeframe])

  const getEndDate = useMemo(() => {
    return new Date().toISOString().split('T')[0] // Today's date only
  }, [])

  // Platform revenue query with proper auth handling
  const { 
    data: platformData, 
    isLoading: platformLoading, 
    error: platformError, 
    refetch,
    isSuccess: platformSuccess,
    isFetching: platformFetching,
    isUninitialized: platformUninitialized
  } = useGetPlatformRevenueQuery({
    startDate: getStartDate,
    endDate: getEndDate
  }, {
    skip: !token // Skip query if no token available
  })

  // Payout requests query with proper auth handling
  const { data: payoutData, isLoading: payoutLoading, error: payoutError } = useGetAllPayoutRequestsQuery({
    status: payoutStatus,
    page: 1,
    limit: 20
  }, {
    skip: !token // Skip query if no token available
  })

  // Mutations
  const [processPayoutRequest, { isLoading: processLoading }] = useProcessPayoutRequestMutation()
  const [updateCommissionRate, { isLoading: commissionLoading }] = useUpdateCommissionRateMutation()

  // Event handlers
  const handleProcessPayout = async (revenueId, payoutIndex, status, notes = '') => {
    try {
      await processPayoutRequest({
        revenueId,
        payoutIndex,
        status,
        notes,
        processedBy: user._id
      }).unwrap()
      
      toast.success(`Payout ${status} successfully`)
      setShowPayoutModal(false)
      setSelectedPayout(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to process payout')
    }
  }

  const handleUpdateCommission = async (newRate) => {
    try {
      await updateCommissionRate({
        rate: newRate / 100
      }).unwrap()
      
      toast.success('Commission rate updated successfully')
      setShowCommissionModal(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update commission rate')
    }
  }

  // Data processing
  const statistics = platformData?.data?.statistics || {}
  const payoutRequests = payoutData?.data?.payouts || []
  const recentRevenues = platformData?.data?.recentRevenues || []

  // Debug logging
  console.log('=== AdminRevenueManagement Debug ===')
  console.log('Platform Loading:', platformLoading)
  console.log('Platform Error:', platformError)
  console.log('Platform Data:', platformData)
  console.log('Platform Success:', platformSuccess)
  console.log('Platform Fetching:', platformFetching)
  console.log('Platform Uninitialized:', platformUninitialized)
  console.log('Payout Loading:', payoutLoading)
  console.log('Payout Error:', payoutError)
  console.log('User:', user)
  console.log('Auth Token:', token ? 'Present' : 'Missing')
  console.log('Token length:', token ? token.length : 0)
  console.log('Query params:', { 
    startDate: getStartDate, 
    endDate: getEndDate 
  })

  // Show loading state only if no token or initial loading with no data yet  
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-white mt-4">Authenticating...</p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Token: {token ? 'Present' : 'Missing'}</p>
            <p>User: {user ? user.name : 'Not loaded'}</p>
          </div>
        </div>
      </div>
    )
  }

  // If we have token but still loading initial data
  if (platformLoading && !platformData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-white mt-4">Loading revenue data...</p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Token: Present ({token.substring(0, 20)}...)</p>
            <p>Platform Loading: {platformLoading.toString()}</p>
            <p>Platform Success: {platformSuccess.toString()}</p>
            <p>Platform Fetching: {platformFetching.toString()}</p>
            <p>Platform Uninitialized: {platformUninitialized.toString()}</p>
            <p>Platform Data: {platformData ? 'Present' : 'Missing'}</p>
            <p>Platform Error: {platformError ? JSON.stringify(platformError) : 'None'}</p>
          </div>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manual Refetch
          </button>
        </div>
      </div>
    )
  }

  // Show error state if there are errors
  if (platformError || payoutError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Revenue Management</h1>
                <p className="text-gray-400">Monitor 3% platform commission from bookings and manage studio payouts</p>
              </div>
            </div>
            
            <Card className="p-6 bg-red-500/10 border-red-500/20">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Error Loading Revenue Data</h3>
                  <p className="text-red-300 mb-4">
                    {platformError?.data?.message || payoutError?.data?.message || 'Unable to load revenue information'}
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    {platformError && <p>Platform API Error: {platformError.status} - {JSON.stringify(platformError.data)}</p>}
                    {payoutError && <p>Payout API Error: {payoutError.status} - {JSON.stringify(payoutError.data)}</p>}
                  </div>
                  <Button 
                    onClick={() => {
                      refetch()
                      window.location.reload()
                    }}
                    className="bg-red-600 hover:bg-red-700 mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-8 -left-8 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-8 right-20 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Revenue Management</h1>
              <p className="text-gray-400">Monitor 3% platform commission from bookings and manage studio payouts</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* Timeframe Selector */}
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              
              <Button
                onClick={() => setShowCommissionModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
                icon={<Settings className="w-4 h-4" />}
              >
                Commission Settings
              </Button>
            </div>
          </div>

          {/* Debug Information - Always Visible */}
          <Card className="p-6 bg-blue-500/10 border-blue-500/20">
            <h3 className="text-lg font-bold text-white mb-4">🔍 Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">API Status</h4>
                <p className="text-gray-300">Platform Loading: {platformLoading ? '⏳ Yes' : '✅ No'}</p>
                <p className="text-gray-300">Platform Error: {platformError ? `❌ ${platformError.status}` : '✅ No error'}</p>
                <p className="text-gray-300">Payout Loading: {payoutLoading ? '⏳ Yes' : '✅ No'}</p>
                <p className="text-gray-300">Payout Error: {payoutError ? `❌ ${payoutError.status}` : '✅ No error'}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Data Status</h4>
                <p className="text-gray-300">Platform Data: {platformData ? '✅ Loaded' : '❌ No data'}</p>
                <p className="text-gray-300">Payout Data: {payoutData ? '✅ Loaded' : '❌ No data'}</p>
                <p className="text-gray-300">Statistics: {Object.keys(statistics).length} keys</p>
                <p className="text-gray-300">Timestamp: {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">User Info</h4>
                <p className="text-gray-300">User: {user?.name || 'Unknown'}</p>
                <p className="text-gray-300">Role: {user?.role || 'Unknown'}</p>
                <p className="text-gray-300">User ID: {user?._id || 'N/A'}</p>
                <p className="text-gray-300">Component: AdminRevenueManagement</p>
              </div>
            </div>
          </Card>

          {/* Platform Revenue Statistics - 3% Commission Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-gray-800/50 border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Platform Revenue (3%)</p>
                    <p className="text-2xl font-bold text-white">
                      LKR {(statistics.totalPlatformRevenue || 0).toLocaleString()}
                    </p>
                    <p className="text-green-400 text-xs mt-1">
                      +{statistics.revenueGrowth || 0}% from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gray-800/50 border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Booking Value</p>
                    <p className="text-2xl font-bold text-white">
                      LKR {(statistics.totalBookingValue || 0).toLocaleString()}
                    </p>
                    <p className="text-blue-400 text-xs mt-1">
                      97% paid to studios
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-gray-800/50 border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Commission Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {((statistics.commissionRate || 0.03) * 100).toFixed(1)}%
                    </p>
                    <p className="text-purple-400 text-xs mt-1">
                      Platform fee per booking
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-gray-800/50 border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Bookings</p>
                    <p className="text-2xl font-bold text-white">
                      {(statistics.totalBookings || 0).toLocaleString()}
                    </p>
                    <p className="text-yellow-400 text-xs mt-1">
                      Revenue generating bookings
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Studio Payout Management */}
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Studio Payout Requests</h2>
              <div className="flex items-center space-x-3">
                <select
                  value={payoutStatus}
                  onChange={(e) => setPayoutStatus(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {payoutLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Studio</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount (97%)</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Request Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Bank Details</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRequests.map((payout, index) => (
                      <tr key={`${payout.revenueId}-${index}`} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 px-4 text-white">
                          {payout.studio?.name || 'Unknown Studio'}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          LKR {payout.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          <div className="text-sm">
                            <p>{payout.bankDetails?.bankName}</p>
                            <p className="text-gray-400">****{payout.bankDetails?.accountNumber?.slice(-4)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            payout.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                            payout.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            payout.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {payout.status === 'requested' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleProcessPayout(payout.revenueId, 0, 'approved')}
                                  loading={processLoading}
                                  icon={<CheckCircle className="w-4 h-4" />}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleProcessPayout(payout.revenueId, 0, 'failed', 'Rejected by admin')}
                                  loading={processLoading}
                                  icon={<XCircle className="w-4 h-4" />}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {payout.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleProcessPayout(payout.revenueId, 0, 'completed')}
                                loading={processLoading}
                                icon={<Wallet className="w-4 h-4" />}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Complete
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPayout(payout)
                                setShowPayoutModal(true)
                              }}
                              icon={<Eye className="w-4 h-4" />}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {payoutRequests.length === 0 && !payoutLoading && (
              <div className="text-center py-8 text-gray-400">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No {payoutStatus} payout requests</p>
              </div>
            )}
          </Card>

          {/* Recent Revenue Activity */}
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Recent Revenue Activity</h2>
            
            <div className="space-y-4">
              {recentRevenues.map((revenue) => (
                <div key={revenue._id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{revenue.studio?.name}</p>
                      <p className="text-gray-400 text-sm">
                        Booking by {revenue.client?.name} • {new Date(revenue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">LKR {revenue.totalAmount.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">
                      +LKR {(revenue.totalAmount * 0.03).toLocaleString()} commission (3%)
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {recentRevenues.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent revenue activity</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Commission Settings Modal */}
      <Modal 
        isOpen={showCommissionModal} 
        onClose={() => setShowCommissionModal(false)}
        title="Platform Commission Settings"
      >
        <CommissionModal
          isOpen={showCommissionModal}
          onClose={() => setShowCommissionModal(false)}
          onSubmit={handleUpdateCommission}
          loading={commissionLoading}
          currentRate={statistics.commissionRate || 0.03}
        />
      </Modal>

      {/* Payout Details Modal */}
      <Modal 
        isOpen={showPayoutModal} 
        onClose={() => setShowPayoutModal(false)}
        title="Payout Request Details"
      >
        <PayoutDetailsModal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          payout={selectedPayout}
          onProcess={handleProcessPayout}
          loading={processLoading}
        />
      </Modal>
    </div>
  )
}

// Commission Settings Modal Component
const CommissionModal = ({ isOpen, onClose, onSubmit, loading, currentRate }) => {
  const [rate, setRate] = useState((currentRate * 100).toFixed(1))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(parseFloat(rate))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Commission Rate (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="50"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          placeholder="3.0"
        />
        <p className="text-gray-400 text-xs mt-1">
          Current: {(currentRate * 100).toFixed(1)}% - Platform takes this percentage from each booking
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">Revenue Split Example:</h4>
        <div className="space-y-1 text-sm">
          <p className="text-gray-300">Booking Amount: LKR 10,000</p>
          <p className="text-green-400">Platform Commission ({rate}%): LKR {((10000 * parseFloat(rate || 3)) / 100).toLocaleString()}</p>
          <p className="text-blue-400">Studio Receives ({(100 - parseFloat(rate || 3)).toFixed(1)}%): LKR {(10000 - ((10000 * parseFloat(rate || 3)) / 100)).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Update Commission Rate
        </Button>
      </div>
    </form>
  )
}

// Payout Details Modal Component
const PayoutDetailsModal = ({ isOpen, onClose, payout, onProcess, loading }) => {
  if (!payout) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Studio</label>
          <p className="text-white">{payout.studio?.name || 'Unknown Studio'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
          <p className="text-white font-medium">LKR {payout.amount?.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Request Date</label>
          <p className="text-white">{new Date(payout.requestedAt).toLocaleDateString()}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            payout.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
            payout.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
            payout.status === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {payout.status}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Bank Details</label>
        <div className="bg-gray-700/30 rounded-lg p-3 space-y-1">
          <p className="text-white">{payout.bankDetails?.bankName}</p>
          <p className="text-gray-300">Account: {payout.bankDetails?.accountNumber}</p>
          <p className="text-gray-300">Holder: {payout.bankDetails?.accountHolder}</p>
        </div>
      </div>

      {payout.notes && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <p className="text-white bg-gray-700/30 rounded-lg p-3">{payout.notes}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>
        {payout.status === 'requested' && (
          <>
            <Button
              onClick={() => {
                onProcess(payout.revenueId, 0, 'approved')
                onClose()
              }}
              loading={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              onClick={() => {
                onProcess(payout.revenueId, 0, 'failed', 'Rejected by admin')
                onClose()
              }}
              loading={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </Button>
          </>
        )}
        {payout.status === 'approved' && (
          <Button
            onClick={() => {
              onProcess(payout.revenueId, 0, 'completed')
              onClose()
            }}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Mark as Completed
          </Button>
        )}
      </div>
    </div>
  )
}

export default AdminRevenueManagement