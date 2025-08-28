import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
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
  Clock
} from 'lucide-react'
import Button from '../components/ui/Button'
import MusicVisualizer from '../components/common/MusicVisualizer'
import FloatingMusicNotes from '../components/common/FloatingMusicNotes'
import VibratingElements from '../components/common/VibratingElements'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])

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
      title: 'Smart Discovery',
      description: 'AI-powered search to find your perfect musical match based on style, location, and vibe',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Instant Booking',
      description: 'Real-time availability with seamless booking and secure payment processing',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Professionals',
      description: 'All artists and studios are verified with authentic reviews from the community',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-time Collaboration',
      description: 'Live chat, file sharing, and project management tools for seamless collaboration',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const stats = [
    { number: '15K+', label: 'Artists', icon: Mic },
    { number: '8K+', label: 'Studios', icon: Music },
    { number: '100K+', label: 'Sessions', icon: Headphones },
    { number: '4.9★', label: 'Avg Rating', icon: Star }
  ]

  const testimonials = [
    {
      text: "This platform revolutionized how I book recording sessions. The quality of artists is incredible!",
      author: "Sarah Chen",
      role: "Independent Artist",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
    },
    {
      text: "As a studio owner, this has increased our bookings by 300%. The platform is intuitive and professional.",
      author: "Marcus Johnson",
      role: "Studio Owner",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      text: "Found my dream producer through this platform. The collaboration tools made remote recording seamless.",
      author: "Emily Rodriguez",
      role: "Singer-Songwriter",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ]

  const trendingGenres = [
    { name: 'Lo-Fi Hip Hop', growth: '+45%', color: 'bg-purple-500' },
    { name: 'Indie Pop', growth: '+32%', color: 'bg-pink-500' },
    { name: 'Electronic', growth: '+28%', color: 'bg-blue-500' },
    { name: 'R&B Soul', growth: '+25%', color: 'bg-green-500' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen relative">
      {/* Floating Music Notes */}
      <FloatingMusicNotes count={8} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 transition-colors duration-500" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-primary-500/10 dark:text-primary-500/20"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 0,
                scale: 0
              }}
              animate={{ 
                y: [null, -100, null],
                rotate: [0, 360, 0],
                scale: [0, 1, 0],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ 
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            >
              <Music className="w-12 h-12" />
            </motion.div>
          ))}
        </div>

        <div className="relative container text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <VibratingElements intensity="low">
              <motion.h1 
                className="hero-title mb-6 leading-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
              >
                Where Music
                <br />
                <span className="relative inline-block">
                  Comes Alive
                  <motion.div
                    className="absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                  />
                  {/* Music Visualizer under text */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <MusicVisualizer bars={12} height={30} color="gradient" />
                  </div>
                </span>
              </motion.h1>
            </VibratingElements>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Connect with world-class artists and state-of-the-art studios. 
              <br className="hidden md:block" />
              Create, collaborate, and bring your musical vision to life.
            </motion.p>

            {/* Enhanced Search with Music Visualizer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleSearch} className="glass-card p-8 rounded-3xl relative overflow-hidden">
                {/* Animated Background */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 dark:from-primary-500/10 dark:to-accent-500/10"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 8,
                    ease: 'linear',
                    repeat: Infinity,
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                      <motion.input
                        type="text"
                        placeholder="Search for artists, studios, or genres..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-dark-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl text-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all backdrop-blur-sm"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                      {/* Animated search icon */}
                      <motion.div
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <MusicVisualizer bars={3} height={15} color="primary" />
                      </motion.div>
                    </div>
                    <div className="lg:w-64">
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="w-full py-4 px-6 bg-white/50 dark:bg-dark-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl text-lg text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all backdrop-blur-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="artists">Artists</option>
                        <option value="studios">Studios</option>
                      </select>
                    </div>
                    <VibratingElements intensity="medium">
                      <Button
                        type="submit"
                        className="btn-primary lg:w-auto px-12 py-4 text-lg relative overflow-hidden group"
                      >
                        <Search className="w-6 h-6 mr-2 group-hover:animate-spin" />
                        Discover
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-highlight-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                        />
                      </Button>
                    </VibratingElements>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Quick Access with Animations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              {['Hip Hop', 'Rock', 'Electronic', 'R&B', 'Pop'].map((genre, index) => (
                <VibratingElements key={genre} intensity="low">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchQuery(genre)
                      setSearchType('all')
                    }}
                    className="px-6 py-3 bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:border-primary-500/50 transition-all duration-300 group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <span className="relative z-10 group-hover:animate-pulse">{genre}</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </motion.button>
                </VibratingElements>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <VibratingElements intensity="low" trigger="continuous">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-12 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center relative overflow-hidden"
            >
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-4 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full mt-2"
              />
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary-500/50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </VibratingElements>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-50 to-white dark:from-dark-900/50 dark:to-dark-800/50 backdrop-blur-sm transition-colors duration-500">
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="text-center group cursor-pointer"
                >
                  <VibratingElements intensity="medium">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-neon transition-all duration-300 relative overflow-hidden">
                      <Icon className="w-10 h-10 text-white group-hover:animate-bounce" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-accent-500/30 to-highlight-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                    </div>
                  </VibratingElements>
                  <motion.div 
                    className="text-4xl lg:text-5xl font-bold text-gradient mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <span className="group-hover:animate-pulse">{stat.number}</span>
                  </motion.div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium text-lg group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                    {stat.label}
                  </div>
                  {/* Music visualizer for each stat */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <MusicVisualizer bars={5} height={15} color="primary" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="section-title gradient-text">
              Why Artists Choose Us
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cutting-edge technology meets creative passion. Experience the future of music collaboration.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="floating-card group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-primary-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900/10 to-accent-900/10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              <TrendingUp className="w-10 h-10 inline-block mr-3 text-primary-400" />
              Trending Now
            </h2>
            <p className="text-gray-400 text-lg">
              Discover what's hot in the music world
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingGenres.map((genre, index) => (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-6 text-center cursor-pointer group"
              >
                <div className={`w-3 h-3 ${genre.color} rounded-full mx-auto mb-3 group-hover:shadow-glow`} />
                <h3 className="font-semibold text-gray-100 mb-2">{genre.name}</h3>
                <span className="text-green-400 font-medium">{genre.growth}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
              Loved by Creators
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-12 text-center"
            >
              <div className="text-3xl text-primary-400 mb-6">"</div>
              <p className="text-xl text-gray-300 mb-8 italic leading-relaxed">
                {testimonials[currentTestimonial].text}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].author}
                  className="w-16 h-16 rounded-full border-2 border-primary-500"
                />
                <div>
                  <div className="font-semibold text-gray-100">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-gray-400">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial Dots */}
            <div className="flex justify-center space-x-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-primary-500 shadow-glow' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-accent-900/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold gradient-text mb-8">
              Ready to Create Magic?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join thousands of artists, producers, and studios already creating amazing music together. 
              <br className="hidden md:block" />
              Your next breakthrough is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register">
                  <Button className="btn-magic text-xl px-12 py-4">
                    Start Creating Free
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/search">
                  <Button className="btn-secondary text-xl px-12 py-4">
                    <Play className="w-6 h-6 mr-3" />
                    Explore Now
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
