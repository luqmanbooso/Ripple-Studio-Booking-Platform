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
  Shield,
  ChevronDown,
  Bell,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Users,
  Building,
  Mic,
  Home,
  Star,
  TrendingUp,
  Globe,
  Phone
} from 'lucide-react'
import { logout } from '../../store/authSlice'
import { disconnectSocket } from '../../lib/socket'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null)
      setIsProfileOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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
      name: 'Discover', 
      href: '/search', 
      icon: Search 
    },
    {
      name: 'Services',
      icon: Music,
      isDropdown: true,
      dropdownId: 'services',
      items: [
        { name: 'Find Artists', href: '/search?type=artists', icon: Mic, description: 'Discover talented musicians and performers' },
        { name: 'Book Studios', href: '/search?type=studios', icon: Building, description: 'Reserve professional recording spaces' },
        { name: 'Browse by Genre', href: '/genres', icon: TrendingUp, description: 'Explore music by style and genre' },
        { name: 'Featured Artists', href: '/featured', icon: Star, description: 'Top-rated and trending musicians' }
      ]
    },
    {
      name: 'Community',
      icon: Users,
      href: '/community'
    },
    {
      name: 'About',
      href: '/about',
      icon: Globe
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: Phone
    },
    {
      name: 'Pricing',
      href: '/pricing',
      icon: TrendingUp
    }
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
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
    <nav className="bg-dark-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-xl font-bold text-gradient hover:scale-105 transition-transform duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:block">MusicBooking</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-4xl mx-8">
            <div className="flex items-center space-x-1 bg-dark-800/50 backdrop-blur-sm rounded-2xl px-2 py-2 border border-gray-700/50">
              {navigation.map((item) => {
                const Icon = item.icon
                
                if (item.isDropdown) {
                  const isOpen = activeDropdown === item.dropdownId
                  
                  return (
                    <div key={item.name} className="relative">
                      <button
                        onClick={(e) => toggleDropdown(item.dropdownId, e)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-700/50 ${
                          isOpen ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-300 hover:text-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 w-80 bg-dark-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 py-3 z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.items.map((dropdownItem, index) => {
                              const DropdownIcon = dropdownItem.icon
                              return (
                                <Link
                                  key={dropdownItem.name}
                                  to={dropdownItem.href}
                                  className="flex items-start space-x-3 px-4 py-3 mx-2 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-200 group"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600/20 to-accent-600/20 rounded-lg flex items-center justify-center group-hover:from-primary-600/30 group-hover:to-accent-600/30 transition-all duration-200">
                                    <DropdownIcon className="w-5 h-5 text-primary-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-100 group-hover:text-primary-300 transition-colors">
                                      {dropdownItem.name}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                      {dropdownItem.description}
                                    </div>
                                  </div>
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
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                      isActive(item.href)
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary-600 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Side - User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-3 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <div className="absolute inset-0 bg-gray-800/0 group-hover:bg-gray-800/50 rounded-xl transition-all duration-200 -z-10" />
                </button>

                {/* Messages */}
                <button className="relative p-3 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                  <MessageSquare className="w-5 h-5" />
                  <div className="absolute inset-0 bg-gray-800/0 group-hover:bg-gray-800/50 rounded-xl transition-all duration-200 -z-10" />
                </button>

                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className="hidden md:flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Admin Link */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden lg:flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary-500/30 transition-all duration-200">
                        {user?.avatar?.url ? (
                          <img 
                            src={user.avatar.url} 
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-medium text-gray-100 truncate max-w-24">
                          {user?.name}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {user?.role}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-dark-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 py-3 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                              {user?.avatar?.url ? (
                                <img 
                                  src={user.avatar.url} 
                                  alt={user.name}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-100 truncate">{user?.name}</p>
                              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                              <span className="inline-block px-2 py-1 mt-1 text-xs bg-primary-900/30 text-primary-300 rounded-lg capitalize">
                                {user?.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/settings/profile"
                            className="flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl text-sm text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-200"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          
                          <Link
                            to="/settings/security"
                            className="flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl text-sm text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-200"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        </div>
                        
                        {/* Logout */}
                        <div className="border-t border-gray-700/50 pt-2 mt-2">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              handleLogout()
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 mx-2 rounded-xl text-sm text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-gray-100 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-800/50"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-3 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200"
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
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-800 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2 bg-dark-900/50 backdrop-blur-sm">
                {/* Mobile Navigation Items */}
                {navigation.map((item) => {
                  const Icon = item.icon
                  
                  if (item.isDropdown) {
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="px-3 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800">
                          {item.name}
                        </div>
                        {item.items.map((dropdownItem) => {
                          const DropdownIcon = dropdownItem.icon
                          return (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.href}
                              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200"
                              onClick={() => setIsOpen(false)}
                            >
                              <DropdownIcon className="w-5 h-5 text-primary-400" />
                              <div>
                                <div>{dropdownItem.name}</div>
                                <div className="text-sm text-gray-500">{dropdownItem.description}</div>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-primary-400 bg-primary-900/20'
                          : 'text-gray-300 hover:text-gray-100 hover:bg-gray-800/50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                {/* Mobile Auth Section */}
                <div className="border-t border-gray-800 pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      {/* Mobile Profile */}
                      <div className="px-4 py-3 mb-3 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                            {user?.avatar?.url ? (
                              <img 
                                src={user.avatar.url} 
                                alt={user.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-100">{user?.name}</div>
                            <div className="text-sm text-gray-400">{user?.email}</div>
                            <span className="inline-block px-2 py-1 mt-1 text-xs bg-primary-900/30 text-primary-300 rounded-lg capitalize">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Menu Items */}
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Calendar className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <Shield className="w-5 h-5" />
                          <span>Admin</span>
                        </Link>
                      )}
                      
                      <Link
                        to="/settings/profile"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-200 mb-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
