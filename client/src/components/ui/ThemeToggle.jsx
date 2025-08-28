import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Palette } from 'lucide-react'
import { toggleTheme } from '../../store/themeSlice'

const ThemeToggle = ({ size = 'md', showLabel = false }) => {
  const { mode } = useSelector((state) => state.theme)
  const dispatch = useDispatch()

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleToggle = () => {
    dispatch(toggleTheme())
  }

  return (
    <div className="flex items-center space-x-2">
      <motion.button
        onClick={handleToggle}
        className={`
          ${sizes[size]}
          relative rounded-xl
          bg-gradient-to-r from-primary-500 to-accent-500
          hover:from-primary-600 hover:to-accent-600
          dark:from-primary-400 dark:to-accent-400
          dark:hover:from-primary-300 dark:hover:to-accent-300
          transition-all duration-300
          flex items-center justify-center
          shadow-lg hover:shadow-neon
          group
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait">
          {mode === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className={`${iconSizes[size]} text-white group-hover:animate-spin-slow`} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className={`${iconSizes[size]} text-white group-hover:animate-wiggle`} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-300 to-accent-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      </motion.button>
      
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
        >
          {mode} mode
        </motion.span>
      )}
    </div>
  )
}

export default ThemeToggle
