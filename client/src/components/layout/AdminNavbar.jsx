import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Shield,
  LogOut,
  Bell,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Star,
  BarChart3,
  Home,
  Settings,
  Image,
  Wrench,
} from "lucide-react"
import toast from "react-hot-toast"

import Button from '../ui/Button'
import NotificationBell from '../common/NotificationBell'
import { logout } from '../../store/authSlice'

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleDropdown = (dropdownId, event) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDropdown = event.target.closest('[data-admin-dropdown]') || 
                                   event.target.closest('button[data-admin-dropdown-trigger]');
      
      if (!isClickInsideDropdown) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminNavItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { 
      name: "Studios", 
      icon: Building2,
      isDropdown: true,
      dropdownId: 'studios',
      items: [
        { name: "All Studios", href: "/admin/studios", icon: Building2, description: "Manage studio listings and approvals" },
        { name: "Media Manager", href: "/admin/media", icon: Image, description: "Manage studio media files" },
        { name: "Equipment Manager", href: "/admin/equipment", icon: Wrench, description: "Track studio equipment inventory" }
      ]
    },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Revenue", href: "/admin/revenue", icon: DollarSign },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Feedback", href: "/admin/feedback", icon: BarChart3 },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-2">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center -ml-12 mr-0">
            <Link to="/admin" className="flex items-center">
              <img
                src="/logo.png"
                alt="Ripple Logo"
                className="h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center p-4 space-x-2 mr-8">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              
              if (item.isDropdown) {
                const isOpen = activeDropdown === item.dropdownId;
                const isActive = item.items.some(subItem => location.pathname === subItem.href);
                
                return (
                  <div key={item.name} className="relative" data-admin-dropdown>
                    <button
                      onClick={(e) => toggleDropdown(item.dropdownId, e)}
                      data-admin-dropdown-trigger
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive || isOpen
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                          : "text-gray-300 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isOpen && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50"
                        data-admin-dropdown
                      >
                        {item.items.map((dropdownItem) => {
                          const DropdownIcon = dropdownItem.icon;
                          const isSubActive = location.pathname === dropdownItem.href;
                          return (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.href}
                              className={`flex items-start space-x-3 px-4 py-3 text-sm transition-all duration-200 ${
                                isSubActive
                                  ? "bg-purple-600/20 text-purple-300 border-r-2 border-purple-500"
                                  : "text-gray-300 hover:text-white hover:bg-slate-700"
                              }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              <DropdownIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{dropdownItem.name}</div>
                                <div className="text-xs text-gray-400 mt-1">{dropdownItem.description}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search admin panel..."
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || "Admin"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2">
                  <Link
                    to="/admin/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-slate-700 my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800">
            <div className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
