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
    { number: '50K+', label: 'Active Users', icon: Users },
    { number: '25K+', label: 'Successful Bookings', icon: Music },
    { number: '150+', label: 'Countries', icon: Globe },
    { number: '4.9', label: 'Platform Rating', icon: Star }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Passion for Music',
      description: 'We believe music has the power to connect people and transform lives. Every feature we build is driven by our love for music and the creative process.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Our platform is built by musicians, for musicians. We prioritize the needs of our community and foster meaningful connections between artists.'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'We maintain the highest standards of security and verification to ensure safe, reliable interactions for all our users.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We continuously push the boundaries of technology to create seamless, intuitive experiences that empower creativity.'
    }
  ]

  const team = [
    {
      name: 'Alex Rodriguez',
      role: 'CEO & Co-Founder',
      bio: 'Former music producer with 15+ years in the industry. Passionate about connecting artists worldwide.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      speciality: 'Product Strategy'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack engineer and classically trained pianist. Believes technology should amplify creativity.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      speciality: 'Technology'
    },
    {
      name: 'Marcus Thompson',
      role: 'Head of Community',
      bio: 'Professional recording engineer and community builder. Ensures every user has an amazing experience.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      speciality: 'Community Relations'
    },
    {
      name: 'Emily Watson',
      role: 'VP of Business Development',
      bio: 'Music industry veteran with deep connections across labels, studios, and independent artists.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      speciality: 'Partnerships'
    }
  ]

  const timeline = [
    {
      year: '2020',
      title: 'The Idea',
      description: 'Founded by two musicians frustrated with the complexity of booking studio time and finding collaborators.'
    },
    {
      year: '2021',
      title: 'First Launch',
      description: 'Launched beta version with 100 artists and 20 studios. Processed first 1,000 bookings.'
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Expanded to 50 countries, added real-time features, and reached 10,000 active users.'
    },
    {
      year: '2023',
      title: 'Major Milestone',
      description: 'Processed over 100,000 bookings, launched mobile app, and secured Series A funding.'
    },
    {
      year: '2024',
      title: 'Present Day',
      description: 'Leading platform for music collaboration with AI-powered matching and global reach.'
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
              About MusicBooking
            </h1>
            <p className="text-xl md:text-2xl text-light-textSecondary dark:text-gray-300 leading-relaxed">
              We're on a mission to democratize music creation by connecting artists, 
              producers, and studios worldwide through technology that amplifies creativity.
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
                Music creation should be limitless. Whether you're a bedroom producer in Tokyo, 
                a vocalist in Nashville, or a studio owner in Berlin, great music happens when 
                talented people connect.
              </p>
              <p className="text-lg text-light-textSecondary dark:text-gray-300 leading-relaxed">
                We're breaking down the barriers that prevent artists from collaborating, 
                making it as easy to book a world-class studio as it is to order a ride.
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
                  <h3 className="text-2xl font-bold mb-2">50M+</h3>
                  <p className="text-lg opacity-90">Minutes of music created</p>
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
                 Join Our Mission
               </h2>
               <p className="text-xl text-light-textSecondary dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                 Whether you're an artist, studio owner, or music enthusiast, 
                 you're part of our story. Let's create the future of music together.
               </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary text-lg px-8 py-4">
                  Start Creating
                </button>
                <button className="btn-outline text-lg px-8 py-4">
                  Learn More
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
