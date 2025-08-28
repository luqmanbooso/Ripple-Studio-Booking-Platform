import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { 
  Search, 
  Music, 
  Mic, 
  Headphones, 
  Star, 
  MapPin, 
  Calendar,
  ArrowRight,
  Play,
  Users,
  Award,
  Zap,
  Heart,
  TrendingUp,
  Globe,
  Shield,
  Clock,
  Volume2,
  Waves
} from 'lucide-react'
import Button from '../components/ui/Button'
import MusicVisualizer from '../components/common/MusicVisualizer'
import FloatingMusicNotes from '../components/common/FloatingMusicNotes'
import VibratingElements from '../components/common/VibratingElements'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const isInView = useInView(heroRef, { once: true })

  // Advanced scroll animations
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const ySpring = useSpring(y1, springConfig)

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchType !== 'all') params.set('type', searchType)
    navigate(`/search?${params.toString()}`)
  }

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'AI-Powered Discovery',
      description: 'Advanced algorithms match you with perfect artists based on style, location, and creative vision',
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      delay: 0.1
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Real-Time Booking',
      description: 'Instant availability updates with seamless booking and secure payment processing',
      color: 'from-purple-500 via-pink-500 to-rose-500',
      delay: 0.2
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Network',
      description: 'All artists and studios are verified with authentic reviews from the global music community',
      color: 'from-green-500 via-emerald-500 to-teal-500',
      delay: 0.3
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Live Collaboration',
      description: 'Real-time chat, file sharing, and project management tools for seamless creative workflows',
      color: 'from-yellow-500 via-orange-500 to-red-500',
      delay: 0.4
    }
  ]

  const stats = [
    { number: '25K+', label: 'Artists Worldwide', icon: Mic, color: 'from-primary-500 to-accent-500' },
    { number: '12K+', label: 'Recording Studios', icon: Music, color: 'from-accent-500 to-highlight-500' },
    { number: '150K+', label: 'Sessions Completed', icon: Headphones, color: 'from-highlight-500 to-primary-500' },
    { number: '4.9★', label: 'Average Rating', icon: Star, color: 'from-success-500 to-info-500' }
  ]

  const testimonials = [
    {
      text: "This platform revolutionized how I collaborate with artists globally. The AI matching is incredible!",
      author: "Sarah Chen",
      role: "Grammy-nominated Producer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      text: "As a studio owner, this increased our bookings by 400%. The platform is intuitive and powerful.",
      author: "Marcus Johnson",
      role: "Abbey Road Studios",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      text: "Found my dream collaborators here. The real-time tools made remote recording feel local.",
      author: "Emily Rodriguez",
      role: "Billboard Artist",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      rating: 5
    }
  ]

  const trendingGenres = [
    { name: 'Afrobeats', growth: '+85%', color: 'bg-gradient-to-r from-orange-500 to-red-500' },
    { name: 'Lo-Fi Hip Hop', growth: '+67%', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { name: 'Synthwave', growth: '+54%', color: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
    { name: 'Neo-Soul', growth: '+42%', color: 'bg-gradient-to-r from-green-500 to-teal-500' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Complex animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 1.2,
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Enhanced Floating Music Notes */}
      <FloatingMusicNotes count={12} />

      {/* Advanced Particle System */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-primary-500/30 to-accent-500/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              y: [null, -100, null],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Hero Section with Complex Animations */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center">
        {/* Dynamic Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950"
          style={{ y: ySpring, opacity, scale }}
        />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(233, 30, 99, 0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Complex Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 0,
                scale: 0
              }}
              animate={{ 
                y: [null, -200, null],
                rotate: [0, 360, 720],
                scale: [0, 1, 0],
                opacity: [0, 0.4, 0]
              }}
              transition={{ 
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            >
              <div className="w-32 h-32 border border-primary-500/20 rounded-full" />
            </motion.div>
          ))}
        </div>

        <div className="relative container text-center z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Enhanced Title with 3D Effect */}
            <motion.div
              variants={titleVariants}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-tight">
                <motion.span 
                  className="block bg-gradient-to-r from-primary-400 via-accent-400 to-highlight-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Where Music
                </motion.span>
                <motion.span 
                  className="block mt-4 bg-gradient-to-r from-accent-400 via-highlight-400 to-primary-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['100% 50%', '0% 50%', '100% 50%']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Comes Alive
                </motion.span>
              </h1>
              
              {/* Animated Underline with Music Visualizer */}
              <motion.div
                className="flex justify-center mt-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 1 }}
              >
                <div className="relative">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-primary-500 via-accent-500 to-highlight-500 rounded-full"
                    style={{ width: '300px' }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(233, 30, 99, 0.5)',
                        '0 0 40px rgba(233, 30, 99, 0.8)',
                        '0 0 20px rgba(233, 30, 99, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <MusicVisualizer bars={15} height={25} color="gradient" />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Enhanced Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-300 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Connect with world-class artists and state-of-the-art studios.
              <br className="hidden md:block" />
              <motion.span
                animate={{ color: ['#rgb(156 163 175)', '#rgb(233 30 99)', '#rgb(156 163 175)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Create, collaborate, and bring your musical vision to life.
              </motion.span>
            </motion.p>

            {/* Interactive Search with Advanced Animations */}
            <motion.div
              variants={itemVariants}
              className="max-w-6xl mx-auto"
            >
              <motion.form 
                onSubmit={handleSearch} 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-primary-500/20">
                  {/* Animated Background Gradient */}
                  <motion.div 
                    className="absolute inset-0 opacity-30"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(233, 30, 99, 0.1), rgba(0, 201, 255, 0.1))',
                        'linear-gradient(135deg, rgba(0, 201, 255, 0.1), rgba(156, 39, 176, 0.1))',
                        'linear-gradient(225deg, rgba(156, 39, 176, 0.1), rgba(233, 30, 99, 0.1))',
                        'linear-gradient(315deg, rgba(233, 30, 99, 0.1), rgba(0, 201, 255, 0.1))'
                      ]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row gap-6">
                    {/* Search Input with Floating Label */}
                    <div className="flex-1 relative group">
                      <motion.div
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Search className="w-6 h-6 text-primary-400" />
                      </motion.div>
                      
                      <motion.input
                        type="text"
                        placeholder="Search for artists, studios, or genres..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white/10 dark:bg-dark-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-600/30 rounded-2xl text-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        whileFocus={{ scale: 1.02, borderColor: '#E91E63' }}
                        transition={{ duration: 0.2 }}
                      />
                      
                      {/* Floating Visualizer */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <MusicVisualizer bars={4} height={20} color="primary" animated={searchQuery.length > 0} />
                      </div>
                    </div>

                    {/* Enhanced Category Select */}
                    <div className="lg:w-64 relative">
                      <motion.select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="w-full py-5 px-6 bg-white/10 dark:bg-dark-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-600/30 rounded-2xl text-lg text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
                        whileFocus={{ scale: 1.02 }}
                      >
                        <option value="all" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Categories</option>
                        <option value="artists" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Artists</option>
                        <option value="studios" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Studios</option>
                      </motion.select>
                    </div>

                    {/* Interactive Discover Button */}
                    <VibratingElements intensity="medium">
                      <motion.button
                        type="submit"
                        className="group relative lg:w-auto px-12 py-5 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-2xl overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-highlight-500/20"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                        <span className="relative z-10 flex items-center">
                          <Search className="w-6 h-6 mr-3 group-hover:animate-spin" />
                          Discover
                          <motion.div
                            className="ml-2"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </span>
                      </motion.button>
                    </VibratingElements>
                  </div>
                </div>
              </motion.form>
            </motion.div>

            {/* Interactive Genre Tags */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 mt-12"
            >
              {['Hip Hop', 'Electronic', 'Jazz', 'Rock', 'R&B', 'Pop'].map((genre, index) => (
                <motion.button
                  key={genre}
                  onClick={() => {
                    setSearchQuery(genre)
                    setSearchType('all')
                  }}
                  className="group relative px-6 py-3 bg-white/5 dark:bg-dark-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30 rounded-full text-gray-300 dark:text-gray-300 hover:text-primary-300 dark:hover:text-primary-400 transition-all duration-300 overflow-hidden"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + index * 0.1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10 font-medium">{genre}</span>
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"
                  />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            className="relative"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-8 h-12 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center relative overflow-hidden">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-4 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full mt-2"
              />
            </div>
            {/* Pulsing rings */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 border-2 border-primary-500/30 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.2, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: ring * 0.3
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section ref={statsRef} className="py-32 bg-gradient-to-r from-gray-50 to-white dark:from-dark-900/50 dark:to-dark-800/50 backdrop-blur-sm transition-colors duration-500 relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -15, 
                    scale: 1.05,
                    rotateX: 5,
                    rotateY: 5
                  }}
                  className="text-center group cursor-pointer perspective-1000"
                >
                  <div className="relative">
                    <motion.div 
                      className={`w-24 h-24 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
                      whileHover={{ 
                        boxShadow: '0 20px 40px rgba(233, 30, 99, 0.4)' 
                      }}
                    >
                      <Icon className="w-12 h-12 text-white group-hover:animate-bounce z-10" />
                      
                      {/* Animated background pattern */}
                      <motion.div
                        className="absolute inset-0 opacity-20"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
                      </motion.div>
                      
                      {/* Particle burst on hover */}
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{
                          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
                        }}
                      />
                    </motion.div>
                    
                    {/* Floating rings */}
                    <motion.div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-primary-500/20 rounded-full opacity-0 group-hover:opacity-100"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  
                  <motion.div 
                    className={`text-5xl lg:text-6xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.5 
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 dark:text-gray-400 font-semibold text-lg group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                    {stat.label}
                  </div>
                  
                  {/* Interactive music visualizer */}
                  <motion.div
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <MusicVisualizer bars={6} height={20} color="primary" />
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="section-title gradient-text"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Revolutionary Features
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Cutting-edge technology meets creative passion. Experience the future of music collaboration.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, rotateY: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: feature.delay,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.03,
                  rotateX: 5,
                  rotateY: index % 2 === 0 ? 5 : -5
                }}
                className="group cursor-pointer perspective-1000"
              >
                <div className="floating-card h-full relative overflow-hidden">
                  {/* Animated background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
                      whileHover={{ 
                        rotate: [0, 5, -5, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-white relative z-10">
                        {feature.icon}
                      </div>
                      
                      {/* Rotating background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg"
                      whileHover={{ x: 10 }}
                      transition={{ delay: 0.1 }}
                    >
                      {feature.description}
                    </motion.p>
                    
                    {/* Interactive elements */}
                    <motion.div
                      className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center text-primary-500 dark:text-primary-400 font-medium">
                        <span>Learn more</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Trending Section */}
      <section className="py-24 bg-gradient-to-r from-primary-500/5 to-accent-500/5 dark:from-primary-500/10 dark:to-accent-500/10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              <motion.span
                className="inline-flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="w-10 h-10 mr-3 text-primary-500" />
                Trending Globally
              </motion.span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover what's hot in the music world right now
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingGenres.map((genre, index) => (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  rotateX: 5
                }}
                className="glass-card p-6 text-center cursor-pointer group relative overflow-hidden"
              >
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 ${genre.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-4 h-4 ${genre.color} rounded-full mx-auto mb-4 group-hover:shadow-lg`}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                    {genre.name}
                  </h3>
                  <motion.span 
                    className="text-success-500 font-bold text-lg"
                    animate={{ 
                      color: ['rgb(76, 175, 80)', 'rgb(233, 30, 99)', 'rgb(76, 175, 80)'] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  >
                    {genre.growth}
                  </motion.span>
                  
                  {/* Music visualizer for each trending genre */}
                  <motion.div
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <MusicVisualizer bars={8} height={15} color="accent" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials with 3D Cards */}
      <section className="py-32 relative overflow-hidden">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="section-title gradient-text">
              Loved by Creators Worldwide
            </h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100, rotateY: -30 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -100, rotateY: 30 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="glass-card p-12 text-center relative overflow-hidden group"
              whileHover={{ scale: 1.02, rotateX: 2 }}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-accent-500/5 to-highlight-500/5"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundSize: '200% 200%' }}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className="text-6xl text-primary-400 mb-6"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  "
                </motion.div>
                
                <motion.p 
                  className="text-2xl text-gray-700 dark:text-gray-300 mb-8 italic leading-relaxed max-w-4xl mx-auto"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {testimonials[currentTestimonial].text}
                </motion.p>
                
                <div className="flex items-center justify-center space-x-6">
                  <motion.img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].author}
                    className="w-20 h-20 rounded-full border-4 border-primary-500 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(233, 30, 99, 0.3)',
                        '0 0 40px rgba(233, 30, 99, 0.6)',
                        '0 0 20px rgba(233, 30, 99, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div>
                    <motion.div 
                      className="font-bold text-xl text-gray-900 dark:text-gray-100"
                      whileHover={{ x: 5 }}
                    >
                      {testimonials[currentTestimonial].author}
                    </motion.div>
                    <motion.div 
                      className="text-primary-500 font-medium"
                      whileHover={{ x: 5 }}
                      transition={{ delay: 0.1 }}
                    >
                      {testimonials[currentTestimonial].role}
                    </motion.div>
                    
                    {/* Animated rating stars */}
                    <div className="flex justify-center mt-2 space-x-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced testimonial navigation */}
            <div className="flex justify-center space-x-4 mt-12">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-primary-500 shadow-neon' 
                      : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={index === currentTestimonial ? {
                    boxShadow: [
                      '0 0 10px rgba(233, 30, 99, 0.5)',
                      '0 0 20px rgba(233, 30, 99, 0.8)',
                      '0 0 10px rgba(233, 30, 99, 0.5)'
                    ]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-accent-900/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, rgba(233, 30, 99, 0.3) 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </div>
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h2 
              className="text-5xl md:text-7xl font-bold gradient-text mb-8"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Ready to Create Magic?
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Join <motion.span 
                className="font-bold text-primary-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                25,000+
              </motion.span> artists, producers, and studios already creating amazing music together. 
              <br className="hidden md:block" />
              Your next breakthrough is just a click away.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register">
                  <button className="group relative px-12 py-5 text-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-2xl overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-highlight-500/20"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Start Creating Free
                      <motion.div
                        className="ml-3"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="w-6 h-6" />
                      </motion.div>
                    </span>
                  </button>
                </Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/search">
                  <button className="group px-12 py-5 text-xl font-semibold text-gray-900 dark:text-gray-100 bg-white/10 dark:bg-dark-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-600/30 hover:bg-white/20 dark:hover:bg-dark-800/50 rounded-2xl transition-all duration-300">
                    <span className="flex items-center">
                      <Play className="w-6 h-6 mr-3 group-hover:animate-spin" />
                      Explore Now
                    </span>
                  </button>
                </Link>
              </motion.div>
            </div>
            
            {/* Trust indicators */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Verified Artists</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                <span>Global Network</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
