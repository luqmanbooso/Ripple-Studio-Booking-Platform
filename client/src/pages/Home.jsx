import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Music, 
  Mic, 
  Headphones, 
  Star, 
  MapPin,
  Zap,
  Play, 
  Calendar,
  ArrowRight,
  Users,
  Award,
  Heart,
  CheckCircle,
  Quote,
  Shield
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const navigate = useNavigate()

  // Professional data with neon theme colors
  const stats = [
    { icon: Users, label: 'Active Artists', value: '10,000+', color: 'text-primary-400', bg: 'bg-primary-500/10', glow: 'shadow-primary-500/20' },
    { icon: Music, label: 'Studios Listed', value: '500+', color: 'text-accent-400', bg: 'bg-accent-500/10', glow: 'shadow-accent-500/20' },
    { icon: Award, label: 'Sessions Booked', value: '50,000+', color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' },
    { icon: Star, label: 'Average Rating', value: '4.9/5', color: 'text-yellow-400', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/20' }
  ]

  const features = [
    {
      icon: Search,
      title: 'Smart Discovery',
      description: 'Find the perfect studio or artist match with our AI-powered search and recommendation system.'
    },
    {
      icon: Calendar,
      title: 'Seamless Booking',
      description: 'Book sessions instantly with real-time availability, automated contracts, and secure payments.'
    },
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All studios and artists undergo thorough verification to ensure quality and authenticity.'
    },
    {
      icon: Headphones,
      title: 'Premium Experience',
      description: 'Access high-end equipment, professional acoustics, and industry-standard facilities.'
    }
  ]

  const testimonials = [
    {
      text: "Ripple transformed how I book studio time. The quality of studios and ease of booking is unmatched.",
      author: "Sarah Chen",
      role: "Grammy-nominated Producer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face"
    },
    {
      text: "As a studio owner, Ripple has connected me with amazing artists and streamlined my entire booking process.",
      author: "Marcus Johnson",
      role: "Studio Owner, Nashville",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      text: "The professional network and quality assurance on Ripple is exactly what the industry needed.",
      author: "Elena Rodriguez",
      role: "Independent Artist",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section with Studio Image Background */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Studio Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/src/studio-podcast.png")',
            filter: 'brightness(0.4) contrast(1.1) saturate(1.2)'
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-purple-900/75 to-black/90" />
        
        {/* Neon glow effects over the background */}
        <div className="absolute inset-0">
          {/* Primary glow effects */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Additional atmospheric effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500/8 via-purple-500/6 to-transparent rounded-full blur-2xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/8 via-cyan-500/6 to-transparent rounded-full blur-2xl opacity-70"></div>
        </div>

        {/* Floating Animation Elements */}
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 right-20 bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl shadow-lg shadow-primary-500/30 backdrop-blur-sm border border-primary-400/20 z-20"
          style={{ filter: 'drop-shadow(0 0 15px rgba(233, 30, 99, 0.4))' }}
        >
          <Music className="w-6 h-6 text-white" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [10, -10, 10],
            x: [-5, 5, -5]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-32 left-20 bg-gradient-to-br from-accent-500 to-accent-600 p-4 rounded-2xl shadow-lg shadow-accent-500/30 backdrop-blur-sm border border-accent-400/20 z-20"
          style={{ filter: 'drop-shadow(0 0 15px rgba(0, 201, 255, 0.4))' }}
        >
          <Headphones className="w-6 h-6 text-white" />
        </motion.div>

        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear"
          }}
          className="absolute top-1/2 left-16 bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-full shadow-lg shadow-purple-500/30 backdrop-blur-sm border border-purple-400/20 z-20"
          style={{ filter: 'drop-shadow(0 0 12px rgba(156, 39, 176, 0.4))' }}
        >
          <Mic className="w-5 h-5 text-white" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2.5
          }}
          className="absolute top-1/3 right-32 bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-xl shadow-lg shadow-pink-500/25 backdrop-blur-sm z-20"
          style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.3))' }}
        >
          <Zap className="w-4 h-4 text-white" />
        </motion.div>

        <motion.div
          animate={{ 
            x: [0, 12, 0],
            rotate: [0, 45, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 3.5
          }}
          className="absolute bottom-1/3 left-32 bg-gradient-to-br from-cyan-500 to-blue-500 p-2 rounded-xl shadow-lg shadow-cyan-500/25 backdrop-blur-sm z-20"
          style={{ filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.3))' }}
        >
          <Play className="w-4 h-4 text-white" />
        </motion.div>

        <div className="container relative z-10">
          <div className="flex items-center justify-center min-h-screen py-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-white text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium border border-primary-500/30 backdrop-blur-sm">
                  Professional Music Production Platform
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-5xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight"
              >
                Where Music
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  Meets Magic
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto"
              >
                Connect with world-class recording studios and talented artists. 
                Book professional sessions, collaborate seamlessly, and create your masterpiece.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex items-center justify-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-primary-400" src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=32&h=32&fit=crop&crop=face" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-primary-400" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-primary-400" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" alt="User" />
                  </div>
                  <span className="text-sm text-gray-400">10,000+ Artists Trust Ripple</span>
                </div>
              </motion.div>
            </motion.div>


          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-white/60"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-3 bg-white/60 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section with Neon Theme */}
      <section className="section-padding bg-gray-900 relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-accent-900/20"></div>
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by the <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Music Industry</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="text-center group cursor-pointer"
              >
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl ${stat.bg} border border-white/10 mb-6 ${stat.glow} shadow-lg backdrop-blur-sm group-hover:shadow-2xl transition-all duration-300`}>
                  <stat.icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                  
                  {/* Pulsing glow effect */}
                  <div className={`absolute inset-0 ${stat.bg} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                </div>
                
                <motion.div 
                  className="text-3xl lg:text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with Neon Theme */}
      <section className="section-padding bg-black relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-accent-500/5"></div>
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-primary-500/10"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Everything You Need to 
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-purple-400 bg-clip-text text-transparent"> Create</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Professional tools and verified talent in one seamless platform designed for the modern music industry
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, rotateY: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group cursor-pointer"
              >
                <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 h-full text-center overflow-hidden group-hover:border-primary-500/50 transition-all duration-500">
                  {/* Gradient glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400 mb-6 group-hover:bg-primary-500/20 group-hover:border-primary-500/40 transition-all duration-300"
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.1,
                        transition: { duration: 0.5 }
                      }}
                    >
                      <feature.icon className="w-8 h-8" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Animated corner accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary-500/0 group-hover:border-primary-500/60 transition-all duration-500 rounded-tl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-accent-500/0 group-hover:border-accent-500/60 transition-all duration-500 rounded-br-3xl"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section with Neon Theme */}
      <section className="section-padding bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Trusted by 
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Creators Worldwide</span>
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-3xl p-12 text-center relative overflow-hidden">
                {/* Gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Quote className="w-16 h-16 text-primary-400 mx-auto mb-8" />
                  </motion.div>
                  
                  <blockquote className="text-2xl lg:text-3xl font-light text-white mb-10 leading-relaxed italic">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-6">
                    <motion.img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].author}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-400 shadow-lg shadow-primary-400/25"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="text-left">
                      <div className="text-xl font-semibold text-white mb-1">
                        {testimonials[currentTestimonial].author}
                      </div>
                      <div className="text-primary-300 font-medium">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary-500/30 rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-accent-500/30 rounded-br-3xl"></div>
              </div>
            </motion.div>

            <div className="flex justify-center space-x-4 mt-12">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`transition-all duration-500 ${
                    index === currentTestimonial 
                      ? 'w-12 h-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-lg shadow-primary-500/25' 
                      : 'w-3 h-3 bg-gray-600 hover:bg-gray-500 rounded-full'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with Neon Theme */}
      <section className="section-padding bg-gradient-to-br from-primary-600 via-purple-600 to-accent-600 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary-400/10 to-accent-400/10 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-accent-400/10 to-purple-400/10 rounded-full blur-3xl"
          ></motion.div>
        </div>

        <div className="container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-5xl lg:text-7xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ready to Elevate 
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-white to-yellow-300 bg-clip-text text-transparent animate-pulse">
                Your Music?
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-xl lg:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of artists and studios creating exceptional music together on the world's most trusted platform
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="px-12 py-4 text-lg font-semibold bg-white text-purple-600 hover:bg-gray-100 border-none shadow-2xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating Free
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-12 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/60"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home