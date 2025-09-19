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
  Calendar,
  ArrowRight,
  Play,
  Users,
  Award,
  Zap,
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

  // Professional data with realistic content
  const stats = [
    { icon: Users, label: 'Active Artists', value: '10,000+', color: 'text-blue-600' },
    { icon: Music, label: 'Studios Listed', value: '500+', color: 'text-purple-600' },
    { icon: Award, label: 'Sessions Booked', value: '50,000+', color: 'text-green-600' },
    { icon: Star, label: 'Average Rating', value: '4.9/5', color: 'text-yellow-600' }
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
      {/* Professional Hero Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-display mb-6">
                Where Music 
                <span className="gradient-primary"> Meets</span> Perfection
              </h1>
              
              <p className="text-body-lg text-muted mb-8 max-w-2xl mx-auto">
                Connect with world-class recording studios and talented artists. 
                Book professional sessions, collaborate seamlessly, and create your masterpiece.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="px-8">
                  Start Creating
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            {/* Professional Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search studios, artists, or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search className="w-4 h-4" />}
                    />
                  </div>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="input w-40"
                  >
                    <option value="all">All</option>
                    <option value="studios">Studios</option>
                    <option value="artists">Artists</option>
                  </select>
                  <Button type="submit">Search</Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Professional Stats Section */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-heading-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Features Section */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-heading-xl mb-4">
              Everything You Need to 
              <span className="gradient-primary"> Create</span>
            </h2>
            <p className="text-body-lg text-muted max-w-2xl mx-auto">
              Professional tools and verified talent in one seamless platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-heading-md mb-3">{feature.title}</h3>
                  <p className="text-muted leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Testimonials Section */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-heading-xl mb-4">
              Trusted by 
              <span className="gradient-primary">Creators Worldwide</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="text-center">
              <Quote className="w-8 h-8 text-gray-400 mx-auto mb-6" />
              <blockquote className="text-heading-md text-gray-900 dark:text-white mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-muted text-sm">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-heading-xl mb-6">
              Ready to Elevate Your Music?
            </h2>
            <p className="text-body-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of artists and studios creating exceptional music together
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
                className="px-8 border-white text-white hover:bg-white hover:text-blue-600"
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