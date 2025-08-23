import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const Rating = ({ 
  value = 0, 
  onChange, 
  readonly = false, 
  size = 'md',
  className = '' 
}) => {
  const [hoverValue, setHoverValue] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const sizeClass = sizes[size] || sizes.md

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0)
    }
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const filled = (hoverValue || value) >= rating
        return (
          <motion.button
            key={rating}
            type="button"
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
              transition-colors duration-200
            `}
          >
            <Star 
              className={`
                ${sizeClass}
                ${filled 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-600'
                }
                ${!readonly ? 'hover:text-yellow-300' : ''}
              `} 
            />
          </motion.button>
        )
      })}
    </div>
  )
}

export default Rating
