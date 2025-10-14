import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  X,
  Download,
  Share2,
  Heart,
  Eye
} from 'lucide-react';

const ImageSlider = ({ 
  images = [], 
  autoPlay = true, 
  autoPlayInterval = 5000,
  showThumbnails = true,
  showControls = true,
  className = "",
  onImageClick = null
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const intervalRef = useRef(null);
  const sliderRef = useRef(null);

  // Reset currentIndex when images change
  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, images.length, autoPlayInterval]);

  // Navigation functions
  const goToNext = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goToPrev = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToSlide = (index) => {
    if (images.length > 0 && index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrev();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isPlaying, isFullscreen]);

  // Get media type
  const getMediaType = (url) => {
    if (!url) return 'image';
    const extension = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) return 'audio';
    return 'image';
  };

  // Fallback image handler
  const handleImageError = (e) => {
    if (!e.target.dataset.errorHandled) {
      e.target.dataset.errorHandled = 'true';
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIiByeD0iNCIvPgo8cGF0aCBkPSJNOSA5SDE1VjE1SDlWOVoiIGZpbGw9IiM2Mzc0OEEiLz4KPHN2Zz4K';
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">No Media Available</h3>
            <p className="text-gray-400 text-sm">Studio media will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex] || null;
  const mediaType = currentImage ? getMediaType(currentImage?.url || currentImage?.src || currentImage) : 'image';

  return (
    <>
      <div 
        ref={sliderRef}
        className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image Display */}
        <div className="relative aspect-video overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {mediaType === 'video' ? (
                <video
                  src={currentImage?.url || currentImage?.src || currentImage}
                  poster={currentImage?.thumbnail}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                />
              ) : mediaType === 'audio' ? (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                  <div className="text-center">
                    <Volume2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <audio
                      src={currentImage?.url || currentImage?.src || currentImage}
                      controls
                      className="w-full max-w-md"
                    />
                    {currentImage?.caption && (
                      <p className="text-white mt-4 text-sm">{currentImage.caption}</p>
                    )}
                  </div>
                </div>
              ) : (
                <img
                  src={currentImage?.url || currentImage?.src || currentImage}
                  alt={currentImage?.caption || `Slide ${currentIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onError={handleImageError}
                  onLoad={() => {
                    // Image loaded successfully
                  }}
                  onClick={() => {
                    if (onImageClick) {
                      onImageClick(currentImage, currentIndex);
                    } else {
                      setIsFullscreen(true);
                    }
                  }}
                  crossOrigin="anonymous"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          {/* Enhanced Navigation Arrows */}
          {showControls && images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-black/60 to-black/40 hover:from-black/80 hover:to-black/60 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:scale-105 z-10 group"
              >
                <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-l from-black/60 to-black/40 hover:from-black/80 hover:to-black/60 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:scale-105 z-10 group"
              >
                <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          )}

          {/* Enhanced Top Controls */}
          {showControls && (
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              {images.length > 1 && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-gradient-to-br from-black/60 to-black/40 hover:from-black/80 hover:to-black/60 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:scale-105 group"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 transition-transform group-hover:scale-110" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 transition-transform group-hover:scale-110" />
                  )}
                </button>
              )}
              <button
                onClick={() => setIsFullscreen(true)}
                className="w-10 h-10 bg-gradient-to-br from-black/60 to-black/40 hover:from-black/80 hover:to-black/60 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <Maximize2 className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-black/60 to-black/40 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/10 shadow-lg">
              <span className="font-medium">{currentIndex + 1}</span>
              <span className="text-white/60 mx-1">/</span>
              <span className="text-white/80">{images.length}</span>
            </div>
          )}

          {/* Caption */}
          {currentImage?.caption && (
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="p-4 bg-gradient-to-r from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md border-t border-white/5">
            <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-18 h-18 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                    index === currentIndex
                      ? 'border-purple-400 shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/20'
                      : 'border-gray-600/30 hover:border-gray-500/50 hover:shadow-md'
                  }`}
                >
                  <img
                    src={image?.thumbnail || image?.url || image?.src || image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      index === currentIndex ? 'scale-105' : 'hover:scale-110'
                    }`}
                    onError={handleImageError}
                  />
                  {/* Active indicator */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full shadow-lg"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Indicators */}
        {images.length > 1 && !showThumbnails && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-7xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Fullscreen Image */}
              <img
                src={currentImage?.url || currentImage?.src || currentImage}
                alt={currentImage?.caption || `Slide ${currentIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onError={handleImageError}
              />

              {/* Fullscreen Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Fullscreen Caption */}
              {currentImage?.caption && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-lg bg-black/50 px-6 py-3 rounded-lg backdrop-blur-sm">
                    {currentImage.caption}
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

export default ImageSlider;
