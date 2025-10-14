import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, Users, Building2, 
  Clock, AlertTriangle,
  Download, Settings,
  PieChart, BarChart3, CreditCard
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { 
  useGetPlatformRevenueQuery,
  useUpdateCommissionRateMutation,
  useLazyGenerateAdminReportQuery
} from '../../store/revenueApi'

const AdminRevenueManagement = () => {
  const { user, token } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [reportType, setReportType] = useState('platform')
  const [reportFormat, setReportFormat] = useState('csv')

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

  // Mutations and lazy queries
  const [updateCommissionRate, { isLoading: commissionLoading }] = useUpdateCommissionRateMutation()
  const [generateReport, { isLoading: reportLoading }] = useLazyGenerateAdminReportQuery()

  // Event handlers
  const handleGenerateReport = async () => {
    try {
      const params = {
        startDate: getStartDate,
        endDate: getEndDate,
        format: reportFormat,
        reportType: reportType
      }

      const result = await generateReport(params).unwrap()

      if (reportFormat === 'csv') {
        // Create and trigger download for CSV
        const blob = new Blob([result], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${reportType}-revenue-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Report downloaded successfully')
      } else {
        // Handle JSON response
        console.log('Report data:', result)
        toast.success('Report generated successfully')
      }
    } catch (error) {
      toast.error(error.data?.message || 'Failed to generate report')
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
  const recentRevenues = platformData?.data?.recentRevenues || []

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
  if (platformError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Revenue Management</h1>
                <p className="text-gray-400">Monitor {((statistics?.commissionRate || 0.03) * 100).toFixed(1)}% platform commission from bookings and generate detailed reports</p>
              </div>
            </div>
            
            <Card className="p-6 bg-red-500/10 border-red-500/20">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Error Loading Revenue Data</h3>
                  <p className="text-red-300 mb-4">
                    {platformError?.data?.message || 'Unable to load revenue information'}
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    {platformError && <p>Platform API Error: {platformError.status} - {JSON.stringify(platformError.data)}</p>}
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
              <p className="text-gray-400">Monitor {((statistics?.commissionRate || 0.03) * 100).toFixed(1)}% platform commission from bookings and generate detailed reports</p>
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
                      LKR {(statistics.totalCommission || 0).toLocaleString()}
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
                      LKR {(statistics.totalRevenue || 0).toLocaleString()}
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

          {/* Report Generation */}
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Generate Reports</h2>
              <div className="flex items-center space-x-3">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="platform">Platform Revenue</option>
                  <option value="studios">Studio Performance</option>
                </select>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="csv">CSV Download</option>
                  <option value="json">JSON View</option>
                </select>
                <Button
                  onClick={handleGenerateReport}
                  loading={reportLoading}
                  icon={<Download className="w-4 h-4" />}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Generate Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Revenue Report Info */}
              {reportType === 'platform' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-blue-300 font-medium mb-2">Platform Revenue Report</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Comprehensive report including all revenue transactions, commission breakdowns, and platform earnings.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Individual booking revenue details</li>
                    <li>• Platform commission ({((statistics?.commissionRate || 0.03) * 100).toFixed(1)}%) per transaction</li>
                    <li>• Studio earnings breakdown</li>
                    <li>• Revenue status tracking</li>
                    <li>• Date range: {getStartDate} to {getEndDate}</li>
                  </ul>
                </div>
              )}

              {/* Studio Performance Report Info */}
              {reportType === 'studios' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-green-300 font-medium mb-2">Studio Performance Report</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Detailed analytics on studio performance, including booking volumes and revenue metrics.
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Total bookings per studio</li>
                    <li>• Revenue generated by each studio</li>
                    <li>• Platform commission earned</li>
                    <li>• Average booking value</li>
                    <li>• Performance rankings</li>
                  </ul>
                </div>
              )}

              {/* Report Statistics */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="text-purple-300 font-medium mb-2">Current Period Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Revenue:</span>
                    <span className="text-white font-medium">LKR {(statistics.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Commission:</span>
                    <span className="text-green-400 font-medium">LKR {(statistics.totalCommission || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Bookings:</span>
                    <span className="text-blue-400 font-medium">{statistics.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Report Format:</span>
                    <span className="text-purple-400 font-medium">{reportFormat.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {reportFormat === 'csv' && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  📁 CSV reports will be automatically downloaded to your computer when generated.
                </p>
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

export default AdminRevenueManagement