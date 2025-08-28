import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

const ParticleBackground = () => {
  const canvasRef = useRef(null)
  const { mode, particleEffects } = useSelector((state) => state.theme)
  const animationRef = useRef()
  const particlesRef = useRef([])

  useEffect(() => {
    if (!particleEffects) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.1
        this.color = this.getRandomColor()
      }

      getRandomColor() {
        const colors = mode === 'dark' 
          ? ['#E91E63', '#00C9FF', '#9C27B0'] 
          : ['rgba(233, 30, 99, 0.3)', 'rgba(0, 201, 255, 0.3)', 'rgba(156, 39, 176, 0.3)']
        return colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around edges
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height

        // Pulse opacity
        this.opacity += (Math.random() - 0.5) * 0.01
        this.opacity = Math.max(0.1, Math.min(0.6, this.opacity))
      }

      draw() {
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles
    const createParticles = () => {
      particlesRef.current = []
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000))
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle())
      }
    }

    createParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections between nearby particles
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.globalAlpha = 0.1 * (1 - distance / 100)
            ctx.strokeStyle = mode === 'dark' ? '#E91E63' : 'rgba(233, 30, 99, 0.2)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mode, particleEffects])

  if (!particleEffects) return null

  return (
    <canvas
      ref={canvasRef}
      className="particles-container"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1
      }}
    />
  )
}

export default ParticleBackground
