import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Image, Video, Music, Play, Pause, Download, 
  Trash2, Edit, Star, Grid, List, Search, Filter, Eye, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGetMediaQuery, useCreateMediaMutation, useUpdateMediaMutation, useDeleteMediaMutation } from '../../store/mediaApi'

const CompleteStudioMedia = () => {
  const { user } = useSelector(state => state.auth)
  const [viewMode, setViewMode] = useState('grid')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [playingAudio, setPlayingAudio] = useState(null)
  const fileInputRef = useRef(null)
  const audioRef = useRef(null)

  const { data: mediaData, isLoading, refetch } = useGetMediaQuery({
    studio: user?.studio?._id || user?.studio
  })
  
  const [createMedia] = useCreateMediaMutation()
  const [updateMedia] = useUpdateMediaMutation()
  const [deleteMedia] = useDeleteMediaMutation()

  const media = mediaData?.data || []

  const mediaTypes = [
    { id: 'all', name: 'All Media', icon: Grid },
    { id: 'image', name: 'Images', icon: Image },
    { id: 'video', name: 'Videos', icon: Video },
    { id: 'audio', name: 'Audio', icon: Music }
  ]

  const filteredMedia = media.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleFileUpload = async (files) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name.split('.')[0])
      formData.append('type', file.type.startsWith('image/') ? 'image' : 
                            file.type.startsWith('video/') ? 'video' : 'audio')
      formData.append('studio', user?.studio?._id || user?.studio)

      try {
        await createMedia(formData).unwrap()
        return { success: true, name: file.name }
      } catch (error) {
        return { success: false, name: file.name, error: error.message }
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    if (successful > 0) {
      toast.success(`${successful} file(s) uploaded successfully!`)
      refetch()
    }
    if (failed > 0) {
      toast.error(`${failed} file(s) failed to upload`)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDelete = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        await deleteMedia(mediaId).unwrap()
        toast.success('Media deleted successfully!')
        refetch()
      } catch (error) {
        toast.error('Failed to delete media')
      }
    }
  }

  const handleToggleFeatured = async (mediaItem) => {
    try {
      await updateMedia({
        id: mediaItem._id,
        featured: !mediaItem.featured
      }).unwrap()
      toast.success(mediaItem.featured ? 'Removed from featured' : 'Added to featured')
      refetch()
    } catch (error) {
      toast.error('Failed to update media')
    }
  }

  const handlePlayAudio = (mediaItem) => {
    if (playingAudio === mediaItem._id) {
      audioRef.current?.pause()
      setPlayingAudio(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = mediaItem.url
        audioRef.current.play()
        setPlayingAudio(mediaItem._id)
      }
    }
  }

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return Image
      case 'video': return Video
      case 'audio': return Music
      default: return Grid
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Gallery</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your studio's photos, videos, and audio samples
          </p>
        </div>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {mediaTypes.map((type) => {
          const count = type.id === 'all' ? media.length : media.filter(m => m.type === type.id).length
          const Icon = type.icon
          return (
            <div key={type.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
                <Icon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {mediaTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>

        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMedia.map((mediaItem) => {
              const Icon = getMediaIcon(mediaItem.type)
              return (
                <motion.div
                  key={mediaItem._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                    {mediaItem.type === 'image' ? (
                      <img
                        src={mediaItem.url}
                        alt={mediaItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : mediaItem.type === 'video' ? (
                      <video
                        src={mediaItem.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMedia(mediaItem)
                            setShowPreview(true)
                          }}
                          className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {mediaItem.type === 'audio' && (
                          <button
                            onClick={() => handlePlayAudio(mediaItem)}
                            className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            {playingAudio === mediaItem._id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {mediaItem.featured && (
                      <div className="absolute top-2 right-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                      {mediaItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {formatFileSize(mediaItem.size)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500 capitalize">{mediaItem.type}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleFeatured(mediaItem)}
                          className={`p-1 rounded transition-colors ${
                            mediaItem.featured
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mediaItem._id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredMedia.map((mediaItem) => {
                const Icon = getMediaIcon(mediaItem.type)
                return (
                  <motion.div
                    key={mediaItem._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {mediaItem.type === 'image' ? (
                          <img
                            src={mediaItem.url}
                            alt={mediaItem.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Icon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {mediaItem.title}
                          </h3>
                          {mediaItem.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {mediaItem.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="capitalize">{mediaItem.type}</span>
                          <span>{formatFileSize(mediaItem.size)}</span>
                          <span>{new Date(mediaItem.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {mediaItem.type === 'audio' && (
                          <button
                            onClick={() => handlePlayAudio(mediaItem)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {playingAudio === mediaItem._id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMedia(mediaItem)
                            setShowPreview(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(mediaItem)}
                          className={`p-2 transition-colors ${
                            mediaItem.featured
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mediaItem._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No media files found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Upload your first media file to get started'
            }
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Upload Media
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Media</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports images, videos, and audio files
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleFileUpload(e.target.files)
                    setShowUploadModal(false)
                  }
                }}
                className="hidden"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
            >
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="aspect-video bg-black flex items-center justify-center">
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : selectedMedia.type === 'video' ? (
                    <video
                      src={selectedMedia.url}
                      controls
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <audio
                      src={selectedMedia.url}
                      controls
                      className="w-full max-w-md"
                    />
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedMedia.title}
                  </h3>
                  {selectedMedia.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedMedia.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize">{selectedMedia.type}</span>
                    <span>{formatFileSize(selectedMedia.size)}</span>
                    <span>{new Date(selectedMedia.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Player */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />
    </div>
  )
}

export default CompleteStudioMedia
