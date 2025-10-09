import React, { useState } from 'react'
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
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  const [payoutStatus, setPayoutStatus] = useState('requested')
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)

  // Platform revenue query - temporarily disabled to prevent 400 errors
  const { data: platformData, isLoading: platformLoading, refetch } = useGetPlatformRevenueQuery({
    startDate: getStartDate(),
    endDate: new Date().toISOString()
  }, {
    skip: true // Temporarily skip the query to prevent 400 errors
  })

  // Payout requests query - temporarily disabled to prevent 400 errors
  const { data: payoutData, isLoading: payoutLoading } = useGetAllPayoutRequestsQuery({
    status: payoutStatus,
    page: 1,
    limit: 20
  }, {
    skip: true // Temporarily skip the query to prevent 400 errors
  })

  // Mutations
  const [processPayout, { isLoading: processLoading }] = useProcessPayoutRequestMutation()
  const [updateCommission, { isLoading: commissionLoading }] = useUpdateCommissionRateMutation()

  const statistics = platformData?.data?.statistics || {}
  const recentRevenues = platformData?.data?.recentRevenues || []
  const payoutRequests = payoutData?.data?.payoutRequests || []

  function getStartDate() {
    const now = new Date()
    switch (timeframe) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString()
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString()
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString()
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString()
      default:
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString()
    }
  }

  // Handle payout processing
  const handleProcessPayout = async (revenueId, payoutIndex, status, notes = '') => {
    try {
      await processPayout({
        revenueId,
        payoutIndex,
        status,
        notes,
        payoutId: status === 'completed' ? `PAY-${Date.now()}` : undefined
      }).unwrap()
      
      toast.success(`Payout ${status} successfully!`)
      setShowPayoutModal(false)
      setSelectedPayout(null)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to process payout')
    }
  }

  // Handle commission rate update
  const handleUpdateCommission = async (newRate) => {
    try {
      await updateCommission({ rate: newRate / 100 }).unwrap()
      toast.success('Commission rate updated successfully!')
      setShowCommissionModal(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update commission rate')
    }
  }

  if (platformLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        
          {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Revenue Management</h1>
            <p className="text-gray-400">Monitor platform revenue, manage payouts, and oversee financial operations</p>
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

        {/* Demo Message */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 text-center">
          <div className="flex flex-col items-center space-y-4">
            <DollarSign className="w-12 h-12 text-blue-400" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Admin Revenue Management Demo</h3>
              <p className="text-gray-300 mb-4">
                This is the Admin Revenue Management Dashboard. To see live data, the platform needs active studios with confirmed bookings. 
                Currently showing the interface with demo functionality.
              </p>
              <p className="text-sm text-gray-400">
                Note: Revenue queries are temporarily disabled to prevent API errors. Enable them when you have proper test data.
              </p>
            </div>
          </div>
        </Card>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Platform Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {statistics.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Commission Earned</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {statistics.totalCommission?.toLocaleString() || '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Studio Earnings</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {statistics.totalStudioEarnings?.toLocaleString() || '0'}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {statistics.totalBookings || '0'}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </Card>
        </div>

        {/* Payout Management */}
        <Card className="p-6 bg-gray-800/50 border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Payout Requests</h2>
            
            <div className="flex items-center space-x-4">
              <select
                value={payoutStatus}
                onChange={(e) => setPayoutStatus(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
              >
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Studio</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Requested</th>
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
                        payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                        payout.status === 'approved' ? 'bg-purple-500/20 text-purple-400' :
                        payout.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
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

          {payoutRequests.length === 0 && (
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
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {revenue.studio?.name} - {revenue.client?.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(revenue.createdAt).toLocaleDateString()} • LKR {revenue.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">
                    +LKR {revenue.platformCommission.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Commission</p>
                </div>
              </div>
            ))}
          </div>

          {recentRevenues.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent revenue activity</p>
            </div>
          )}
        </Card>
      </div>

      {/* Commission Settings Modal */}
      <CommissionModal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        onSubmit={handleUpdateCommission}
        loading={commissionLoading}
        currentRate={statistics.platformCommissionRate || 0.10}
      />

      {/* Payout Details Modal */}
      <PayoutDetailsModal
        isOpen={showPayoutModal}
        onClose={() => {
          setShowPayoutModal(false)
          setSelectedPayout(null)
        }}
        payout={selectedPayout}
        onProcess={handleProcessPayout}
        loading={processLoading}
      />
      </div>
    </div>
  )
}

// Commission Settings Modal
const CommissionModal = ({ isOpen, onClose, onSubmit, loading, currentRate }) => {
  const [rate, setRate] = useState((currentRate * 100).toFixed(1))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(parseFloat(rate))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Commission Settings">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Platform Commission Rate (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            min="0"
            max="50"
            step="0.1"
            required
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            placeholder="e.g., 10.0"
          />
          <p className="text-gray-400 text-sm mt-1">
            Current rate: {(currentRate * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 text-sm font-medium">Important</p>
              <p className="text-yellow-300 text-sm">
                This will affect all future bookings. Existing revenue records will not be changed.
              </p>
            </div>
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
    </Modal>
  )
}

// Payout Details Modal
const PayoutDetailsModal = ({ isOpen, onClose, payout, onProcess, loading }) => {
  if (!payout) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payout Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Studio</label>
            <p className="text-white">{payout.studio?.name || 'Unknown Studio'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <p className="text-white font-medium">LKR {payout.amount.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Bank Details</label>
          <div className="bg-gray-700/30 rounded-lg p-3 space-y-1">
            <p className="text-white">{payout.bankDetails?.accountHolder}</p>
            <p className="text-gray-300">{payout.bankDetails?.bankName}</p>
            <p className="text-gray-300">Account: ****{payout.bankDetails?.accountNumber?.slice(-4)}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Request Date</label>
          <p className="text-white">{new Date(payout.requestedAt).toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
            payout.status === 'approved' ? 'bg-purple-500/20 text-purple-400' :
            payout.status === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {payout.status}
          </span>
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
        </div>
      </div>
    </Modal>
  )
}

export default AdminRevenueManagement
