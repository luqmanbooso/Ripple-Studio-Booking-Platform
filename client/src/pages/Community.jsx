import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  TrendingUp,
  Music,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Community = () => {
  const [activeTab, setActiveTab] = useState('discussions')

  const tabs = [
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'collaborations', label: 'Collaborations', icon: Users },
    { id: 'showcase', label: 'Showcase', icon: Music }
  ]

  const discussions = [
    {
      id: 1,
      title: "Best practices for remote recording sessions?",
      author: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      category: "Recording",
      replies: 24,
      likes: 15,
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Looking for feedback on my latest track",
      author: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      category: "Feedback",
      replies: 12,
      likes: 28,
      time: "4 hours ago"
    }
  ]

  const events = [
    {
      id: 1,
      title: "Virtual Music Production Masterclass",
      date: "Dec 15, 2025",
      time: "7:00 PM EST",
      attendees: 234,
      type: "Online Workshop"
    },
    {
      id: 2,
      title: "Local Musicians Meetup - NYC",
      date: "Dec 20, 2025",
      time: "6:30 PM EST",
      attendees: 45,
      type: "In-Person",
      location: "Brooklyn, NY"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Music Community
          </h1>
          <p className="text-xl text-light-textSecondary dark:text-gray-400 max-w-2xl mx-auto">
            Connect, collaborate, and grow with fellow musicians from around the world
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { label: 'Active Members', value: '12.5K', icon: Users },
            { label: 'Discussions', value: '2.8K', icon: MessageSquare },
            { label: 'Events', value: '156', icon: Calendar },
            { label: 'Collaborations', value: '892', icon: Music }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="text-center">
                <Icon className="w-8 h-8 text-light-primary dark:text-primary-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-light-text dark:text-gray-100">{stat.value}</div>
                <div className="text-light-textSecondary dark:text-gray-400 text-sm">{stat.label}</div>
              </Card>
            )
          })}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex space-x-1 p-1 bg-light-card dark:bg-dark-800 rounded-lg mb-8 overflow-x-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-light-primary dark:bg-primary-600 text-white'
                    : 'text-light-textSecondary dark:text-gray-400 hover:text-light-text dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'discussions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-light-text dark:text-gray-100">Recent Discussions</h2>
                <Button>Start Discussion</Button>
              </div>
              
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Card key={discussion.id} className="p-6 hover:border-light-primary/50 dark:hover:border-primary-500/50 cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <img
                        src={discussion.avatar}
                        alt={discussion.author}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-light-primary/30 dark:bg-primary-900/30 text-light-primary dark:text-primary-300 rounded text-xs">
                            {discussion.category}
                          </span>
                          <span className="text-light-textSecondary dark:text-gray-400 text-sm">{discussion.time}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-light-text dark:text-gray-100 mb-2">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-light-textSecondary dark:text-gray-400">by {discussion.author}</span>
                          <div className="flex items-center space-x-4 text-light-textSecondary dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{discussion.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{discussion.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-light-text dark:text-gray-100">Upcoming Events</h2>
                <Button>Create Event</Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="p-6 hover:border-light-accent/50 dark:hover:border-accent-500/50 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-light-accent/30 dark:bg-accent-900/30 text-light-accent dark:text-accent-300 rounded-full text-sm">
                        {event.type}
                      </span>
                      <span className="text-light-textSecondary dark:text-gray-400 text-sm">{event.attendees} attending</span>
                    </div>
                    <h3 className="text-lg font-semibold text-light-text dark:text-gray-100 mb-3">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-light-textSecondary dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Join Event
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'collaborations' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-light-textMuted dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-light-text dark:text-gray-100 mb-2">
                Collaboration Hub Coming Soon
              </h3>
              <p className="text-light-textSecondary dark:text-gray-400">
                Find musicians to collaborate with on your next project
              </p>
            </div>
          )}

          {activeTab === 'showcase' && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-light-textMuted dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-light-text dark:text-gray-100 mb-2">
                Music Showcase Coming Soon
              </h3>
              <p className="text-light-textSecondary dark:text-gray-400">
                Share your latest tracks and get feedback from the community
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Community
