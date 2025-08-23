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
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
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
      title: 'Email Us',
      info: 'support@musicbooking.io',
      description: 'Send us an email anytime',
      action: 'mailto:support@musicbooking.io'
    },
    {
      icon: Phone,
      title: 'Call Us',
      info: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM EST',
      action: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      info: '123 Music Street, Nashville, TN',
      description: 'Our headquarters',
      action: '#'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      info: 'Chat with support',
      description: 'Available 24/7',
      action: '#'
    }
  ]

  const inquiryTypes = [
    { value: '', label: 'Select inquiry type' },
    { value: 'general', label: 'General Question' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'partnership', label: 'Partnership Inquiry' },
    { value: 'press', label: 'Press & Media' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ]

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ]

  const faqs = [
    {
      question: 'How quickly do you respond to inquiries?',
      answer: 'We typically respond to all inquiries within 24 hours during business days.'
    },
    {
      question: 'Can I schedule a demo of the platform?',
      answer: 'Yes! Contact our sales team to schedule a personalized demo of our platform.'
    },
    {
      question: 'Do you offer phone support?',
      answer: 'Phone support is available for Pro and Enterprise customers during business hours.'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-accent-900/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-8">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Have a question, need support, or want to partner with us? 
              We'd love to hear from you.
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
                  <Card className="text-center p-6 h-full cursor-pointer hover:border-primary-500/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-primary-400 font-medium mb-1">
                      {item.info}
                    </p>
                    <p className="text-gray-400 text-sm">
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
                <h2 className="text-3xl font-bold text-gray-100 mb-6">
                  Send us a message
                </h2>
                <p className="text-gray-400 mb-8">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Your Name"
                      placeholder="John Doe"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Inquiry Type
                      </label>
                      <select
                        className="input-field w-full"
                        {...register('type')}
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="text-sm text-red-400">{errors.type.message}</p>
                      )}
                    </div>
                    <Input
                      label="Subject"
                      placeholder="How can we help?"
                      error={errors.subject?.message}
                      {...register('subject')}
                    />
                  </div>

                  <Textarea
                    label="Message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    error={errors.message?.message}
                    {...register('message')}
                  />

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
                  While our headquarters are in Nashville, we serve musicians worldwide across 150+ countries.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>🇺🇸 Nashville, TN (HQ)</div>
                  <div>🇬🇧 London, UK</div>
                  <div>🇩🇪 Berlin, Germany</div>
                  <div>🇯🇵 Tokyo, Japan</div>
                </div>
              </Card>

              {/* Social Media */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Follow Us
                </h3>
                <p className="text-gray-400 mb-6">
                  Stay connected for the latest updates and music industry insights.
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
              Find Us
            </h2>
            <Card className="p-8">
              <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Interactive map coming soon</p>
                  <p className="text-gray-500 text-sm mt-2">
                    123 Music Street, Nashville, TN 37203
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
