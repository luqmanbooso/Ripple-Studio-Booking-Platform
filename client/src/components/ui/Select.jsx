import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
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
        <motion.select
          ref={ref}
          className={`
            select-field
            ${error ? 'border-error-500 dark:border-error-400 focus:border-error-500 dark:focus:border-error-400 focus:ring-error-500/50' : ''}
            ${className}
          `}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-500 dark:text-gray-400">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {option.label}
            </option>
          ))}
        </motion.select>
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

Select.displayName = 'Select'

export default Select
