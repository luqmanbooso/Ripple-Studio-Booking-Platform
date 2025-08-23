import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Textarea = forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <motion.textarea
        ref={ref}
        rows={rows}
        className={`
          input-field w-full resize-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
