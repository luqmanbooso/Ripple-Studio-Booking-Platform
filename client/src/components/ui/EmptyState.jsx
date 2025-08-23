import React from 'react'
import { motion } from 'framer-motion'
import Button from './Button'

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-600" />
        </div>
      )}
      
      {title && (
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && action}
    </motion.div>
  )
}

export default EmptyState
