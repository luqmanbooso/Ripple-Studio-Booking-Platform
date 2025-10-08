import React from 'react'
import { motion } from 'framer-motion'
import { 
  Music, 
  Users, 
  Globe, 
  Award, 
  Heart, 
  Target,
  Zap,
  Shield,
  TrendingUp,
  Star
} from 'lucide-react'
import Card from '../components/ui/Card'

const About = () => {
  const stats = [
    { number: '10K+', label: 'Active Musicians', icon: Users },
    { number: '5K+', label: 'Studio Sessions', icon: Music },
    { number: '500+', label: 'Partner Studios', icon: Globe },
    { number: '4.8', label: 'Average Rating', icon: Star }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Quality Studios',
      description: 'We partner only with verified, professional recording studios that meet our strict quality standards for equipment, acoustics, and service.'
    },
    {
      icon: Users,
      title: 'Artist-Centric',
      description: 'Every decision we make prioritizes the artist experience. From discovery to booking to recording, we ensure seamless creative workflows.'
    },
    {
      icon: Shield,
      title: 'Secure Bookings',
      description: 'Our platform provides secure payment processing, verified studio profiles, and comprehensive booking protection for peace of mind.'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Book premium recording studios in minutes, not days. Our real-time availability system connects you with the perfect space instantly.'
    }
  ]

  const team = [
    {
      name: 'David Chen',
      role: 'CEO & Founder',
      bio: 'Grammy-nominated producer turned entrepreneur. Built Ripple to solve the studio booking challenges he faced as an artist.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      speciality: 'Music Industry'
    },
    {
      name: 'Maya Patel',
      role: 'CTO & Co-Founder',
      bio: 'Former Spotify engineer and session musician. Combines deep technical expertise with real-world music production experience.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      speciality: 'Platform Engineering'
    },
    {
      name: 'James Morrison',
      role: 'Head of Studio Relations',
      bio: 'Former studio owner with 20+ years in professional audio. Ensures our partner studios meet the highest standards.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      speciality: 'Studio Partnerships'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'VP of Artist Success',
      bio: 'Multi-platinum artist manager who understands what musicians need to create their best work.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      speciality: 'Artist Relations'
    }
  ]

  const timeline = [
    {
      year: '2022',
      title: 'The Vision',
      description: 'Founded by David Chen after struggling to book quality studio time for his own productions. Started with a simple mission: make studio booking as easy as ordering food.'
    },
    {
      year: '2023',
      title: 'Beta Launch',
      description: 'Launched with 50 premium studios across major music cities. Processed first 500 successful bookings with 98% satisfaction rate.'
    },
    {
      year: '2024',
      title: 'Rapid Growth',
      description: 'Expanded to 500+ studios worldwide. Introduced real-time booking, secure payments, and comprehensive studio profiles.'
    },
    {
      year: '2025',
      title: 'Industry Leader',
      description: 'Now the trusted platform for 10,000+ musicians and 500+ professional studios. Processing 1,000+ bookings monthly.'
    },
    {
      year: 'Future',
      title: 'What\'s Next',
      description: 'Expanding into equipment rental, producer matching, and AI-powered studio recommendations to create the complete music production ecosystem.'
    }
  ]

  return (
         <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-light-primary/20 to-light-accent/20 dark:from-primary-900/20 dark:to-accent-900/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-8">
              About Ripple
            </h1>
            <p className="text-xl md:text-2xl text-light-textSecondary dark:text-gray-300 leading-relaxed">
              Connecting musicians with professional recording studios worldwide. 
              We're revolutionizing how artists discover, book, and collaborate in premium studio spaces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-light-card/50 to-white dark:from-dark-900/50 dark:to-dark-800/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-light-primary to-light-accent dark:from-primary-600 dark:to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-light-textSecondary dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-light-text dark:text-gray-100 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-light-textSecondary dark:text-gray-300 leading-relaxed mb-6">
                Every great song starts with the right environment. Whether you're a solo artist 
                looking for the perfect vocal booth, a band needing a full live room, or a producer 
                seeking world-class mixing facilities, the studio you choose shapes your sound.
              </p>
              <p className="text-lg text-light-textSecondary dark:text-gray-300 leading-relaxed">
                Ripple eliminates the guesswork and hassle of studio booking. We connect you with 
                verified, professional recording spaces that match your exact needs, budget, and timeline.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-light-primary to-light-accent dark:from-primary-600 dark:to-accent-600 rounded-3xl p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <Target className="w-20 h-20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">100K+</h3>
                  <p className="text-lg opacity-90">Hours of studio time booked</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-r from-light-primary/10 to-light-accent/10 dark:from-dark-900/30 dark:to-dark-800/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gradient mb-6">
              Our Values
            </h2>
            <p className="text-xl text-light-textSecondary dark:text-gray-400 max-w-3xl mx-auto">
              These principles guide everything we do, from product decisions to community building
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-8 h-full">
                                      <div className="w-12 h-12 bg-gradient-to-br from-light-primary to-light-accent dark:from-primary-600 dark:to-accent-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-light-text dark:text-gray-100 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-light-textSecondary dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
                         <h2 className="text-4xl font-bold text-gradient mb-6">
               Our Journey
             </h2>
             <p className="text-xl text-light-textSecondary dark:text-gray-400">
               From a simple idea to a global platform
             </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center mb-12 last:mb-0"
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right pr-8' : 'order-2 pl-8'}`}>
                  <Card className="p-6">
                                         <div className="text-2xl font-bold text-light-primary dark:text-primary-400 mb-2">
                       {item.year}
                     </div>
                     <h3 className="text-xl font-semibold text-light-text dark:text-gray-100 mb-3">
                       {item.title}
                     </h3>
                     <p className="text-light-textSecondary dark:text-gray-400">
                       {item.description}
                     </p>
                  </Card>
                </div>
                
                                 <div className="w-4 h-4 bg-light-primary dark:bg-primary-500 rounded-full border-4 border-white dark:border-dark-950 relative z-10">
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                 </div>
                
                <div className={`flex-1 ${index % 2 === 1 ? 'order-1' : ''}`} />
                
                                 {index < timeline.length - 1 && (
                   <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-24 bg-gradient-to-b from-light-primary to-light-accent dark:from-primary-500 dark:to-accent-500 mt-16" />
                 )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-r from-light-primary/10 to-light-accent/10 dark:from-primary-900/10 dark:to-accent-900/10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
                         <h2 className="text-4xl font-bold text-gradient mb-6">
               Meet Our Team
             </h2>
             <p className="text-xl text-light-textSecondary dark:text-gray-400">
               Passionate musicians and technologists building the future of music collaboration
             </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="text-center p-6 h-full">
                  <div className="relative mb-6">
                                         <img
                       src={member.image}
                       alt={member.name}
                       className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-light-primary dark:border-primary-500"
                     />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-light-primary to-light-accent dark:from-primary-600 dark:to-accent-600 rounded-full flex items-center justify-center">
                       <Award className="w-4 h-4 text-white" />
                     </div>
                   </div>
                   <h3 className="text-lg font-bold text-light-text dark:text-gray-100 mb-1">
                     {member.name}
                   </h3>
                   <p className="text-light-primary dark:text-primary-400 font-medium mb-3">
                     {member.role}
                   </p>
                   <p className="text-light-textSecondary dark:text-gray-400 text-sm mb-4">
                     {member.bio}
                   </p>
                   <span className="inline-block px-3 py-1 bg-light-accent/30 dark:bg-accent-900/30 text-light-accent dark:text-accent-300 rounded-full text-xs">
                     {member.speciality}
                   </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
                         <Card className="p-12 bg-gradient-to-r from-light-primary/20 to-light-accent/20 dark:from-primary-900/20 dark:to-accent-900/20">
               <h2 className="text-4xl font-bold text-gradient mb-6">
                 Ready to Find Your Perfect Studio?
               </h2>
               <p className="text-xl text-light-textSecondary dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                 Join thousands of musicians who trust Ripple to find and book 
                 professional recording studios. Your next hit song is just a booking away.
               </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary text-lg px-8 py-4">
                  Browse Studios
                </button>
                <button className="btn-outline text-lg px-8 py-4">
                  List Your Studio
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About
