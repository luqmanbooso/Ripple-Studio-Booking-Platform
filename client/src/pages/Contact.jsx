import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  Globe,
  Twitter,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  type: z.string().min(1, 'Please select an inquiry type')
})

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Support',
      info: 'support@ripple.studio',
      description: 'Get help with bookings & technical issues',
      action: 'mailto:support@ripple.studio'
    },
    {
      icon: Phone,
      title: 'Studio Hotline',
      info: '+1 (615) 555-WAVE',
      description: 'Mon-Fri 9AM-8PM EST',
      action: 'tel:+16155559283'
    },
    {
      icon: MapPin,
      title: 'Nashville HQ',
      info: '1200 Music Row, Nashville, TN 37212',
      description: 'Heart of Music City',
      action: '#'
    },
    {
      icon: MessageSquare,
      title: 'Live Support',
      info: 'Chat with our team',
      description: 'Available during business hours',
      action: '#'
    }
  ]

  const inquiryTypes = [
    { value: '', label: 'Select inquiry type' },
    { value: 'booking', label: 'Booking Support' },
    { value: 'technical', label: 'Technical Issues' },
    { value: 'billing', label: 'Payments & Billing' },
    { value: 'studio', label: 'Studio Partnership' },
    { value: 'artist', label: 'Artist Support' },
    { value: 'press', label: 'Press & Media' },
    { value: 'feedback', label: 'Platform Feedback' }
  ]

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ]

  const faqs = [
    {
      question: 'How quickly do you respond to booking issues?',
      answer: 'We respond to booking-related inquiries within 2 hours during business hours, and within 24 hours on weekends.'
    },
    {
      question: 'Can I get help choosing the right studio?',
      answer: 'Absolutely! Our team can help match you with studios based on your genre, budget, and specific recording needs.'
    },
    {
      question: 'What if I need to cancel or reschedule my booking?',
      answer: 'Contact us immediately. Cancellation policies vary by studio, but we\'ll work with you and the studio to find the best solution.'
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
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-light-textSecondary dark:text-gray-300 leading-relaxed">
              Need help with a booking, have questions about our studios, or want to partner with us? 
              Our team is here to help you make great music.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {contactInfo.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="text-center p-6 h-full cursor-pointer hover:border-light-primary/50 dark:hover:border-primary-500/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-light-primary to-light-accent dark:from-primary-600 dark:to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-light-text dark:text-gray-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-light-primary dark:text-primary-400 font-medium mb-1">
                      {item.info}
                    </p>
                    <p className="text-light-textSecondary dark:text-gray-400 text-sm">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h2 className="text-3xl font-bold text-light-text dark:text-gray-100 mb-6">
                  Send us a message
                </h2>
                <p className="text-light-textSecondary dark:text-gray-400 mb-8">
                  Tell us how we can help with your recording needs, and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-light-text dark:text-gray-300">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-light-text dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-light-text dark:text-gray-300">
                        Inquiry Type
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
                          {...register('type')}
                        >
                          {inquiryTypes.map((type) => (
                            <option key={type.value} value={type.value} className="bg-gray-700 text-white">
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.type && (
                        <p className="text-sm text-red-400">{errors.type.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-light-text dark:text-gray-300">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="How can we help?"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        {...register('subject')}
                      />
                      {errors.subject && (
                        <p className="text-sm text-red-400">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-light-text dark:text-gray-300">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-400">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="w-full"
                    icon={<Send className="w-5 h-5" />}
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Office Hours */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-primary-400" />
                  <h3 className="text-xl font-semibold text-gray-100">Office Hours</h3>
                </div>
                <div className="space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </Card>

              {/* Global Presence */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="w-6 h-6 text-accent-400" />
                  <h3 className="text-xl font-semibold text-gray-100">Global Presence</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Based in Music City, we connect artists with premium recording studios across major music markets worldwide.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>🎵 Nashville, TN (Headquarters)</div>
                  <div>🎸 Los Angeles, CA</div>
                  <div>🎤 New York, NY</div>
                  <div>🥁 London, UK</div>
                </div>
              </Card>

              {/* Social Media */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Follow Us
                </h3>
                <p className="text-gray-400 mb-6">
                  Follow us for studio spotlights, artist features, and platform updates.
                </p>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        className="w-12 h-12 bg-gray-700 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5 text-gray-300 hover:text-white" />
                      </a>
                    )
                  })}
                </div>
              </Card>

              {/* FAQ */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Quick Answers
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-100 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-20 bg-gradient-to-r from-dark-900/50 to-dark-800/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold gradient-text mb-8">
              Visit Our Nashville HQ
            </h2>
            <Card className="p-8">
              <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg font-medium">Ripple Studios</p>
                  <p className="text-gray-400 mt-2">
                    1200 Music Row, Nashville, TN 37212
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    In the heart of Music City's creative district
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Contact
