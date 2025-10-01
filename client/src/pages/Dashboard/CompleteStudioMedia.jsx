import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Image, Video, Music, Play, Pause, Download, 
  Trash2, Edit, Star, Grid, List, Search, Filter, Eye, X,
  Plus, BarChart3, TrendingUp, FileText, Calendar
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGetStudioMediaQuery, useCreateMediaMutation, useUpdateMediaMutation, useDeleteMediaMutation } from '../../store/mediaApi'
import { getMediaUrl, formatFileSize, isImage, isVideo, isAudio } from '../../utils/mediaUtils'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'

const CompleteStudioMedia = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  const [viewMode, setViewMode] = useState('grid')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [playingAudio, setPlayingAudio] = useState(null)
  const fileInputRef = useRef(null)
  const audioRef = useRef(null)

  const { data: mediaData, isLoading, refetch } = useGetStudioMediaQuery({ 
    studioId 
  }, { skip: !studioId })
  
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
      formData.append('studio', studioId)

      try {
        await createMedia(formData).unwrap()
        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`)
      }
    })

    await Promise.all(uploadPromises)
    setShowUploadModal(false)
    refetch()
  }

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return
    
    try {
      await deleteMedia(mediaId).unwrap()
      toast.success('Media deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete media')
    }
  }

  const handleToggleFeatured = async (mediaItem) => {
    try {
      await updateMedia({
        id: mediaItem._id,
        isFeatured: !mediaItem.isFeatured
      }).unwrap()
      toast.success(mediaItem.isFeatured ? 'Removed from featured' : 'Added to featured')
      refetch()
    } catch (error) {
      toast.error('Failed to update media')
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

  // Statistics calculation
  const mediaStats = {
    total: media.length,
    images: media.filter(m => m.type === 'image').length,
    videos: media.filter(m => m.type === 'video').length,
    audio: media.filter(m => m.type === 'audio').length,
    featured: media.filter(m => m.isFeatured).length,
    totalSize: media.reduce((sum, m) => sum + (m.fileSize || 0), 0)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Media Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your studio's media files and showcase your work
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Files</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{mediaStats.total}</p>
            </div>
            <div className="p-3 bg-blue-200 dark:bg-blue-700 rounded-full">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Images</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{mediaStats.images}</p>
            </div>
            <div className="p-3 bg-green-200 dark:bg-green-700 rounded-full">
              <Image className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Videos</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{mediaStats.videos}</p>
            </div>
            <div className="p-3 bg-purple-200 dark:bg-purple-700 rounded-full">
              <Video className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Featured</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{mediaStats.featured}</p>
            </div>
            <div className="p-3 bg-orange-200 dark:bg-orange-700 rounded-full">
              <Star className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {mediaTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Media Display */}
      {filteredMedia.length === 0 ? (
        <Card className="p-12 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No media found' : 'No media yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms or filters'
              : 'Upload your first media file to get started'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowUploadModal(true)}>
              Upload Your First Media
            </Button>
          )}
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          <AnimatePresence>
            {filteredMedia.map((mediaItem) => {
              const Icon = getMediaIcon(mediaItem.type)
              return (
                <motion.div
                  key={mediaItem._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex items-center p-4' : ''
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        {mediaItem.type === 'image' ? (
                          <>
                            <img
                              src={getMediaUrl(mediaItem.url)}
                              alt={mediaItem.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (!e.target.dataset.errorHandled) {
                                  e.target.dataset.errorHandled = 'true'
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiBzdHJva2U9IiM5Q0E3QjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='
                                  e.target.className = 'w-16 h-16 p-4 text-gray-400 mx-auto object-contain'
                                }
                              }}
                            />
                            <div className="w-full h-full hidden items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <Image className="w-16 h-16 text-gray-400" />
                            </div>
                          </>
                        ) : mediaItem.type === 'video' ? (
                          <video
                            src={getMediaUrl(mediaItem.url)}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Featured Badge */}
                        {mediaItem.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Featured
                            </div>
                          </div>
                        )}
                        
                        {/* Action Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedMedia(mediaItem)
                                setShowPreview(true)
                              }}
                              className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(mediaItem)}
                              className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all"
                            >
                              <Star className={`w-4 h-4 ${mediaItem.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleDeleteMedia(mediaItem._id)}
                              className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {mediaItem.title}
                          </h3>
                          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                        
                        {mediaItem.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {mediaItem.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(mediaItem.fileSize || 0)}</span>
                          <span>{new Date(mediaItem.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {mediaItem.type === 'image' ? (
                          <img
                            src={getMediaUrl(mediaItem.url)}
                            alt={mediaItem.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              if (!e.target.dataset.errorHandled) {
                                e.target.dataset.errorHandled = 'true'
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiBzdHJva2U9IiM5Q0E3QjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi/+Cjwvc3ZnPgo='
                                e.target.className = 'w-6 h-6 p-1 text-gray-400 object-contain'
                              }
                            }}
                          />
                        ) : (
                          <Icon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {mediaItem.title}
                          </h3>
                          {mediaItem.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {mediaItem.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {mediaItem.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(mediaItem.fileSize || 0)}</span>
                          <span>{new Date(mediaItem.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => {
                            setSelectedMedia(mediaItem)
                            setShowPreview(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(mediaItem)}
                          className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${mediaItem.isFeatured ? 'fill-current text-yellow-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(mediaItem._id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Media">
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Support for images, videos, and audio files
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </Modal>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="aspect-video bg-black flex items-center justify-center">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={getMediaUrl(selectedMedia.url)}
                    alt={selectedMedia.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : selectedMedia.type === 'video' ? (
                  <video
                    src={getMediaUrl(selectedMedia.url)}
                    controls
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <audio
                    src={getMediaUrl(selectedMedia.url)}
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
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Size: {formatFileSize(selectedMedia.fileSize || 0)}</span>
                  <span>Uploaded: {new Date(selectedMedia.createdAt).toLocaleDateString()}</span>
                  {selectedMedia.isFeatured && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      Featured
                    </span>
                  )}
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
