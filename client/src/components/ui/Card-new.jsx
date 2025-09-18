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
  // Build class names using our professional CSS classes
  let cardClasses = 'card'
  
  // Add variant classes
  if (variant === 'glass') cardClasses += ' card-glass'
  if (variant === 'featured') cardClasses += ' card-featured'
  
  // Add custom classes
  if (className) {
    cardClasses += ` ${className}`
  }
  
  const CardComponent = onClick || hover ? motion.div : 'div'
  
  const motionProps = {
    whileHover: hover ? { 
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" }
    } : undefined,
    whileTap: onClick ? { 
      scale: 0.98,
      transition: { duration: 0.1 }
    } : undefined
  }

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...(CardComponent === motion.div ? motionProps : {})}
      {...props}
    >
      {children}
    </CardComponent>
  )
}

export default Card