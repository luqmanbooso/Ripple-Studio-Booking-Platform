import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Music2, Music3, Music4 } from 'lucide-react'
import { useSelector } from 'react-redux'

const FloatingMusicNotes = ({ count = 6, className = '' }) => {
  const [notes, setNotes] = useState([])
  const { animations, particleEffects } = useSelector((state) => state.theme)

  const musicIcons = [Music, Music2, Music3, Music4]

  useEffect(() => {
    if (!animations || !particleEffects) return

    const generateNotes = () => {
      const newNotes = Array.from({ length: count }).map((_, index) => ({
        id: index,
        Icon: musicIcons[Math.floor(Math.random() * musicIcons.length)],
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 20 + 20,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.3 + 0.1,
        color: ['text-light-primary', 'text-light-accent', 'text-light-highlight'][Math.floor(Math.random() * 3)]
      }))
      setNotes(newNotes)
    }

    generateNotes()
    const interval = setInterval(generateNotes, 15000) // Regenerate every 15 seconds

    return () => clearInterval(interval)
  }, [count, animations, particleEffects])

  if (!animations || !particleEffects) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {notes.map((note) => {
          const Icon = note.Icon
          return (
            <motion.div
              key={note.id}
              className={`absolute ${note.color}`}
              style={{
                left: note.x,
                top: note.y,
                fontSize: note.size,
                opacity: note.opacity
              }}
              initial={{ 
                y: window.innerHeight + 100,
                rotate: 0,
                scale: 0
              }}
              animate={{ 
                y: -100,
                rotate: [0, 180, 360],
                scale: [0, 1, 0],
                x: [note.x, note.x + Math.random() * 200 - 100]
              }}
              transition={{
                duration: note.duration,
                delay: note.delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 10,
                ease: 'easeInOut'
              }}
            >
              <Icon size={note.size} />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default FloatingMusicNotes
