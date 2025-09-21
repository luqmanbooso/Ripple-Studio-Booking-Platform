import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Mic,
  Users,
  Target
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useGetRevenueAnalyticsQuery } from '../../store/adminApi'

const AdminRevenue = () => {
  const [timeframe, setTimeframe] = useState('month')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const { data: revenueData, isLoading } = useGetRevenueAnalyticsQuery({ 
    timeframe,
    ...(dateRange.start && dateRange.end && {
      startDate: dateRange.start,
      endDate: dateRange.end
    })
  })

  // Calculate trends
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: '0%', direction: 'up' }
    const change = ((current - previous) / previous) * 100
    return {
      value: `${Math.abs(change).toFixed(1)}%`,
      direction: change >= 0 ? 'up' : 'down'
    }
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${revenueData?.data?.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-400',
      textColor: 'text-green-400',
      trend: calculateTrend(revenueData?.data?.totalRevenue || 0, 45000),
      description: 'Platform earnings'
    },
    {
      label: 'Avg Booking Value',
      value: `$${revenueData?.data?.averageBookingValue?.toFixed(0) || '0'}`,
      icon: Target,
      color: 'from-blue-500 to-cyan-400',
      textColor: 'text-blue-400',
      trend: calculateTrend(revenueData?.data?.averageBookingValue || 0, 180),
      description: 'Per booking average'
    },
    {
      label: 'Active Studios',
      value: revenueData?.data?.topStudios?.length || '0',
      icon: Building2,
      color: 'from-purple-500 to-pink-400',
      textColor: 'text-purple-400',
      trend: { value: '12%', direction: 'up' },
      description: 'Earning studios'
    },
    {
      label: 'Top Artists',
      value: revenueData?.data?.topArtists?.length || '0',
      icon: Mic,
      color: 'from-yellow-500 to-orange-400',
      textColor: 'text-yellow-400',
      trend: { value: '8%', direction: 'up' },
      description: 'Active performers'
    }
  ]

  const COLORS = ['#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#3B82F6']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                Revenue Reports
              </h1>
              <p className="text-gray-400 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Financial insights and earnings analytics</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex items-center bg-slate-900/50 backdrop-blur-xl rounded-xl p-1 border border-slate-800/50">
              {['week', 'month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                    timeframe === period
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <Button variant="outline" className="border-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend.direction === 'up' ? ArrowUpRight : ArrowDownRight
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="relative overflow-hidden border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-900/20 backdrop-blur-xl group">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <TrendIcon className={`w-4 h-4 ${stat.trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={stat.trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}>
                          {stat.trend.value}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Revenue Trend</span>
              </h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-slate-700">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="border-slate-700">
                  <Calendar className="w-4 h-4 mr-1" />
                  Custom Range
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData?.data?.revenueByMonth || []}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Studios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span>Top Studios by Revenue</span>
              </h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {revenueData?.data?.topStudios?.slice(0, 5).map((studio, index) => (
                    <motion.div
                      key={studio._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-amber-600' : 'bg-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{studio.name}</h4>
                          <p className="text-xs text-gray-400">{studio.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">${studio.revenue?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Top Performing Artists */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Mic className="w-5 h-5 text-yellow-400" />
                <span>Top Artists by Revenue</span>
              </h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {revenueData?.data?.topArtists?.slice(0, 5).map((artist, index) => (
                    <motion.div
                      key={artist._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-amber-600' : 'bg-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{artist.name}</h4>
                          <p className="text-xs text-gray-400">{artist.bookings} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">${artist.revenue?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Revenue Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="border border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span>Revenue Distribution</span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bookings vs Revenue Bar Chart */}
              <div>
                <h4 className="text-lg font-medium text-gray-300 mb-4">Monthly Performance</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData?.data?.revenueByMonth || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Sources Pie Chart */}
              <div>
                <h4 className="text-lg font-medium text-gray-300 mb-4">Revenue Sources</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Studios', value: 65, color: '#8B5CF6' },
                          { name: 'Artists', value: 35, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Studios', value: 65, color: '#8B5CF6' },
                          { name: 'Artists', value: 35, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm text-gray-300">Studios (65%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-300">Artists (35%)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminRevenue