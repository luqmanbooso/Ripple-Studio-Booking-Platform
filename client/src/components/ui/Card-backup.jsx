import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true, 
  onClick,
  ...props 
}) => {
  const variants = {
    default: 'card',
    glass: 'glass-card',
    featured: 'featured-card'
  }
  
  const baseClasses = variants[variant] || variants.default
  const hoverClasses = hover ? 'hover:shadow-2xl cursor-pointer' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  
  const CardComponent = onClick ? motion.div : 'div'
  
  return (
    <CardComponent
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {children}
    </CardComponent>
  )
}

export default Card
