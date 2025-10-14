import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  Building2,
  BarChart3,
  Activity,
  AlertTriangle,
  Globe,
  Settings,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useGetAnalyticsQuery } from '../../store/adminApi'
import { useGetPlatformRevenueQuery } from '../../store/revenueApi'

const AdminDashboard = () => {
  const [timeframe, setTimeframe] = useState('month')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  
  const { data: analyticsData, isLoading, error, refetch, isFetching } = useGetAnalyticsQuery({ timeframe })
  const { data: revenueData, isLoading: revenueLoading } = useGetPlatformRevenueQuery()

  const analytics = analyticsData?.data || {}
  const revenueStats = revenueData?.data?.statistics || {}
  
  // Use platform commission as the real revenue
  const platformRevenue = revenueStats.totalCommission || 0
  
  // Update last updated time when data changes
  useEffect(() => {
    if (analyticsData) {
      setLastUpdated(new Date())
    }
  }, [analyticsData])
  
  const handleRefresh = () => {
    refetch()
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 p-4">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Error Loading Dashboard</h3>
                  <p className="text-red-300 mb-4">
                    {error?.data?.message || 'Unable to load dashboard data'}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-gray-400 flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>Platform Overview & Management</span>
                  </p>
                  <span className="text-gray-600">•</span>
                  <p className="text-gray-500 text-xs flex items-center space-x-1">
                    <Activity className={`w-3 h-3 ${isFetching ? 'text-blue-400 animate-pulse' : 'text-green-400'}`} />
                    <span>
                      {isFetching ? 'Updating...' : `Updated ${lastUpdated.toLocaleTimeString()}`}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Timeframe Selector & Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1">
                {['week', 'month', 'quarter', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    disabled={isFetching}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize disabled:opacity-50 disabled:cursor-not-allowed ${
                      timeframe === period
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </motion.div>

          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-2">Total Users</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {analytics.totalUsers || 0}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-xs">
                        {analytics.platformHealth?.activeUsers || 0} active
                      </span>
                      <span className="text-green-400 text-xs flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        12%
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-2">Total Bookings</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {analytics.totalBookings || 0}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 text-xs">
                        {analytics.platformHealth?.completedBookings || 0} completed
                      </span>
                      <span className="text-green-400 text-xs flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        8%
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-2">Active Studios</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {analytics.studioStats?.approved || 0}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400 text-xs">
                        {analytics.studioStats?.pending || 0} pending
                      </span>
                      <span className="text-green-400 text-xs flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        3%
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-2">Platform Revenue</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {revenueLoading ? (
                        <span className="text-gray-500">Loading...</span>
                      ) : (
                        <>LKR {platformRevenue.toLocaleString()}</>
                      )}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-xs">
                        {revenueStats.totalBookings || 0} transactions
                      </span>
                      <span className="text-gray-500 text-xs">
                        {revenueStats.commissionRate ? `${(revenueStats.commissionRate * 100).toFixed(1)}%` : '3%'} commission
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10 p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalUsers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">registered</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-400">{analytics.studioStats?.pending || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">studios awaiting</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{analytics.platformHealth?.completedBookings || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.totalBookings > 0 
                      ? `${((analytics.platformHealth?.completedBookings || 0) / analytics.totalBookings * 100).toFixed(0)}% rate`
                      : '0% rate'
                    }
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-400">{analytics.reviewStats?.avgRating?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.reviewStats?.totalReviews || 0} reviews</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Avg Commission</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {revenueStats.totalBookings > 0 
                      ? `${Math.round(platformRevenue / revenueStats.totalBookings)}`
                      : '0'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per booking</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Booking Trends Chart */}
            {analytics.bookingTrends && analytics.bookingTrends.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Booking Trends</h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-blue-400 font-semibold">
                        {analytics.bookingTrends.reduce((sum, item) => sum + item.bookings, 0)}
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.bookingTrends}>
                      <defs>
                        <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        fontSize={11}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151', 
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#F9FAFB', marginBottom: '4px' }}
                        itemStyle={{ color: '#3B82F6' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fill="url(#bookingsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}

            {/* Revenue Trends Chart */}
            {analytics.revenueTrends && analytics.revenueTrends.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Revenue Trends</h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-green-400 font-semibold">
                        LKR {analytics.revenueTrends.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.revenueTrends}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        fontSize={11}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151', 
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#F9FAFB', marginBottom: '4px' }}
                        itemStyle={{ color: '#10B981' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Quick Actions / Management Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link to="/admin/studios">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Studios Management</h3>
                  <p className="text-gray-400 text-sm mb-2">Manage recording studios and approvals</p>
                  <p className="text-blue-400 text-sm font-medium">{analytics.studioStats?.total || 0} Total Studios</p>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link to="/admin/users">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">User Management</h3>
                  <p className="text-gray-400 text-sm mb-2">Manage users and verification</p>
                  <p className="text-green-400 text-sm font-medium">{analytics.totalUsers || 0} Total Users</p>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link to="/admin/bookings">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-indigo-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Bookings Overview</h3>
                  <p className="text-gray-400 text-sm mb-2">Monitor bookings and sessions</p>
                  <p className="text-indigo-400 text-sm font-medium">{analytics.platformHealth?.pendingBookings || 0} Pending</p>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Link to="/admin/revenue">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-6 h-6 text-yellow-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-yellow-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Revenue Analytics</h3>
                  <p className="text-gray-400 text-sm mb-2">Financial reports and analytics</p>
                  <p className="text-yellow-400 text-sm font-medium">LKR {platformRevenue.toLocaleString()}</p>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Link to="/admin/reviews">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-orange-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Reviews Management</h3>
                  <p className="text-gray-400 text-sm mb-2">Moderate reviews and ratings</p>
                  <p className="text-orange-400 text-sm font-medium">{analytics.reviewStats?.totalReviews || 0} Reviews</p>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Link to="/admin/settings">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Settings className="w-6 h-6 text-gray-400" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">Platform Settings</h3>
                  <p className="text-gray-400 text-sm mb-2">System configuration and settings</p>
                  <p className="text-gray-400 text-sm font-medium">Configure</p>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
