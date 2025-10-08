import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, Calendar, Download, 
  Receipt, Eye, Filter, Search, CreditCard,
  PieChart, BarChart3, FileText, Clock
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { 
  useGetClientSpendingQuery,
  useLazyDownloadSpendingReportQuery
} from '../../store/revenueApi'

const ClientSpending = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Client spending query - temporarily disabled to prevent 400 errors
  const { data: spendingData, isLoading, refetch } = useGetClientSpendingQuery({
    page,
    limit: 10,
    startDate: getStartDate(),
    endDate: new Date().toISOString()
  }, {
    skip: true // Temporarily skip the query to prevent 400 errors
  })

  // Download report query
  const [downloadReport, { isLoading: downloadLoading }] = useLazyDownloadSpendingReportQuery()

  const revenues = spendingData?.data?.revenues || []
  const statistics = spendingData?.data?.statistics || {}

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

  // Handle report download
  const handleDownloadReport = async (format = 'csv') => {
    try {
      const result = await downloadReport({
        startDate: getStartDate(),
        endDate: new Date().toISOString(),
        format
      }).unwrap()
      
      toast.success('Report downloaded successfully!')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to download report')
    }
  }

  // Filter revenues based on search
  const filteredRevenues = revenues.filter(revenue => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      revenue.studio?.name?.toLowerCase().includes(searchLower) ||
      revenue.bookingId?.service?.name?.toLowerCase().includes(searchLower) ||
      new Date(revenue.createdAt).toLocaleDateString().includes(searchLower)
    )
  })

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
            <h1 className="text-3xl font-bold text-white mb-2">Spending History</h1>
            <p className="text-gray-400">Track your studio booking expenses and download reports</p>
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
              onClick={() => handleDownloadReport('csv')}
              loading={downloadLoading}
              className="bg-blue-600 hover:bg-blue-700"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Demo Message */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20 text-center">
          <div className="flex flex-col items-center space-y-4">
            <CreditCard className="w-12 h-12 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Client Spending History Demo</h3>
              <p className="text-gray-300 mb-4">
                This is the Client Spending History Dashboard. To see live data, you need confirmed bookings with payments. 
                Currently showing the interface with demo functionality.
              </p>
              <p className="text-sm text-gray-400">
                Note: Spending queries are temporarily disabled to prevent API errors. Enable them when you have booking history.
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {statistics.totalSpent?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Average Per Booking</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {Math.round(statistics.averageSpending || 0).toLocaleString()}
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
                <p className="text-orange-300 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-white mt-1">
                  LKR {(filteredRevenues.reduce((sum, r) => sum + r.totalAmount, 0)).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
          </Card>
        </div>

        {/* Spending History Table */}
        <Card className="p-6 bg-gray-800/50 border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Spending Records</h2>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search studios, services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Studio</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Service</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRevenues.map((revenue) => (
                  <tr key={revenue._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(revenue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {revenue.studio?.name || 'Unknown Studio'}
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
                            // View detailed breakdown
                            toast.info('Receipt details coming soon!')
                          }}
                          icon={<Receipt className="w-4 h-4" />}
                        >
                          Receipt
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // View booking details
                            toast.info('Booking details coming soon!')
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

          {filteredRevenues.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No spending records found</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try adjusting your search terms</p>
              )}
            </div>
          )}
        </Card>

        {/* Spending Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Trend */}
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Monthly Spending Trend</h3>
            <div className="space-y-4">
              {/* Placeholder for chart - can be replaced with actual chart library */}
              <div className="h-48 bg-gray-700/30 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Spending trend chart</p>
                  <p className="text-sm">Chart integration coming soon</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Studios */}
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Top Studios</h3>
            <div className="space-y-3">
              {revenues
                .reduce((acc, revenue) => {
                  const studioName = revenue.studio?.name || 'Unknown Studio'
                  if (!acc[studioName]) {
                    acc[studioName] = { name: studioName, total: 0, count: 0 }
                  }
                  acc[studioName].total += revenue.totalAmount
                  acc[studioName].count += 1
                  return acc
                }, {})
                ? Object.values(revenues.reduce((acc, revenue) => {
                    const studioName = revenue.studio?.name || 'Unknown Studio'
                    if (!acc[studioName]) {
                      acc[studioName] = { name: studioName, total: 0, count: 0 }
                    }
                    acc[studioName].total += revenue.totalAmount
                    acc[studioName].count += 1
                    return acc
                  }, {}))
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((studio, index) => (
                    <div key={studio.name} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-500/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{studio.name}</p>
                          <p className="text-gray-400 text-sm">{studio.count} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">LKR {studio.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                : (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No studio data available</p>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ClientSpending
