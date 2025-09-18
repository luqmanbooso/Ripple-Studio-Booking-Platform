import React, { forwardRef } from 'react'

const Input = forwardRef(({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  className = '',
  icon,
  label,
  helperText,
  ...props 
}, ref) => {
  let inputClasses = 'input'
  
  if (error) {
    inputClasses += ' border-red-500 focus:border-red-500 focus:ring-red-500/20'
  }
  
  if (disabled) {
    inputClasses += ' opacity-50 cursor-not-allowed'
  }
  
  if (className) {
    inputClasses += ` ${className}`
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${inputClasses} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      
      {helperText && (
        <p className={`text-xs ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input