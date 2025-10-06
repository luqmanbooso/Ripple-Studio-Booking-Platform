import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Building,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import Card from "../ui/Card";
import QuickBookingButton from "../ui/QuickBookingButton";

const StudioCard = ({ studio }) => {
  const {
    user,
    name,
    location,
    services,
    ratingAvg,
    ratingCount,
    description,
    gallery,
  } = studio;
  const [isHovered, setIsHovered] = useState(false);

  const minPrice =
    services?.length > 0 ? Math.min(...services.map((s) => s.price)) : null;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <Link to={`/studios/${studio._id}`}>
        <Card hover className="overflow-hidden relative">
          {/* Studio Image */}
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-light-accent to-light-primary dark:from-accent-600 dark:to-primary-600 rounded-lg mb-4 overflow-hidden">
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

              {/* Quick Book Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                onClick={(e) => e.preventDefault()}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="pointer-events-auto"
                >
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({ studioId: studio._id });
                      window.location.href = `/booking/new?${params.toString()}`;
                    }}
                    className="bg-white/95 hover:bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm border border-white/20"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Quick Book</span>
                  </button>
                </motion.div>
              </motion.div>
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
                {name}
              </h3>

              {/* Location */}
              <div className="flex items-center text-light-textSecondary dark:text-gray-400 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {[location?.city, location?.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>

            {/* Services */}
            {services && services.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 2).map((service) => (
                  <span
                    key={service.name}
                    className="px-2 py-1 bg-light-accent/30 dark:bg-accent-900/30 text-light-accent dark:text-accent-300 text-xs rounded-full"
                  >
                    {service.name}
                  </span>
                ))}
                {services.length > 2 && (
                  <span className="px-2 py-1 bg-light-textMuted dark:bg-gray-700 text-light-textSecondary dark:text-gray-300 text-xs rounded-full">
                    +{services.length - 2} more
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-light-textSecondary dark:text-gray-400 text-sm line-clamp-2">
                {description}
              </p>
            )}

            {/* Rating and Price */}
            <div className="flex items-center justify-between pt-2 border-t border-light-border dark:border-gray-700">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-light-text dark:text-gray-100">
                  {ratingAvg ? ratingAvg.toFixed(1) : "New"}
                </span>
                {ratingCount > 0 && (
                  <span className="text-xs text-light-textSecondary dark:text-gray-400">
                    ({ratingCount})
                  </span>
                )}
              </div>

              {minPrice && (
                <div className="flex items-center text-light-accent dark:text-accent-400 font-semibold">
                  <span className="text-xs mr-1">from</span>
                  <DollarSign className="w-4 h-4" />
                  <span>{minPrice}</span>
                </div>
              )}
            </div>

            {/* Quick Action Footer */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isHovered ? "auto" : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-light-border dark:border-gray-700"
              onClick={(e) => e.preventDefault()}
            >
              <div className="pt-4 pb-1 pointer-events-auto">
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 10px 10px -5px rgba(59, 130, 246, 0.04)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const params = new URLSearchParams({ studioId: studio._id });
                    window.location.href = `/booking/new?${params.toString()}`;
                  }}
                  className="relative w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white py-3.5 px-5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group overflow-hidden"
                >
                  {/* Animated background shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  
                  <div className="relative flex items-center space-x-3">
                    <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold leading-tight">Book Now</span>
                      <span className="text-xs text-blue-100 group-hover:text-white transition-colors duration-200 opacity-90">Instant booking</span>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center space-x-2">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-blue-100 group-hover:text-white transition-colors duration-200">PayHere</span>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-xs text-blue-200 group-hover:text-blue-50 transition-colors duration-200 opacity-75">Secure payment</span>
                    </div>
                    <div className="flex items-center space-x-0.5 ml-2">
                      <motion.div 
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-blue-200 group-hover:text-white transition-colors duration-200"
                      >
                        →
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default StudioCard;
