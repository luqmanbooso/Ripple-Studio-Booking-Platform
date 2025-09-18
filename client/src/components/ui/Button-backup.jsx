import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  // Build class names using our professional CSS classes
  let buttonClasses = 'btn'
  
  // Add variant classes
  buttonClasses += ` btn-${variant}`
  
  // Add size classes
  if (size === 'sm') buttonClasses += ' btn-sm'
  if (size === 'lg') buttonClasses += ' btn-lg'
  
  // Add disabled state
  if (disabled || loading) {
    buttonClasses += ' opacity-50 cursor-not-allowed' 
      shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 
      hover:-translate-y-1
    `,
    danger: `
      bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 
      text-white focus:ring-rose-500/25 
      shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 
      hover:-translate-y-1
    `,
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm h-10',
    md: 'px-6 py-3 text-base h-12',
    lg: 'px-8 py-4 text-lg h-14',
    xl: 'px-10 py-5 text-xl h-16',
  }

  const variantClass = variants[variant] || variants.primary
  const sizeClass = sizes[size] || sizes.md

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`.replace(/\s+/g, ' ').trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      )}
      {icon && !loading && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      <span className="flex items-center">{children}</span>
    </motion.button>
  )
}

export default Button
