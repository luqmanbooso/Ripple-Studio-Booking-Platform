import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Play, Volume2, Eye, Grid, List } from 'lucide-react';
import ImageSlider from '../ui/ImageSlider';
import Card from '../ui/Card';
import Button from '../ui/Button';

const MediaGallery = ({ 
  media = [], 
  title = "Media Gallery",
  showViewToggle = true,
  defaultView = "slider", // "slider", "grid", "list"
  className = ""
}) => {
  const [viewMode, setViewMode] = useState(defaultView);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const getMediaTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4 text-red-400" />;
      case 'audio':
        return <Volume2 className="w-4 h-4 text-purple-400" />;
      default:
        return <ImageIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  const getMediaType = (url) => {
    if (!url) return 'image';
    const extension = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) return 'audio';
    return 'image';
  };

  const handleImageError = (e) => {
    if (!e.target.dataset.errorHandled) {
      e.target.dataset.errorHandled = 'true';
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIiByeD0iNCIvPgo8cGF0aCBkPSJNOSA5SDE1VjE1SDlWOVoiIGZpbGw9IiM2Mzc0OEEiLz4KPHN2Zz4K';
      e.target.className = 'w-full h-full object-cover opacity-50';
    }
  };

  if (!media || media.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 ${className}`}>
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Media Available</h3>
          <p className="text-gray-400 text-sm">No photos or videos have been uploaded yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-100 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          {title}
          <span className="ml-2 px-2 py-1 bg-pink-500/20 text-pink-300 text-sm rounded-full">
            {media.length} items
          </span>
        </h3>

        {/* View Toggle */}
        {showViewToggle && (
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                viewMode === 'slider'
                  ? 'bg-purple-500/30 text-purple-300'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Slider
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-500/30 text-purple-300'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-purple-500/30 text-purple-300'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'slider' && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm overflow-hidden">
          <ImageSlider 
            images={media}
            autoPlay={true}
            autoPlayInterval={5000}
            showThumbnails={true}
            showControls={true}
            className="aspect-video"
          />
        </Card>
      )}

      {viewMode === 'grid' && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {media.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-800/50 border border-gray-600/30">
                  {getMediaType(item.url || item.src || item) === 'image' ? (
                    <img
                      src={item.thumbnail || item.url || item.src || item}
                      alt={item.caption || 'Media item'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={handleImageError}
                    />
                  ) : getMediaType(item.url || item.src || item) === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url || item.src || item}
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
                        {getMediaTypeIcon(getMediaType(item.url || item.src || item))}
                        <Eye className="w-4 h-4 text-white" />
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
        </Card>
      )}

      {viewMode === 'list' && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
          <div className="divide-y divide-gray-700/50">
            {media.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.3)' }}
                className="flex items-center space-x-4 p-4 cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800/50 flex-shrink-0">
                  <img
                    src={item.thumbnail || item.url || item.src || item}
                    alt={item.caption || 'Media item'}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getMediaTypeIcon(getMediaType(item.url || item.src || item))}
                    <span className="text-gray-300 text-sm font-medium">
                      {getMediaType(item.url || item.src || item).charAt(0).toUpperCase() + 
                       getMediaType(item.url || item.src || item).slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-100 font-medium truncate">
                    {item.caption || item.name || `Media ${index + 1}`}
                  </p>
                  {item.description && (
                    <p className="text-gray-400 text-sm truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Lightbox for selected media */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50">
          <ImageSlider 
            images={[selectedMedia]}
            autoPlay={false}
            showThumbnails={false}
            showControls={true}
            onImageClick={() => setSelectedMedia(null)}
          />
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
