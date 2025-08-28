import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

const MusicVisualizer = ({ 
  bars = 20, 
  height = 40, 
  className = '', 
  color = 'primary',
  animated = true 
}) => {
  const { mode, animations } = useSelector((state) => state.theme)
  const barsRef = useRef([])

  const colorVariants = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600', 
    highlight: 'from-highlight-500 to-highlight-600',
    success: 'from-success-500 to-success-600',
    gradient: 'from-primary-500 via-accent-500 to-highlight-500'
  }

  useEffect(() => {
    if (!animated || !animations) return

    const interval = setInterval(() => {
      barsRef.current.forEach((bar, index) => {
        if (bar) {
          const randomHeight = Math.random() * height + 10
          const delay = index * 50
          setTimeout(() => {
            bar.style.height = `${randomHeight}px`
          }, delay)
        }
      })
    }, 800)

    return () => clearInterval(interval)
  }, [animated, animations, height])

  return (
    <div className={`flex items-end justify-center space-x-1 ${className}`}>
      {Array.from({ length: bars }).map((_, index) => (
        <motion.div
          key={index}
          ref={(el) => (barsRef.current[index] = el)}
          className={`w-1 bg-gradient-to-t ${colorVariants[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ 
            height: animated ? Math.random() * height + 10 : height / 2,
            animationDelay: `${index * 0.1}s`
          }}
          initial={{ height: 5 }}
          animate={animated && animations ? {
            height: [5, Math.random() * height + 10, 5],
            opacity: [0.5, 1, 0.5]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )
}

export default MusicVisualizer
