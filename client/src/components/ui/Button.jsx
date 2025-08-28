import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-950 relative overflow-hidden group'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white shadow-lg hover:shadow-neon focus:ring-primary-500/50 transform hover:-translate-y-0.5 active:scale-95',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:ring-gray-500/50',
    outline: 'border-2 border-primary-500 hover:border-primary-600 text-primary-500 hover:text-white hover:bg-primary-500 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-dark-950 focus:ring-primary-500/50 hover:shadow-neon',
    ghost: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500/50',
    success: 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg hover:shadow-lg focus:ring-success-500/50 transform hover:-translate-y-0.5',
    error: 'bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-lg hover:shadow-lg focus:ring-error-500/50 transform hover:-translate-y-0.5'
  }
  
  const sizes = {
    xs: 'text-xs px-3 py-2',
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4',
    xl: 'text-xl px-10 py-5'
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Animated background for primary variant */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-highlight-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      )}
      
      <span className="relative z-10 flex items-center">
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </span>
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button
