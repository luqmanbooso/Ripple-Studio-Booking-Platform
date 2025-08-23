import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  onClick,
  ...props 
}) => {
  const baseClasses = 'card'
  const hoverClasses = hover ? 'hover:border-primary-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer' : ''
  
  const CardComponent = onClick ? motion.div : 'div'
  
  return (
    <CardComponent
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      whileHover={hover && onClick ? { y: -5, scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </CardComponent>
  )
}

export default Card
