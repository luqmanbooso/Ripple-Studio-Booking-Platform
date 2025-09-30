import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, Calendar, CreditCard, Download,
  ArrowUp, ArrowDown, Filter, Eye, FileText, Clock
} from 'lucide-react'
import { useSelector } from 'react-redux'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetMyBookingsQuery } from '../../store/bookingApi'

const StudioRevenue = () => {
  const { user } = useSelector(state => state.auth)
  const [timeframe, setTimeframe] = useState('month')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const { data: bookingsData, isLoading } = useGetMyBookingsQuery({
    page: 1,
    limit: 1000
  })

  const bookings = bookingsData?.data?.bookings || []

  const getTimeframeData = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return bookings.filter(booking => new Date(booking.createdAt) >= startDate)
  }

  const currentData = getTimeframeData()
  const completedBookings = currentData.filter(b => b.status === 'completed')
  const pendingBookings = currentData.filter(b => b.status === 'pending' || b.status === 'confirmed')

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const averageBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0

  const getMonthlyRevenue = () => {
    const months = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt)
        return bookingDate.getMonth() === date.getMonth() && 
               bookingDate.getFullYear() === date.getFullYear() &&
               booking.status === 'completed'
      })
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthBookings.reduce((sum, b) => sum + (b.price || 0), 0),
        bookings: monthBookings.length
      })
    }
    
    return months
  }

  const monthlyData = getMonthlyRevenue()

  const getPaymentMethods = () => {
    const methods = {}
    completedBookings.forEach(booking => {
      const method = booking.paymentMethod || 'Unknown'
      methods[method] = (methods[method] || 0) + (booking.price || 0)
    })
    return Object.entries(methods).map(([method, amount]) => ({ method, amount }))
  }

  const paymentMethods = getPaymentMethods()

  const revenueMetrics = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900'
    },
    {
      label: 'Pending Revenue',
      value: `$${pendingRevenue.toFixed(2)}`,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      label: 'Avg Booking Value',
      value: `$${averageBookingValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      label: 'Completed Bookings',
      value: completedBookings.length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900'
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your earnings and financial performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueMetrics.map((metric, index) => {
          const Icon = metric.icon
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{metric.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Revenue Trend</h3>
          <div className="space-y-4">
            {monthlyData.map((month, index) => {
              const maxRevenue = Math.max(...monthlyData.map(m => m.revenue))
              const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
              
              return (
                <div key={month.month} className="flex items-center space-x-4">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">{month.month}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-3"
                      >
                        <span className="text-white text-sm font-medium">
                          ${month.revenue.toFixed(0)}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 dark:text-white text-right">
                    {month.bookings}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Payment Methods</h3>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => {
              const maxAmount = Math.max(...paymentMethods.map(m => m.amount))
              const percentage = maxAmount > 0 ? (method.amount / maxAmount) * 100 : 0
              
              return (
                <div key={method.method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {method.method}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ${method.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-blue-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Service</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedBookings.slice(0, 10).map((booking, index) => (
                <motion.tr
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {booking.client?.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {booking.service?.name}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    ${booking.price?.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => (setSelectedBooking(booking), setShowInvoiceModal(true))}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Transaction Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Client Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {selectedBooking.client?.name}</p>
                  <p><span className="text-gray-600 dark:text-gray-400">Email:</span> {selectedBooking.client?.email}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600 dark:text-gray-400">Service:</span> {selectedBooking.service?.name}</p>
                  <p><span className="text-gray-600 dark:text-gray-400">Date:</span> {new Date(selectedBooking.start).toLocaleDateString()}</p>
                  <p><span className="text-gray-600 dark:text-gray-400">Duration:</span> {selectedBooking.service?.durationMins} minutes</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>${selectedBooking.price?.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline">Download Invoice</Button>
              <Button>Send Receipt</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StudioRevenue
