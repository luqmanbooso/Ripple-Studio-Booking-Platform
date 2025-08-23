import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Calendar, User, ArrowRight, Tag } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    'All',
    'Recording Tips',
    'Industry News',
    'Artist Spotlights',
    'Technology',
    'Business'
  ]

  const blogPosts = [
    {
      id: 1,
      title: "10 Essential Tips for Your First Studio Recording Session",
      excerpt: "Preparing for your first professional recording session? Here's everything you need to know to make it a success.",
      author: "Sarah Johnson",
      date: "Dec 10, 2024",
      category: "Recording Tips",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
      readTime: "5 min read",
      featured: true
    },
    {
      id: 2,
      title: "The Rise of Home Studios: Professional Quality at Home",
      excerpt: "How modern technology is making professional-quality recording accessible to everyone.",
      author: "Mike Chen",
      date: "Dec 8, 2024",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=250&fit=crop",
      readTime: "8 min read",
      featured: false
    },
    {
      id: 3,
      title: "Artist Spotlight: How Local Musician Went Viral",
      excerpt: "The inspiring story of how one independent artist used our platform to reach millions.",
      author: "Emily Rodriguez",
      date: "Dec 5, 2024",
      category: "Artist Spotlights",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=250&fit=crop",
      readTime: "6 min read",
      featured: false
    }
  ]

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

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
            Music Blog
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Insights, tips, and stories from the world of music production and collaboration
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 input-field"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.toLowerCase()
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured Post */}
        {filteredPosts.find(post => post.featured) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Featured Article</h2>
            {(() => {
              const featuredPost = filteredPosts.find(post => post.featured)
              return (
                <Card className="overflow-hidden hover:border-primary-500/50 cursor-pointer group">
                  <div className="lg:flex">
                    <div className="lg:w-1/2">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="lg:w-1/2 p-8">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="px-3 py-1 bg-primary-900/30 text-primary-300 rounded-full text-sm">
                          {featuredPost.category}
                        </span>
                        <span className="text-gray-400 text-sm">{featuredPost.readTime}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-primary-300 transition-colors">
                        {featuredPost.title}
                      </h3>
                      <p className="text-gray-400 mb-6 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">{featuredPost.author}</span>
                          <Calendar className="w-4 h-4 text-gray-400 ml-4" />
                          <span className="text-gray-400">{featuredPost.date}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })()}
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.filter(post => !post.featured).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden hover:border-primary-500/50 cursor-pointer h-full group">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="px-2 py-1 bg-accent-900/30 text-accent-300 rounded text-xs">
                        {post.category}
                      </span>
                      <span className="text-gray-400 text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-3 group-hover:text-primary-300 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">{post.date}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20"
        >
          <Card className="text-center p-12 bg-gradient-to-r from-primary-900/20 to-accent-900/20">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Get the latest music industry insights, tips, and stories delivered to your inbox weekly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 input-field"
              />
              <Button>Subscribe</Button>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              No spam, unsubscribe anytime.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Blog
