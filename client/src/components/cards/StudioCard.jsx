import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Building, DollarSign, Users } from 'lucide-react'
import Card from '../ui/Card'

const StudioCard = ({ studio }) => {
  const { user, name, location, services, ratingAvg, ratingCount, description, gallery } = studio

  const minPrice = services?.length > 0 ? Math.min(...services.map(s => s.price)) : null

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/studios/${studio._id}`}>
        <Card hover className="overflow-hidden">
          {/* Studio Image */}
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-accent-600 to-primary-600 rounded-lg mb-4 overflow-hidden">
              {gallery && gallery.length > 0 ? (
                <img
                  src={gallery[0].url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="w-16 h-16 text-white/80" />
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
              <h3 className="font-semibold text-gray-100 text-lg line-clamp-1">
                {name}
              </h3>
              
              {/* Location */}
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {[location?.city, location?.country].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>

            {/* Services */}
            {services && services.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 2).map((service) => (
                  <span
                    key={service.name}
                    className="px-2 py-1 bg-accent-900/30 text-accent-300 text-xs rounded-full"
                  >
                    {service.name}
                  </span>
                ))}
                {services.length > 2 && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    +{services.length - 2} more
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-gray-400 text-sm line-clamp-2">
                {description}
              </p>
            )}

            {/* Rating and Price */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-100">
                  {ratingAvg ? ratingAvg.toFixed(1) : 'New'}
                </span>
                {ratingCount > 0 && (
                  <span className="text-xs text-gray-400">
                    ({ratingCount})
                  </span>
                )}
              </div>
              
              {minPrice && (
                <div className="flex items-center text-accent-400 font-semibold">
                  <span className="text-xs mr-1">from</span>
                  <DollarSign className="w-4 h-4" />
                  <span>{minPrice}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export default StudioCard
