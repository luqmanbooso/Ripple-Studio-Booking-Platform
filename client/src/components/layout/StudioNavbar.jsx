import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Music, 
  Search,
  Calendar,
  ChevronDown,
  Bell,
  MessageCircle,
  Home,
  Star,
  TrendingUp,
  Globe,
  Phone,
  Building2,
  Image,
  Wrench,
  BarChart3,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'
import { logout } from '../../store/authSlice'
import NotificationCenter from '../notifications/NotificationCenter'
import { useGetNotificationStatsQuery } from '../../store/notificationApi'
import { disconnectSocket } from '../../lib/socket'
import toast from 'react-hot-toast'
import ThemeToggle from '../ui/ThemeToggle'

const StudioNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()

  // Notification stats
  const { data: notificationStats } = useGetNotificationStatsQuery()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDropdown = event.target.closest('[data-studio-dropdown]') || 
                                   event.target.closest('[data-studio-profile-menu]') ||
                                   event.target.closest('button[data-studio-dropdown-trigger]') ||
                                   event.target.closest('button[data-studio-profile-trigger]') ||
                                   event.target.closest('[data-notifications-panel]')
      
      if (!isClickInsideDropdown) {
        setActiveDropdown(null)
        setIsProfileOpen(false)
        setIsNotificationsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigation = (href) => {
    navigate(href)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      dispatch(logout())
      disconnectSocket()
      navigate('/')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home 
    },
    {
      name: 'Bookings',
      href: '/dashboard/bookings',
      icon: Calendar
    },
    {
      name: 'Studio Profile',
      href: '/dashboard/profile',
      icon: Building2
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3
    },
    {
      name: 'Revenue',
      href: '/dashboard/revenue',
      icon: DollarSign
    }
  ]

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true
    return false
  }

  const toggleDropdown = (dropdownId, event) => {
    event.stopPropagation()
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)
    setIsProfileOpen(false)
  }

  const toggleProfile = (event) => {
    event.stopPropagation()
    setIsProfileOpen(!isProfileOpen)
    setActiveDropdown(null)
  }

  return (
    <>
      <nav className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <img 
                  src="/logo.png" 
                  alt="Ripple Studio" 
                  className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 hidden">
                  <Music className="w-10 h-10 text-white" />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden xl:flex items-center justify-center flex-1 max-w-4xl mx-4">
              <div className="flex items-center space-x-1 bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full px-3 py-2 border border-gray-200/60 dark:border-slate-700/60">
                {navigation.map((item) => {
                  const Icon = item.icon
                  
                  if (item.isDropdown) {
                    const isOpen = activeDropdown === item.dropdownId
                    const isActive = item.items.some(subItem => location.pathname.startsWith(subItem.href))
                    
                    return (
                      <div key={item.name} className="relative" data-studio-dropdown>
                        <button
                          onClick={(e) => toggleDropdown(item.dropdownId, e)}
                          data-studio-dropdown-trigger
                          className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 group ${
                            isOpen || isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
                          }`}
                        >
                          <Icon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                          <span>{item.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 animate-pulse' : 'group-hover:animate-bounce'}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-3 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 dark:border-slate-700/60 py-4 z-50"
                              data-studio-dropdown
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.items.map((dropdownItem, index) => {
                                const DropdownIcon = dropdownItem.icon
                                return (
                                  <motion.div
                                    key={dropdownItem.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <Link
                                      to={dropdownItem.href}
                                      className="flex items-start space-x-3 px-4 py-3 mx-2 rounded-2xl text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white transition-all duration-300 group"
                                      onClick={() => setActiveDropdown(null)}
                                    >
                                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 dark:group-hover:from-indigo-800/40 dark:group-hover:to-purple-800/40 transition-all duration-300">
                                        <DropdownIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                          {dropdownItem.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                          {dropdownItem.description}
                                        </div>
                                      </div>
                                    </Link>
                                  </motion.div>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group ${
                        isActive(item.href)
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                          : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive(item.href) ? 'animate-pulse' : 'group-hover:scale-110 group-hover:animate-bounce'}`} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side - Notifications + Theme Toggle + User Menu */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle size="md" />

              {/* Messages */}
              <button className="relative p-3 text-light-textSecondary dark:text-gray-400 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                <MessageCircle className="w-5 h-5 group-hover:animate-bounce" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-3 text-light-textSecondary dark:text-gray-400 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
              >
                <Bell className="w-5 h-5 group-hover:animate-bounce" />
                {/* Notification badge - shows unread count */}
                {notificationStats?.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notificationStats.unreadCount > 99 ? '99+' : notificationStats.unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" data-studio-profile-menu>
                <button
                  onClick={(e) => toggleProfile(e)}
                  data-studio-profile-trigger
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-light-card/50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-light-primary to-light-accent dark:from-primary-500 dark:to-accent-500 rounded-xl flex items-center justify-center ring-2 ring-transparent group-hover:ring-light-primary/30 dark:group-hover:ring-primary-500/30 transition-all duration-200 animate-pulse-glow">
                      {user?.avatar?.url ? (
                        <img 
                          src={user.avatar.url} 
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white group-hover:animate-bounce" />
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-light-text dark:text-gray-100 truncate max-w-24 group-hover:text-light-primary dark:group-hover:text-primary-400 transition-colors">
                        {user?.name}
                      </div>
                      <div className="text-xs text-light-textMuted dark:text-gray-400 capitalize">
                        Studio Owner
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-light-textSecondary dark:text-gray-400 transition-transform duration-200 group-hover:animate-bounce ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-light-border/50 dark:border-gray-700/50 py-3 z-50 animate-fade-in-down"
                      data-studio-profile-menu
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-3 border-b border-light-border/30 dark:border-gray-700/30">
                        <div className="text-sm font-medium text-light-text dark:text-gray-100">{user?.name}</div>
                        <div className="text-xs text-light-textMuted dark:text-gray-400">{user?.email}</div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/dashboard/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-light-textSecondary dark:text-gray-300 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Building2 className="w-4 h-4 group-hover:animate-spin-slow" />
                          <span>Studio Profile</span>
                        </Link>
                        
                        <Link
                          to="/settings/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-light-textSecondary dark:text-gray-300 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="w-4 h-4 group-hover:animate-spin-slow" />
                          <span>Account Settings</span>
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-light-textSecondary dark:text-gray-300 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <LogOut className="w-4 h-4 group-hover:animate-bounce" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-3 h-12 w-12 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  {isOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden border-t border-light-border/30 dark:border-gray-700/30"
              >
                <div className="px-4 pt-4 pb-6 space-y-2 bg-white/50 dark:bg-dark-900/50 backdrop-blur-sm rounded-2xl">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    
                    if (item.isDropdown) {
                      const isOpen = activeDropdown === item.dropdownId
                      
                      return (
                        <div key={item.name} data-studio-dropdown>
                          <button
                            onClick={(e) => toggleDropdown(item.dropdownId, e)}
                            data-studio-dropdown-trigger
                            className={`flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 rounded-xl ${
                              isOpen ? 'bg-light-primary text-white dark:bg-primary-500' : 'text-light-textSecondary dark:text-gray-300 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-4 mt-2 space-y-1"
                                data-studio-dropdown
                              >
                                {item.items.map((dropdownItem) => {
                                  const DropdownIcon = dropdownItem.icon
                                  return (
                                    <Link
                                      key={dropdownItem.name}
                                      to={dropdownItem.href}
                                      className="flex items-center space-x-3 px-4 py-2 text-light-textMuted dark:text-gray-400 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/30 dark:hover:bg-gray-700/30 rounded-lg transition-all duration-200"
                                      onClick={() => {
                                        setActiveDropdown(null)
                                        setIsOpen(false)
                                      }}
                                    >
                                      <DropdownIcon className="w-4 h-4" />
                                      <span className="text-sm">{dropdownItem.name}</span>
                                    </Link>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl ${
                          isActive(item.href)
                            ? 'bg-light-primary text-white dark:bg-primary-500'
                            : 'text-light-textSecondary dark:text-gray-300 hover:text-light-text dark:hover:text-gray-100 hover:bg-light-card/50 dark:hover:bg-gray-700/50'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Notification Center */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <NotificationCenter
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default StudioNavbar
