import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Image as ImageIcon, 
  Volume2, 
  Star, 
  MapPin, 
  Users, 
  Award,
  Headphones,
  Mic,
  Music,
  Camera,
  Zap,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../ui/Card';

const StudioShowcase = ({ studio }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showAllMedia, setShowAllMedia] = useState(false);

  // Mock media data - replace with actual studio.gallery
  const mediaItems = studio.gallery || [
    {
      id: 1,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
      caption: 'Main Recording Room'
    },
    {
      id: 2,
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      caption: 'Professional Mixing Console'
    },
    {
      id: 3,
      type: 'video',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      caption: 'Studio Tour Video'
    }
  ];

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const getStudioTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'recording': return <Mic className="w-5 h-5" />;
      case 'mixing': return <Headphones className="w-5 h-5" />;
      case 'mastering': return <Music className="w-5 h-5" />;
      case 'live': return <Users className="w-5 h-5" />;
      default: return <Music className="w-5 h-5" />;
    }
  };

  const getEquipmentIcon = (equipment) => {
    const name = equipment.toLowerCase();
    if (name.includes('mic') || name.includes('microphone')) return <Mic className="w-4 h-4" />;
    if (name.includes('console') || name.includes('mixer')) return <Headphones className="w-4 h-4" />;
    if (name.includes('camera')) return <Camera className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero Media Showcase */}
      <Card className="bg-gradient-to-br from-gray-900/90 to-black/50 border-gray-700/50 backdrop-blur-sm overflow-hidden">
        <div className="relative">
          {/* Main Media Display */}
          <div className="relative h-80 md:h-96 overflow-hidden rounded-t-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMediaIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {mediaItems[currentMediaIndex]?.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={mediaItems[currentMediaIndex].url}
                      poster={mediaItems[currentMediaIndex].thumbnail}
                      className="w-full h-full object-cover"
                      muted
                      loop
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-500/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={mediaItems[currentMediaIndex]?.url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'}
                      alt={mediaItems[currentMediaIndex]?.caption || 'Studio'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Studio Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      {getStudioTypeIcon(studio.studioType)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {studio.name}
                      </h2>
                      <div className="flex items-center space-x-4 text-gray-300">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{studio.location?.city}, {studio.location?.country}</span>
                        </div>
                        {studio.ratingAvg > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{studio.ratingAvg}</span>
                            <span className="text-xs text-gray-400">({studio.ratingCount} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {studio.description && (
                    <p className="text-gray-200 text-sm max-w-2xl leading-relaxed">
                      {studio.description}
                    </p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="hidden md:flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2 bg-black/30 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Music className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm font-medium">{studio.studioType}</span>
                  </div>
                  {studio.features?.verified && (
                    <div className="flex items-center space-x-2 bg-green-500/20 rounded-full px-3 py-1 backdrop-blur-sm">
                      <Award className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media Indicators */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 right-4 flex space-x-2">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentMediaIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Equipment & Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Showcase */}
        {studio.equipment && studio.equipment.length > 0 && (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-4 h-4 text-white" />
              </div>
              Professional Equipment
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {studio.equipment.slice(0, 6).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    {getEquipmentIcon(item)}
                  </div>
                  <span className="text-gray-200 font-medium">{item}</span>
                </motion.div>
              ))}
              {studio.equipment.length > 6 && (
                <div className="text-center pt-2">
                  <span className="text-gray-400 text-sm">
                    +{studio.equipment.length - 6} more items
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Services Preview */}
        {studio.services && studio.services.length > 0 && (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Music className="w-4 h-4 text-white" />
              </div>
              Available Services
            </h3>
            <div className="space-y-3">
              {studio.services.slice(0, 3).map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div>
                    <h4 className="text-gray-100 font-medium">{service.name}</h4>
                    <p className="text-gray-400 text-sm">{service.durationMins} minutes</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${service.price}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Media Thumbnails */}
      {mediaItems.length > 1 && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-100 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              Studio Gallery
            </h3>
            <button
              onClick={() => setShowAllMedia(!showAllMedia)}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              {showAllMedia ? 'Show Less' : `View All ${mediaItems.length}`}
            </button>
          </div>
          
          <div className={`grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 ${!showAllMedia ? 'max-h-32 overflow-hidden' : ''}`}>
            {mediaItems.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMediaIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentMediaIndex 
                    ? 'border-purple-400 shadow-lg shadow-purple-500/30' 
                    : 'border-gray-600/50 hover:border-gray-500'
                }`}
              >
                <img
                  src={item.thumbnail || item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                )}
                {item.type === 'audio' && (
                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudioShowcase;
