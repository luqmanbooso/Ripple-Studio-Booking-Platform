import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Star, 
  MapPin, 
  Music, 
  Calendar, 
  DollarSign, 
  Heart,
  Share2,
  Play,
  ExternalLink,
  Clock,
  Award
} from 'lucide-react'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { useGetArtistQuery } from '../store/artistApi'
import { useGetReviewsQuery } from '../store/reviewApi'

const ArtistProfile = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [isFavorited, setIsFavorited] = useState(false)

  const { data: artistData, isLoading, error } = useGetArtistQuery(id)
  const { data: reviewsData } = useGetReviewsQuery({ 
    targetType: 'artist', 
    targetId: id 
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !artistData?.data?.artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Artist Not Found</h2>
          <p className="text-gray-400 mb-4">The artist you're looking for doesn't exist.</p>
          <Link to="/search?type=artists">
            <Button>Browse Artists</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { artist } = artistData.data
  const { user, genres, instruments, bio, hourlyRate, ratingAvg, ratingCount, media, socialLinks } = artist

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'reviews', label: `Reviews (${reviewsData?.data?.pagination?.total || 0})` },
    { id: 'availability', label: 'Availability' },
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-900/20 to-accent-900/20 border-b border-gray-800">
        <div className="container py-12">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="w-32 h-32 lg:w-48 lg:h-48 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl overflow-hidden">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-16 h-16 lg:w-24 lg:h-24 text-white/80" />
                  </div>
                )}
              </div>
              
              {user?.verified && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2">
                  <Award className="w-6 h-6 fill-current" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
                    {user?.name}
                  </h1>
                  
                  {(user?.city || user?.country) && (
                    <div className="flex items-center text-gray-400 mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{[user?.city, user?.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold text-gray-100">
                        {ratingAvg ? ratingAvg.toFixed(1) : 'New'}
                      </span>
                      {ratingCount > 0 && (
                        <span className="text-gray-400">({ratingCount} reviews)</span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-primary-400 font-semibold text-lg">
                      <DollarSign className="w-5 h-5" />
                      <span>{hourlyRate}/hr</span>
                    </div>
                  </div>

                  {/* Genres & Instruments */}
                  <div className="space-y-2">
                    {genres && genres.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => (
                          <span
                            key={genre}
                            className="px-3 py-1 bg-primary-900/30 text-primary-300 text-sm rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {instruments && instruments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {instruments.map((instrument) => (
                          <span
                            key={instrument}
                            className="px-3 py-1 bg-accent-900/30 text-accent-300 text-sm rounded-full"
                          >
                            {instrument}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setIsFavorited(!isFavorited)}
                    variant="outline"
                    icon={<Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-400' : ''}`} />}
                  >
                    {isFavorited ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    icon={<Share2 className="w-5 h-5" />}
                    onClick={() => navigator.share?.({ 
                      title: user?.name, 
                      url: window.location.href 
                    })}
                  >
                    Share
                  </Button>

                  <Link to={`/booking/new?artistId=${id}`}>
                    <Button icon={<Calendar className="w-5 h-5" />}>
                      Book Session
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 p-1 bg-dark-800 rounded-lg mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">About</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {bio || 'This artist hasn\'t added a bio yet.'}
                  </p>
                  
                  {socialLinks && Object.entries(socialLinks).some(([_, url]) => url) && (
                    <div>
                      <h4 className="font-semibold text-gray-100 mb-3">Connect</h4>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(socialLinks).map(([platform, url]) => {
                          if (!url) return null
                          return (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="capitalize">{platform}</span>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {activeTab === 'portfolio' && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">Portfolio</h3>
                  {media && media.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {media.map((item, index) => (
                        <div key={index} className="bg-dark-700 rounded-lg overflow-hidden">
                          {item.type === 'image' && (
                            <img 
                              src={item.url} 
                              alt={item.title || 'Portfolio item'} 
                              className="w-full h-48 object-cover"
                            />
                          )}
                          {item.type === 'audio' && (
                            <div className="p-4">
                              <div className="flex items-center space-x-3 mb-2">
                                <Play className="w-5 h-5 text-primary-400" />
                                <span className="font-medium">{item.title || 'Audio Track'}</span>
                              </div>
                              <audio controls className="w-full">
                                <source src={item.url} type="audio/mpeg" />
                              </audio>
                            </div>
                          )}
                          {item.description && (
                            <div className="p-3 border-t border-gray-600">
                              <p className="text-sm text-gray-300">{item.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No portfolio items available yet.</p>
                  )}
                </Card>
              )}

              {activeTab === 'reviews' && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">Reviews</h3>
                  {reviewsData?.data?.reviews?.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsData.data.reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-700 pb-4 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center">
                              {review.author?.avatar?.url ? (
                                <img 
                                  src={review.author.avatar.url} 
                                  alt={review.author.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-medium">
                                  {review.author?.name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-100">
                                  {review.author?.name}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-300">{review.comment}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No reviews yet.</p>
                  )}
                </Card>
              )}

              {activeTab === 'availability' && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">Availability</h3>
                  <p className="text-gray-400 mb-4">
                    Book a session to see real-time availability and schedule your session.
                  </p>
                  <Link to={`/booking/new?artistId=${id}`}>
                    <Button icon={<Calendar className="w-5 h-5" />}>
                      Check Availability
                    </Button>
                  </Link>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-gray-100">Usually within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience</span>
                  <span className="text-gray-100">5+ years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed Sessions</span>
                  <span className="text-gray-100">{artist.completedBookings || 0}</span>
                </div>
              </div>
            </Card>

            {/* Similar Artists */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Similar Artists</h3>
              <p className="text-gray-400 text-sm">
                Discover more artists with similar styles and genres.
              </p>
              <Link to="/search?type=artists" className="block mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  Browse Artists
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtistProfile
