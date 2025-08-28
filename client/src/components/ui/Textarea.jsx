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
        <label className="form-label">
          {label}
        </label>
      )}
      <motion.textarea
        ref={ref}
        rows={rows}
        className={`
          textarea-field
          ${error ? 'border-error-500 dark:border-error-400 focus:border-error-500 dark:focus:border-error-400 focus:ring-error-500/50' : ''}
          ${className}
        `}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
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

Textarea.displayName = 'Textarea'

export default Textarea
