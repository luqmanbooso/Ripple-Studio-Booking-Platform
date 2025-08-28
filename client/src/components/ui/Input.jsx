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
    <div className="space-y-2">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-500 dark:text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <motion.input
          ref={ref}
          type={type}
          className={`
            input-field
            ${icon ? 'pl-10' : 'pl-4'}
            ${error ? 'border-error-500 dark:border-error-400 focus:border-error-500 dark:focus:border-error-400 focus:ring-error-500/50' : ''}
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
          className="form-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
