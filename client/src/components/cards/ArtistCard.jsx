import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Music, DollarSign } from 'lucide-react'
import Card from '../ui/Card'

const ArtistCard = ({ artist }) => {
  const { user, genres, hourlyRate, ratingAvg, ratingCount, bio } = artist

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/artists/${artist._id}`}>
        <Card hover className="overflow-hidden">
          {/* Avatar */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-light-primary to-light-accent dark:from-primary-600 dark:to-accent-600 rounded-lg mb-4 overflow-hidden">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-16 h-16 text-white/80" />
                </div>
              )}
            </div>
            
            {/* Verified Badge */}
            {user?.verified && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <Star className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-light-text dark:text-gray-100 text-lg line-clamp-1">
                {user?.name}
              </h3>
              
              {/* Location */}
              {(user?.city || user?.country) && (
                <div className="flex items-center text-light-textSecondary dark:text-gray-400 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>
                    {[user?.city, user?.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Genres */}
            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-light-primary/30 dark:bg-primary-900/30 text-light-primary dark:text-primary-300 text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
                {genres.length > 3 && (
                  <span className="px-2 py-1 bg-light-textMuted dark:bg-gray-700 text-light-textSecondary dark:text-gray-300 text-xs rounded-full">
                    +{genres.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Bio */}
            {bio && (
              <p className="text-light-textSecondary dark:text-gray-400 text-sm line-clamp-2">
                {bio}
              </p>
            )}

            {/* Rating and Price */}
            <div className="flex items-center justify-between pt-2 border-t border-light-border dark:border-gray-700">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-light-text dark:text-gray-100">
                  {ratingAvg ? ratingAvg.toFixed(1) : 'New'}
                </span>
                {ratingCount > 0 && (
                  <span className="text-xs text-light-textSecondary dark:text-gray-400">
                    ({ratingCount})
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-light-primary dark:text-primary-400 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>{hourlyRate}/hr</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export default ArtistCard
