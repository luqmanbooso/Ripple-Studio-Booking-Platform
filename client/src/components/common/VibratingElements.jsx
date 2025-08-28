import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

const VibratingElements = ({ children, intensity = 'medium', trigger = 'hover' }) => {
  const { animations } = useSelector((state) => state.theme)

  const intensityMap = {
    low: { x: [-1, 1, -1], y: [-1, 1, -1] },
    medium: { x: [-2, 2, -2], y: [-2, 2, -2] },
    high: { x: [-3, 3, -3], y: [-3, 3, -3] }
  }

  const vibration = intensityMap[intensity]

  if (!animations) return children

  const animationProps = trigger === 'hover' ? {
    whileHover: {
      x: vibration.x,
      y: vibration.y,
      transition: {
        duration: 0.1,
        repeat: 3,
        repeatType: 'reverse'
      }
    }
  } : {
    animate: {
      x: vibration.x,
      y: vibration.y,
      transition: {
        duration: 0.1,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  }

  return (
    <motion.div {...animationProps}>
      {children}
    </motion.div>
  )
}

export default VibratingElements
