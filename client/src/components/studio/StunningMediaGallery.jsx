import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  Download,
  Share2,
  Heart,
  Eye
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const StunningMediaGallery = ({ studio, media = [] }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'mosaic'
  const [filter, setFilter] = useState('all'); // 'all', 'images', 'videos', 'audio'

  // Filter media based on type
  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'images') return item.type === 'image';
    if (filter === 'videos') return item.type === 'video';
    if (filter === 'audio') return item.type === 'audio';
    return true;
  });

  const openLightbox = (item, index) => {
    setSelectedMedia(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    setIsPlaying(false);
  };

  const navigateMedia = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredMedia.length
      : (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
    
    setCurrentIndex(newIndex);
    setSelectedMedia(filteredMedia[newIndex]);
    setIsPlaying(false);
  };

  const getMediaTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Play className="w-6 h-6" />;
      case 'audio':
        return <Volume2 className="w-6 h-6" />;
      default:
        return <Image className="w-6 h-6" />;
    }
  };

  const getMediaTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'from-red-500 to-pink-600';
      case 'audio':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedMedia) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateMedia('prev');
          break;
        case 'ArrowRight':
          navigateMedia('next');
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedMedia, isPlaying, currentIndex]);

  if (!media || media.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Media Available</h3>
          <p className="text-gray-400 text-sm">This studio hasn't uploaded any photos or videos yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-100 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Image className="w-4 h-4 text-white" />
            </div>
            Studio Gallery
            <span className="ml-2 px-2 py-1 bg-pink-500/20 text-pink-300 text-sm rounded-full">
              {filteredMedia.length} items
            </span>
          </h3>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2">
            {['all', 'images', 'videos', 'audio'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === filterType
                    ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item, index) => (
            <motion.div
              key={item.id || index}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
              onClick={() => openLightbox(item, index)}
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-800/50 border border-gray-600/30">
                {item.type === 'image' ? (
                  <img
                    src={item.url || item.thumbnail}
                    alt={item.caption || 'Studio media'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : item.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      poster={item.thumbnail}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-500/80 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-600/20 flex items-center justify-center">
                    <Volume2 className="w-8 h-8 text-purple-400" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 bg-gradient-to-br ${getMediaTypeColor(item.type)} rounded-lg flex items-center justify-center`}>
                        {getMediaTypeIcon(item.type)}
                      </div>
                      <div className="flex items-center space-x-1">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    {item.caption && (
                      <p className="text-white text-xs mt-2 truncate">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        {media.length > 8 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              className="border-gray-600 hover:border-gray-500"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All {media.length} Items
            </Button>
          </div>
        )}
      </Card>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${getMediaTypeColor(selectedMedia.type)} rounded-lg flex items-center justify-center`}>
                      {getMediaTypeIcon(selectedMedia.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {selectedMedia.caption || 'Studio Media'}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {currentIndex + 1} of {filteredMedia.length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={closeLightbox}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Media Content */}
              <div className="relative">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.caption}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                ) : selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay={isPlaying}
                    muted={isMuted}
                    className="max-w-full max-h-[80vh]"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 flex items-center justify-center">
                    <audio
                      src={selectedMedia.url}
                      controls
                      autoPlay={isPlaying}
                      className="w-full max-w-md"
                    />
                  </div>
                )}

                {/* Navigation Arrows */}
                {filteredMedia.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateMedia('prev')}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateMedia('next')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Footer */}
              {selectedMedia.caption && (
                <div className="p-4 bg-gray-800/50">
                  <p className="text-gray-200 text-sm">
                    {selectedMedia.caption}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StunningMediaGallery;
