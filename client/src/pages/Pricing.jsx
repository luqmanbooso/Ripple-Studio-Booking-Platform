import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Star, Zap, Crown } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      name: 'Starter',
      icon: Star,
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Basic profile creation',
        'Browse artists and studios',
        'Up to 3 bookings per month',
        'Basic messaging',
        'Community access',
        'Email support'
      ],
      limitations: [
        'No priority booking',
        'Limited portfolio uploads',
        'No advanced analytics'
      ],
      color: 'from-gray-600 to-gray-700',
      popular: false
    },
    {
      name: 'Professional',
      icon: Zap,
      price: { monthly: 29, yearly: 290 },
      description: 'For serious musicians and studios',
      features: [
        'Everything in Starter',
        'Unlimited bookings',
        'Priority customer support',
        'Advanced portfolio features',
        'Real-time availability sync',
        'Analytics dashboard',
        'Custom booking forms',
        'Payment processing (2.9%)',
        'Calendar integrations'
      ],
      limitations: [
        'No white-label options',
        'Standard commission rates'
      ],
      color: 'from-primary-600 to-accent-600',
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Crown,
      price: { monthly: 99, yearly: 990 },
      description: 'For studios and music businesses',
      features: [
        'Everything in Professional',
        'White-label platform',
        'Reduced commission rates (1.9%)',
        'Multi-location management',
        'Advanced team features',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Priority feature requests',
        'Custom onboarding'
      ],
      limitations: [],
      color: 'from-yellow-600 to-orange-600',
      popular: false
    }
  ]

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers."
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees for any plan. You only pay the monthly or yearly subscription fee."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans."
    }
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your music journey. All plans include our core features 
            with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-100' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-gray-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                billingCycle === 'yearly' ? 'transform translate-x-7' : ''
              }`} />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-100' : 'text-gray-400'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                Save 17%
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-3 gap-8 mb-20"
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const price = plan.price[billingCycle]
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular ? 'border-primary-500 shadow-glow' : ''}`}>
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-100 mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-100">
                        ${price}
                      </span>
                      <span className="text-gray-400">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                      {billingCycle === 'yearly' && price > 0 && (
                        <div className="text-sm text-green-400 mt-1">
                          Save ${plan.price.monthly * 12 - plan.price.yearly}/year
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-start space-x-3">
                        <X className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {plan.price.monthly === 0 ? 'Get Started Free' : 'Start Free Trial'}
                  </Button>
                  
                  {plan.price.monthly > 0 && (
                    <p className="text-center text-sm text-gray-400 mt-3">
                      14-day free trial • No credit card required
                    </p>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl font-bold text-gray-100 mb-4">
            Ready to elevate your music career?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of musicians already using our platform
          </p>
          <Button className="btn-primary text-lg px-8 py-4">
            Start Your Free Trial
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default Pricing
