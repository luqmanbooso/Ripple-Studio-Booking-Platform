import React, { useState, useEffect } from 'react';
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
import ImageSlider from '../ui/ImageSlider';

const StudioShowcase = ({ studio }) => {
  const [studioMedia, setStudioMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  // Fetch actual studio media from API
  useEffect(() => {
    const fetchStudioMedia = async () => {
      if (!studio?._id) return;
      
      try {
        setIsLoadingMedia(true);
        const response = await fetch(`/api/media/studio/${studio._id}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Transform API data to slider format
          const transformedMedia = data.data.map(item => ({
            id: item._id,
            type: item.type,
            url: item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`,
            thumbnail: item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`,
            caption: item.title || item.description || 'Studio Media'
          }));
          setStudioMedia(transformedMedia);
        }
      } catch (error) {
        console.error('Error fetching studio media:', error);
      } finally {
        setIsLoadingMedia(false);
      }
    };

    fetchStudioMedia();
  }, [studio?._id]);

  // Get media items with fallback
  const getMediaItems = () => {
    const studioName = studio?.name || 'Recording Studio';
    
    // Use actual studio media if available
    if (studioMedia.length > 0) {
      return studioMedia;
    }
    
    // Fallback to beautiful stock images
    return [
      {
        id: 1,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80',
        caption: `${studioName} - Professional Recording Studio`
      },
      {
        id: 2,
        type: 'image', 
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
        caption: `${studioName} - State-of-the-Art Equipment`
      },
      {
        id: 3,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
        caption: `${studioName} - Creative Environment`
      },
      {
        id: 4,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&q=80',
        caption: `${studioName} - Professional Setup`
      }
    ];
  };

  const mediaItems = getMediaItems();

  // Safety check for studio data
  if (!studio) {
    return (
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Loading Studio...</h3>
          <p className="text-gray-400 text-sm">Please wait while we load the studio information.</p>
        </div>
      </Card>
    );
  }

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
      {/* Hero Media Showcase with Enhanced Styling */}
      <Card className="bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-black/80 border border-gray-700/30 shadow-2xl backdrop-blur-lg overflow-hidden">
        <div className="relative group">
          {/* Image Slider with Enhanced Container */}
          <div className="h-80 md:h-[28rem] lg:h-96 relative overflow-hidden">
            {isLoadingMedia ? (
              <div className="w-full h-full bg-gradient-to-br from-slate-800/90 to-gray-900/95 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="absolute inset-0 w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin animate-reverse mx-auto mt-2 ml-2"></div>
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Loading studio gallery...</p>
                </div>
              </div>
            ) : (
              <div className="relative h-full">
                <ImageSlider 
                  images={mediaItems}
                  autoPlay={true}
                  autoPlayInterval={7000}
                  showThumbnails={true}
                  showControls={true}
                />
                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none"></div>
              </div>
            )}
          </div>

          {/* Enhanced Studio Info Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 pointer-events-auto">
              <div className="flex items-end justify-between">
                <div className="flex-1 max-w-4xl">
                  {/* Studio Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        {getStudioTypeIcon(studio.studioType)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                          {studio.name}
                        </h2>
                        {studio.features?.verified && (
                          <div className="flex items-center space-x-1 bg-blue-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                            <Award className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-300 text-xs font-medium">Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-3">
                        <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{studio.location?.city}, {studio.location?.country}</span>
                        </div>
                        
                        {studio.ratingAvg > 0 && (
                          <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-bold text-yellow-300">{studio.ratingAvg}</span>
                            </div>
                            <span className="text-xs text-yellow-200/80">({studio.ratingCount} reviews)</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                          <Music className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-purple-200">{studio.studioType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {studio.description && (
                    <div className="mb-4">
                      <p className="text-gray-200 text-sm lg:text-base max-w-3xl leading-relaxed font-light">
                        {studio.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Enhanced Media Source Indicator */}
                  {!isLoadingMedia && (
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
                        studioMedia.length > 0 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10'
                      }`}>
                        {studioMedia.length > 0 ? (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            {studioMedia.length} Studio {studioMedia.length === 1 ? 'Photo' : 'Photos'}
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Sample Gallery
                          </>
                        )}
                      </span>
                      
                      {/* Additional stats */}
                      <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Live Gallery</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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

    </div>
  );
};

export default StudioShowcase;
