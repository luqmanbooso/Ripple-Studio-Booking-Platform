import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, Calendar, CreditCard, Download,
  ArrowUp, ArrowDown, Filter, Eye, FileText, Clock, Plus,
  PieChart, BarChart3, Wallet, Receipt, AlertCircle
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { 
  useGetStudioRevenueQuery,
  useRequestPayoutMutation,
  useGetPayoutHistoryQuery,
  useAddAdjustmentMutation,
  useGenerateInvoiceMutation
} from '../../store/revenueApi'

const StudioRevenue = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [selectedRevenue, setSelectedRevenue] = useState(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  // Revenue queries - temporarily disabled to prevent 400 errors
  const { data: revenueData, isLoading, refetch } = useGetStudioRevenueQuery({
    page,
    limit: 10,
    status,
    startDate: getStartDate(),
    endDate: new Date().toISOString()
  }, {
    skip: true // Temporarily skip the query to prevent 400 errors
  })

  const { data: payoutData } = useGetPayoutHistoryQuery({ page: 1, limit: 5 }, {
    skip: true // Temporarily skip the query to prevent 400 errors
  })

  // Mutations
  const [requestPayout, { isLoading: payoutLoading }] = useRequestPayoutMutation()
  const [addAdjustment, { isLoading: adjustmentLoading }] = useAddAdjustmentMutation()
  const [generateInvoice] = useGenerateInvoiceMutation()

  const revenues = revenueData?.data?.revenues || []
  const statistics = revenueData?.data?.statistics || {}
  const payouts = payoutData?.data?.payouts || []

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

  // Handle payout request
  const handlePayoutRequest = async (amount, bankDetails) => {
    try {
      await requestPayout({ amount, bankDetails }).unwrap()
      toast.success('Payout requested successfully!')
      setShowPayoutModal(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to request payout')
    }
  }

  // Handle adjustment
  const handleAddAdjustment = async (adjustmentData) => {
    try {
      await addAdjustment({ id: selectedRevenue._id, ...adjustmentData }).unwrap()
      toast.success('Adjustment added successfully!')
      setShowAdjustmentModal(false)
      setSelectedRevenue(null)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to add adjustment')
    }
  }

  // Handle invoice generation
  const handleGenerateInvoice = async (revenueId) => {
    try {
      const result = await generateInvoice(revenueId).unwrap()
      toast.success('Invoice generated successfully!')
      // Open invoice in new tab or download
    } catch (error) {
      toast.error(error.data?.message || 'Failed to generate invoice')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Check if user has no studio data (empty response)
  const hasNoStudio = revenues.length === 0 && statistics.totalRevenue === 0 && statistics.totalBookings === 0
  
  // Note: Revenue queries are temporarily skipped to prevent 400 errors
  // To enable: remove the "skip: true" option from the useGetStudioRevenueQuery and useGetPayoutHistoryQuery calls above
  // This requires a proper studio user with associated studio record

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Revenue Dashboard</h1>
            <p className="text-gray-400">Track your earnings, manage payouts, and generate invoices</p>
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
              onClick={() => setShowPayoutModal(true)}
              className="bg-green-600 hover:bg-green-700"
              icon={<Wallet className="w-4 h-4" />}
            >
              Request Payout
            </Button>
          </div>
        </div>

        {/* No Studio Message */}
        {hasNoStudio && (
          <Card className="p-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 text-center">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="w-16 h-16 text-yellow-400" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Revenue System Demo</h3>
                <p className="text-gray-300 mb-4">
                  This is the Studio Revenue Dashboard. To see live data, you need a complete studio profile with confirmed bookings. 
                  Currently showing the interface with demo data.
                </p>
                <Button
                  onClick={() => window.location.href = '/dashboard/profile'}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Complete Studio Setup
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics Cards */}
        {!hasNoStudio && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Revenue</p>
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
                <p className="text-green-300 text-sm font-medium">Studio Earnings</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {statistics.totalStudioEarnings?.toLocaleString() || '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {statistics.totalBookings || '0'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Avg. Booking Value</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {Math.round(statistics.averageBookingValue || 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
          </Card>
        </div>
        )}

        {/* Revenue Table */}
        {!hasNoStudio && (
        <>
        <Card className="p-6 bg-gray-800/50 border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Revenue Records</h2>
            
            <div className="flex items-center space-x-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="paid_out">Paid Out</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Client</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Service</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((revenue) => (
                  <tr key={revenue._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(revenue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {revenue.client?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {revenue.bookingId?.service?.name || 'Session'}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      LKR {revenue.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        revenue.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        revenue.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        revenue.status === 'paid_out' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {revenue.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedRevenue(revenue)
                            setShowAdjustmentModal(true)
                          }}
                          icon={<Plus className="w-4 h-4" />}
                        >
                          Adjust
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleGenerateInvoice(revenue._id)}
                          icon={<Receipt className="w-4 h-4" />}
                        >
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {revenues.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No revenue records found</p>
            </div>
          )}
        </Card>

        {/* Recent Payouts */}
        <Card className="p-6 bg-gray-800/50 border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-6">Recent Payouts</h2>
          
          <div className="space-y-4">
            {payouts.map((payout, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">LKR {payout.amount.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(payout.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                  payout.status === 'approved' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {payout.status}
                </span>
              </div>
            ))}
          </div>

          {payouts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payout requests yet</p>
            </div>
          )}
        </Card>
        </>
        )}
      </div>

      {/* Payout Modal */}
      <PayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSubmit={handlePayoutRequest}
        loading={payoutLoading}
        availableAmount={statistics.totalStudioEarnings || 0}
      />

      {/* Adjustment Modal */}
      <AdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => {
          setShowAdjustmentModal(false)
          setSelectedRevenue(null)
        }}
        onSubmit={handleAddAdjustment}
        loading={adjustmentLoading}
        revenue={selectedRevenue}
      />
    </div>
  )
}

// Payout Modal Component
const PayoutModal = ({ isOpen, onClose, onSubmit, loading, availableAmount }) => {
  const [amount, setAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    bankName: '',
    accountHolder: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(parseFloat(amount), bankDetails)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Payout">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Available Amount: LKR {availableAmount.toLocaleString()}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={availableAmount}
            min="100"
            step="0.01"
            required
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            value={bankDetails.accountHolder}
            onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
            required
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            placeholder="Full name as per bank account"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bank Name
          </label>
          <input
            type="text"
            value={bankDetails.bankName}
            onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
            required
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            placeholder="e.g., Commercial Bank"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Account Number
          </label>
          <input
            type="text"
            value={bankDetails.accountNumber}
            onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
            required
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            placeholder="Bank account number"
          />
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
            className="bg-green-600 hover:bg-green-700"
          >
            Request Payout
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Adjustment Modal Component
const AdjustmentModal = ({ isOpen, onClose, onSubmit, loading, revenue }) => {
  const [adjustment, setAdjustment] = useState({
    amount: '',
    reason: '',
    type: 'tip'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...adjustment,
      amount: parseFloat(adjustment.amount)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Adjustment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <select
            value={adjustment.type}
            onChange={(e) => setAdjustment(prev => ({ ...prev, type: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
          >
            <option value="tip">Tip</option>
            <option value="discount">Discount</option>
            <option value="fee">Additional Fee</option>
            <option value="correction">Correction</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={adjustment.amount}
            onChange={(e) => setAdjustment(prev => ({ ...prev, amount: e.target.value }))}
            step="0.01"
            required
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            placeholder="Enter amount (positive or negative)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reason
          </label>
          <textarea
            value={adjustment.reason}
            onChange={(e) => setAdjustment(prev => ({ ...prev, reason: e.target.value }))}
            required
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            placeholder="Explain the reason for this adjustment"
          />
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudioRevenue
