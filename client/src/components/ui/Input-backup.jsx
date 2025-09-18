import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Input = forwardRef(({
  label,
  error,
  icon,
  className = '',
  type = 'text',
  variant = 'default',
  ...props
}, ref) => {
  return (
    <div className="space-y-2 mb-6">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 leading-tight">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className="text-gray-400 dark:text-slate-400">
              {icon}
            </div>
          </div>
        )}
        <motion.input
          ref={ref}
          type={type}
          className={`
            input-field
            ${icon ? 'pl-12' : 'pl-4'}
            ${error 
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-400 dark:focus:border-rose-400' 
              : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:focus:border-indigo-400'
            }
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
          className="text-sm text-rose-500 dark:text-rose-400 mt-2 font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
