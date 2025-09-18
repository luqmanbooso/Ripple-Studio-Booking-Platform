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
import Card from '../components/ui/Card'
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
      color: 'from-light-accent to-light-primary dark:from-blue-500 dark:to-cyan-500'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Instant Booking',
      description: 'Real-time availability with seamless booking and secure payment processing',
      color: 'from-light-highlight to-light-primary dark:from-purple-500 dark:to-pink-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Professionals',
      description: 'All artists and studios are verified with authentic reviews from the community',
      color: 'from-success-500 to-success-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-time Collaboration',
      description: 'Live chat, file sharing, and project management tools for seamless collaboration',
      color: 'from-warning-500 to-warning-600'
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
    { name: 'Lo-Fi Hip Hop', growth: '+45%', color: 'bg-light-highlight dark:bg-purple-500' },
    { name: 'Indie Pop', growth: '+32%', color: 'bg-light-primary dark:bg-pink-500' },
    { name: 'Electronic', growth: '+28%', color: 'bg-light-accent dark:bg-blue-500' },
    { name: 'R&B Soul', growth: '+25%', color: 'bg-success-500' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen relative">
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-all duration-1000" />
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-10 dark:opacity-20"
              initial={{ 
                scale: 0,
                rotate: 0,
              }}
              animate={{ 
                scale: [0, 1.2, 0.8, 1],
                rotate: [0, 180, 360],
                x: [0, 100, -50, 0],
                y: [0, -100, 50, 0],
              }}
              transition={{ 
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
            >
              <div className={`w-32 h-32 ${i % 2 === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-pink-500 to-rose-600'} ${i % 3 === 0 ? 'rounded-full' : 'rounded-3xl'} blur-sm`} />
            </motion.div>
          ))}
        </div>

        <div className="relative container text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Modern typography approach */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              <span className="text-gray-900 dark:text-white">Where Music</span>
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Comes Alive
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                />
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Connect with world-class artists and premium studios. 
              Create, collaborate, and transform your musical vision into reality.
            </motion.p>

            {/* Modern Search Interface */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleSearch} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/50 dark:border-slate-700/50 shadow-2xl shadow-gray-900/5 dark:shadow-slate-900/20">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400" />
                    <motion.input
                      type="text"
                      placeholder="Search artists, studios, or genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl text-base text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <div className="lg:w-48">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full py-4 px-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl text-base text-gray-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300"
                    >
                      <option value="all">All Categories</option>
                      <option value="artists">Artists</option>
                      <option value="studios">Studios</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="lg:w-auto px-8 group"
                  >
                    <Search className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* Popular Genres */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap justify-center gap-3 mt-8"
            >
              <span className="text-gray-600 dark:text-slate-400 text-sm mr-2">Popular:</span>
              {['Hip Hop', 'Rock', 'Electronic', 'R&B', 'Pop'].map((genre, index) => (
                <motion.button
                  key={genre}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  onClick={() => {
                    setSearchQuery(genre)
                    setSearchType('all')
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full text-sm font-medium transition-all duration-300 border border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500"
                >
                  {genre}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-gray-300 dark:border-slate-600 rounded-full flex justify-center relative"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-100/50 dark:bg-slate-900/50 backdrop-blur-sm">
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
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <motion.div
                    className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ripple?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover the features that make Ripple the premier platform for music collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full group">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What Our <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Community</span> Says
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center">
                <div className="mb-8">
                  <div className="text-2xl font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonials[currentTestimonial].author}
                      </div>
                      <div className="text-gray-600 dark:text-slate-400">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-indigo-600 w-8' 
                      : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative container text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl lg:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              Join thousands of artists and studios already creating magic on Ripple
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="px-8"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 border-white text-white hover:bg-white hover:text-indigo-600"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
