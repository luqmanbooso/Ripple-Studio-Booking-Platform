import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  TrendingUp,
  Building2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Plus,
  Settings,
  Globe,
  Zap,
  Music,
  Headphones,
  Mic,
  PlayCircle,
  PauseCircle,
  Volume2,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Users2,
  ShieldCheck,
  Database,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Router,
  Shield,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useGetAnalyticsQuery } from '../../store/adminApi'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeframe, setTimeframe] = useState('month')
  const [systemStatus, setSystemStatus] = useState('operational')
  
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery({ timeframe })

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity, color: 'text-blue-400' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, color: 'text-green-400' },
    { id: 'management', label: 'Platform Management', icon: Settings, color: 'text-purple-400' },
    { id: 'system', label: 'System Monitor', icon: Server, color: 'text-orange-400' }
  ]

  // Enhanced stats with trend data and music industry context
  const stats = [
    {
      label: 'Total Users',
      value: analyticsData?.data?.totalUsers || 1247,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-400',
      description: 'Musicians & Studios',
      subValue: '847 Artists, 86 Studios, 314 Clients'
    },
    {
      label: 'Active Sessions',
      value: analyticsData?.data?.totalBookings || 892,
      change: '+8%',
      trend: 'up',
      icon: Mic,
      color: 'from-purple-500 to-pink-400',
      description: 'Recording Sessions',
      subValue: 'Avg. 3.2 hrs per session'
    },
    {
      label: 'Studio Network',
      value: analyticsData?.data?.totalStudios || 86,
      change: '+3%',
      trend: 'up',
      icon: Building2,
      color: 'from-green-500 to-emerald-400',
      description: 'Verified Studios',
      subValue: '98% Uptime, 4.8★ Avg Rating'
    },
    {
      label: 'Platform Revenue',
      value: `$${analyticsData?.data?.totalRevenue?.toLocaleString() || '48,560'}`,
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-400',
      description: 'Monthly Earnings',
      subValue: '$156K Total Volume'
    }
  ]

  const quickActions = [
    {
      title: 'Studio Network',
      description: 'Manage recording studios, equipment, and availability',
      href: '/admin/studios',
      icon: Building2,
      color: 'from-blue-500 to-cyan-400',
      stats: '86 Active',
      priority: 'high'
    },
    {
      title: 'Artist Hub',
      description: 'Manage musicians, portfolios, and verification',
      href: '/admin/users',
      icon: Music,
      color: 'from-purple-500 to-pink-400',
      stats: '847 Artists',
      priority: 'medium'
    },
    {
      title: 'Session Control',
      description: 'Monitor live bookings and session status',
      href: '/admin/bookings',
      icon: PlayCircle,
      color: 'from-green-500 to-emerald-400',
      stats: '23 Live Now',
      priority: 'urgent'
    },
    {
      title: 'Revenue Analytics',
      description: 'Financial reports, payouts, and revenue tracking',
      href: '/admin/revenue',
      icon: BarChart3,
      color: 'from-yellow-500 to-orange-400',
      stats: '$48.5K MTD',
      priority: 'high'
    },
    {
      title: 'Quality Control',
      description: 'Review moderation and content management',
      href: '/admin/reviews',
      icon: ShieldCheck,
      color: 'from-indigo-500 to-purple-400',
      stats: '12 Pending',
      priority: 'medium'
    },
    {
      title: 'Payment Gateway',
      description: 'Transaction monitoring and dispute resolution',
      href: '/admin/payments',
      icon: DollarSign,
      color: 'from-rose-500 to-pink-400',
      stats: '2 Disputes',
      priority: 'urgent'
    }
  ]

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 32000, bookings: 128 },
    { month: 'Feb', revenue: 38000, bookings: 152 },
    { month: 'Mar', revenue: 42000, bookings: 168 },
    { month: 'Apr', revenue: 39000, bookings: 156 },
    { month: 'May', revenue: 45000, bookings: 180 },
    { month: 'Jun', revenue: 48000, bookings: 192 }
  ]

  const userGrowthData = [
    { date: '1w ago', users: 1180 },
    { date: '6d ago', users: 1195 },
    { date: '5d ago', users: 1205 },
    { date: '4d ago', users: 1220 },
    { date: '3d ago', users: 1235 },
    { date: '2d ago', users: 1242 },
    { date: 'Today', users: 1247 }
  ]

  const genreData = [
    { name: 'Pop', value: 35, color: '#8B5CF6' },
    { name: 'Rock', value: 25, color: '#EF4444' },
    { name: 'Hip Hop', value: 20, color: '#10B981' },
    { name: 'Electronic', value: 12, color: '#F59E0B' },
    { name: 'Jazz', value: 8, color: '#3B82F6' }
  ]

  const pendingTasks = [
    { 
      type: 'Studio Verifications', 
      count: 5, 
      color: 'text-yellow-400',
      icon: Building2,
      urgency: 'medium' 
    },
    { 
      type: 'Review Moderation', 
      count: 12, 
      color: 'text-blue-400',
      icon: Star,
      urgency: 'low' 
    },
    { 
      type: 'Payment Disputes', 
      count: 2, 
      color: 'text-red-400',
      icon: AlertTriangle,
      urgency: 'high' 
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(99,102,241,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        {/* Sophisticated Header */}
        <header className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 shadow-xl shadow-gray-900/5 dark:shadow-black/20">
            {/* Premium Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5"></div>
            
            <div className="relative px-8 py-10">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between space-y-8 xl:space-y-0">
                {/* Left Section - Brand & Welcome */}
                <div className="flex items-start space-x-6">
                  {/* Professional Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-2xl shadow-indigo-500/25">
                      <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
                        <Settings className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-lg"></div>
                  </div>
                  
                  {/* Welcome Content */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Good morning, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Administrator</span>
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                        Ripple Studio Platform Management Console
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">All systems operational</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>86 Studios Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Updated 2 min ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Section - Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Time Period Selector */}
                  <div className="relative">
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="appearance-none px-5 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-10 shadow-sm"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                    </select>
                    <ArrowDownRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Studio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Clean Platform Statistics */}
        <section className="mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
            {/* Simple Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platform Overview</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Key performance metrics</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  const TrendIcon = stat.trend === 'up' ? TrendingUp : ArrowDownRight
                  const isPositive = stat.trend === 'up'
                  
                  return (
                    <div 
                      key={stat.label} 
                      className="p-5 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 dark:border-slate-700"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-0.5`}>
                          <div className="w-full h-full rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold ${
                          isPositive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          <TrendIcon className="w-3 h-3" />
                          <span>{stat.change}</span>
                        </div>
                      </div>
                      
                      {/* Value */}
                      <div className="mb-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
                          {stat.label}
                        </p>
                      </div>
                      
                      {/* Description */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {stat.description}
                      </p>
                      
                      {/* Additional Info */}
                      <div className="px-2.5 py-1 bg-white dark:bg-slate-600 rounded text-xs font-medium text-gray-600 dark:text-gray-300 inline-block">
                        {stat.subValue}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Premium Tab Navigation */}
        <nav className="mb-12">
          <div className="bg-gradient-to-r from-gray-50/80 via-white/90 to-gray-50/80 dark:from-slate-800/80 dark:via-slate-900/90 dark:to-slate-800/80 backdrop-blur-xl p-2 rounded-3xl border border-gray-200/50 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/10 dark:shadow-purple-500/20">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center space-x-4 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 border border-purple-300/30 backdrop-blur-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-white/80 hover:to-gray-50/80 dark:hover:from-slate-700/80 dark:hover:to-slate-600/80 hover:shadow-lg hover:shadow-gray-500/20 border border-transparent hover:border-gray-200/50 dark:hover:border-slate-600/50'
                    }`}
                  >
                    {/* Background Glow for Active Tab */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl animate-pulse"></div>
                    )}
                    
                    {/* Icon with enhanced styling */}
                    <div className={`relative z-10 p-2 rounded-xl ${isActive ? 'bg-white/20 backdrop-blur-sm' : 'group-hover:bg-gray-100/80 dark:group-hover:bg-slate-700/80'} transition-all duration-300`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : tab.color} transition-all duration-300 group-hover:scale-110`} />
                    </div>
                    
                    {/* Label with enhanced typography */}
                    <span className="relative z-10 tracking-wide">{tab.label}</span>
                    
                    {/* Active indicator with animated gradient */}
                    {isActive && (
                      <div className="absolute inset-x-0 -bottom-0.5 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full animate-shimmer"></div>
                    )}
                    
                    {/* Hover indicator */}
                    {!isActive && (
                      <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Tab Navigation Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl pointer-events-none"></div>
          </div>
          
          {/* Tab Description */}
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {activeTab === 'overview' && '📊 Complete overview of your music platform performance'}
              {activeTab === 'analytics' && '📈 Advanced analytics and detailed reporting dashboard'}
              {activeTab === 'management' && '⚙️ Comprehensive platform and user management tools'}
              {activeTab === 'system' && '🖥️ Real-time system monitoring and health diagnostics'}
            </p>
          </div>
        </nav>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              {/* Elegant Quick Actions Section */}
              <section className="mb-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-6 lg:space-y-0">
                  {/* Section Header */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Quick Actions
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Essential management tools at your fingertips
                    </p>
                  </div>
                  
                  {/* Status & Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">Operational</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Monitor
                    </Button>
                  </div>
                </div>
                
                {/* Elegant Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    const priorityColors = {
                      urgent: 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700',
                      high: 'border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700',
                      medium: 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
                    }
                    
                    const priorityBadgeColors = {
                      urgent: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
                      high: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
                      medium: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    }
                    
                    return (
                      <Link key={action.title} to={action.href} className="group block">
                        <Card className={`p-6 bg-white dark:bg-slate-900 border ${priorityColors[action.priority]} hover:shadow-elegant-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
                          {/* Subtle background accent */}
                          <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                            <Icon className="w-full h-full text-gray-400" />
                          </div>
                          
                          <div className="relative space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                                </div>
                              </div>
                              
                              {/* Priority Badge & Stats */}
                              <div className="text-right space-y-2">
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${priorityBadgeColors[action.priority]}`}>
                                  {action.priority === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                  {action.priority.toUpperCase()}
                                </div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                  {action.stats}
                                </div>
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors duration-300">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {action.description}
                              </p>
                            </div>
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  action.priority === 'urgent' ? 'bg-red-500' :
                                  action.priority === 'high' ? 'bg-amber-500' :
                                  'bg-blue-500'
                                } ${action.priority === 'urgent' ? 'animate-pulse' : ''}`}></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {action.priority} priority
                                </span>
                              </div>
                              
                              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                            </div>
                          </div>
                          
                          {/* Bottom accent */}
                          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </section>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Revenue Trends */}
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-elegant">
                    <div className="flex items-center justify-between mb-8">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Revenue Trends
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Monthly performance overview
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#64748B" />
                          <YAxis stroke="#64748B" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10B981" 
                            fillOpacity={1} 
                            fill="url(#revenueGradient)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* User Growth Chart */}
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span>User Growth</span>
                      </h3>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#64748B" />
                          <YAxis stroke="#64748B" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Elegant Sidebar */}
                <div className="space-y-6">
                  {/* Priority Tasks */}
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-elegant">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Priority Tasks
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Requires immediate attention
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                            {pendingTasks.length} alerts
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {pendingTasks.map((task, index) => {
                          const TaskIcon = task.icon
                          const urgencyColors = {
                            high: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
                            medium: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
                            low: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                          }
                          
                          return (
                            <div key={index} className={`p-4 rounded-xl border ${urgencyColors[task.urgency]} hover:shadow-elegant-sm transition-all duration-200 group cursor-pointer`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                    <TaskIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                  </div>
                                  <div>
                                    <p className="text-gray-900 dark:text-white font-semibold text-sm">{task.type}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Requires attention</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`text-xl font-bold ${task.color}`}>{task.count}</span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{task.urgency}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>

                  {/* Music Analytics */}
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-elegant">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span>Music Genres</span>
                      </h3>
                      <Button variant="outline" size="sm" className="text-xs bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trends
                      </Button>
                    </div>
                    
                    <div className="h-52 mb-6 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                              <feMorphology operator="dilate" radius="1"/>
                              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            </filter>
                          </defs>
                          <Pie
                            data={genreData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            filter="url(#glow)"
                          >
                            {genreData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={entry.color}
                                strokeWidth={0.5}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '12px',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value}%`, 'Bookings']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Center text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">100%</p>
                          <p className="text-xs text-gray-400">Coverage</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {genreData.map((genre, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors group">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full ring-2 ring-white/10 group-hover:ring-white/30 transition-all" 
                              style={{ backgroundColor: genre.color }}
                            ></div>
                            <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{genre.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold text-lg group-hover:text-cyan-300 transition-colors">{genre.value}%</span>
                            <p className="text-xs text-gray-500">of sessions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Live Studio Status */}
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-elegant">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <PlayCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span>Live Sessions</span>
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">23 Active</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:shadow-elegant-sm transition-all duration-200">
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold">Recording Studios</p>
                          <p className="text-green-600 dark:text-green-400 text-sm">Currently active</p>
                        </div>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">18</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-elegant-sm transition-all duration-200">
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold">Mixing Sessions</p>
                          <p className="text-blue-600 dark:text-blue-400 text-sm">In progress</p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:shadow-elegant-sm transition-all duration-200">
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold">Mastering</p>
                          <p className="text-purple-600 dark:text-purple-400 text-sm">Final touches</p>
                        </div>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Analytics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
                  <p className="text-gray-400">Deep insights into your music platform performance</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Custom Range
                  </Button>
                </div>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Studio Performance */}
                <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span>Studio Performance</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Revenue Breakdown */}
                <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span>Revenue Analysis</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">Platform Fees</p>
                        <p className="text-gray-400 text-sm">Commission from bookings</p>
                      </div>
                      <span className="text-green-400 font-bold text-xl">$12,450</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">Premium Features</p>
                        <p className="text-gray-400 text-sm">Advanced studio tools</p>
                      </div>
                      <span className="text-blue-400 font-bold text-xl">$8,320</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">Advertisement</p>
                        <p className="text-gray-400 text-sm">Promoted listings</p>
                      </div>
                      <span className="text-purple-400 font-bold text-xl">$3,890</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'management' && (
            <div className="space-y-8">
              {/* Studio Management Header */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Studio Management</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage recording studios, equipment, and operations</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Studio
                    </Button>
                  </div>
                </div>

                {/* Studio Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">86</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Total Studios</p>
                      </div>
                      <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">72</h3>
                        <p className="text-sm text-green-600 dark:text-green-300 font-medium">Active Studios</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">8</h3>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300 font-medium">Pending Review</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">6</h3>
                        <p className="text-sm text-red-600 dark:text-red-300 font-medium">Issues</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio Management Tools */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800">
                {/* Filters and Search */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search studios..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Filter className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <select className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Suspended</option>
                      </select>
                      
                      <select className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option>All Types</option>
                        <option>Recording</option>
                        <option>Mixing</option>
                        <option>Mastering</option>
                        <option>Rehearsal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Studio List */}
                <div className="divide-y divide-gray-200 dark:divide-slate-800">
                  {[
                    { id: 1, name: "Harmony Studios", owner: "John Smith", location: "Los Angeles, CA", status: "active", type: "Recording", rating: 4.8, bookings: 156, revenue: "$24,500" },
                    { id: 2, name: "Echo Chamber", owner: "Sarah Johnson", location: "Nashville, TN", status: "active", type: "Mixing", rating: 4.9, bookings: 134, revenue: "$18,900" },
                    { id: 3, name: "Bass Trap Studios", owner: "Mike Wilson", location: "Austin, TX", status: "pending", type: "Recording", rating: 4.6, bookings: 89, revenue: "$15,200" },
                    { id: 4, name: "Crystal Clear Audio", owner: "Emma Davis", location: "Miami, FL", status: "active", type: "Mastering", rating: 4.7, bookings: 201, revenue: "$32,100" }
                  ].map((studio) => (
                    <div key={studio.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{studio.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Owner: {studio.owner}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{studio.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              studio.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              studio.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {studio.status}
                            </span>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{studio.rating}</span>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bookings</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{studio.bookings}</p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">{studio.revenue}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Showing 1-4 of 86 studios
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>Previous</Button>
                      <Button variant="outline" size="sm">Next</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Manage artists, producers, and client accounts</p>
                  <Button variant="outline" className="w-full">Manage Users</Button>
                </Card>

                <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Control</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Session scheduling and management</p>
                  <Button variant="outline" className="w-full">View Bookings</Button>
                </Card>

                <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Platform performance and insights</p>
                  <Button variant="outline" className="w-full">View Analytics</Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="space-y-8">
              {/* Monitor Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">System Monitor</h2>
                  <p className="text-gray-400">Real-time platform health and performance metrics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">All Systems Operational</span>
                </div>
              </div>

              {/* System Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-400/10 border border-green-500/20">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Monitor className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Server Status</h3>
                    <p className="text-green-400 font-semibold">Operational</p>
                    <p className="text-xs text-gray-400 mt-2">99.9% Uptime</p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border border-blue-500/20">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Database</h3>
                    <p className="text-blue-400 font-semibold">Healthy</p>
                    <p className="text-xs text-gray-400 mt-2">2ms Response</p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-400/10 border border-purple-500/20">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wifi className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">API Status</h3>
                    <p className="text-purple-400 font-semibold">Active</p>
                    <p className="text-xs text-gray-400 mt-2">847 Requests/min</p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-400/10 border border-yellow-500/20">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Security</h3>
                    <p className="text-yellow-400 font-semibold">Protected</p>
                    <p className="text-xs text-gray-400 mt-2">No Threats</p>
                  </div>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Performance Metrics</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">CPU Usage</p>
                    <p className="text-3xl font-bold text-green-400">23%</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                      <div className="bg-green-400 h-2 rounded-full" style={{width: '23%'}}></div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">Memory Usage</p>
                    <p className="text-3xl font-bold text-blue-400">68%</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                      <div className="bg-blue-400 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">Storage Usage</p>
                    <p className="text-3xl font-bold text-purple-400">45%</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                      <div className="bg-purple-400 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard