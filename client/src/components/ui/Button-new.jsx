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
  }
  
  // Add custom classes
  if (className) {
    buttonClasses += ` ${className}`
  }

  const ButtonContent = () => (
    <>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {icon && !loading && icon}
      {children}
    </>
  )

  if (props.href || props.to) {
    return (
      <motion.a
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={buttonClasses}
        {...props}
      >
        <ButtonContent />
      </motion.a>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      <ButtonContent />
    </motion.button>
  )
}

export default Button