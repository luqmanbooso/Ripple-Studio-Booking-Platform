import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Palette, 
  Globe,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react'
import { useSelector } from 'react-redux'

const Settings = () => {
  const { user } = useSelector(state => state.auth)
  const location = useLocation()

  const settingsCategories = [
    {
      title: 'Account',
      description: 'Manage your personal information and account preferences',
      items: [
        {
          name: 'Profile',
          description: 'Update your personal information, bio, and profile picture',
          href: '/settings/profile',
          icon: User,
          color: 'bg-blue-500'
        },
        {
          name: 'Security',
          description: 'Password, two-factor authentication, and security settings',
          href: '/settings/security',
          icon: Shield,
          color: 'bg-green-500'
        }
      ]
    },
    {
      title: 'Preferences',
      description: 'Customize your experience and manage communications',
      items: [
        {
          name: 'Notifications',
          description: 'Control email, push, and in-app notification preferences',
          href: '/settings/notifications',
          icon: Bell,
          color: 'bg-yellow-500'
        },
        {
          name: 'Appearance',
          description: 'Theme, language, and display preferences',
          href: '/settings/appearance',
          icon: Palette,
          color: 'bg-purple-500'
        }
      ]
    },
    {
      title: 'Billing & Payments',
      description: 'Manage your payment methods and billing information',
      items: [
        {
          name: 'Payment Methods',
          description: 'Add, edit, or remove payment methods',
          href: '/settings/payments',
          icon: CreditCard,
          color: 'bg-indigo-500'
        },
        {
          name: 'Spending History',
          description: 'View your transaction history and download receipts',
          href: '/spending-history',
          icon: CreditCard,
          color: 'bg-pink-500'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container py-8 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
              <p className="text-gray-300 text-lg">
                Manage your account preferences and customize your experience
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Categories */}
        <div className="space-y-8">
          {settingsCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{category.title}</h2>
                <p className="text-gray-300">{category.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {category.items.map((item, itemIndex) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                    >
                      <Link
                        to={item.href}
                        className="block group"
                      >
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                                  {item.name}
                                </h3>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                              </div>
                              <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Account Summary */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Account Summary</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-sm text-gray-300 mb-1">Account Type</div>
                <div className="text-lg font-semibold text-white capitalize">{user.role || 'Client'}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-sm text-gray-300 mb-1">Member Since</div>
                <div className="text-lg font-semibold text-white">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-sm text-gray-300 mb-1">Email Status</div>
                <div className="text-lg font-semibold text-white">
                  {user.isEmailVerified ? (
                    <span className="text-green-400">Verified</span>
                  ) : (
                    <span className="text-yellow-400">Pending</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Settings