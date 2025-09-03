import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Input = forwardRef(({
  label,
  error,
  icon,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="form-group">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 dark:text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <motion.input
          ref={ref}
          type={type}
          className={`
            w-full h-12 px-4 py-3 font-medium text-base
            ${icon ? 'pl-10' : 'pl-4'}
            bg-gray-700/50 dark:bg-gray-800/50
            border-2 transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-400 dark:border-red-400 dark:focus:border-red-300' 
              : 'border-gray-600 focus:border-primary-500 dark:border-gray-600 dark:focus:border-primary-400'
            }
            text-white dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-400
            rounded-xl
            focus:ring-2 focus:ring-primary-500/50
            hover:border-gray-500 dark:hover:border-gray-500
            shadow-sm hover:shadow-md focus:shadow-lg
            ${className}
          `}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 dark:text-red-400 mt-1 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
