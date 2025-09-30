import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image, Video, Music, Plus, Search, Grid, List, Edit, Trash2, 
  Star, Upload, Eye, Download, Share2, Filter, Calendar,
  Play, Pause, Volume2, BarChart3, TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetMediaQuery, useCreateMediaMutation, useUpdateMediaMutation, useDeleteMediaMutation } from '../../store/mediaApi'

const StudioMediaManager = () => {
  const { user } = useSelector(state => state.auth)
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const [previewMedia, setPreviewMedia] = useState(null)

  const { data: mediaData, isLoading } = useGetMediaQuery({
    studio: user?.studio?._id,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: search || undefined
  }, { skip: !user?.studio?._id })

  const [createMedia] = useCreateMediaMutation()
  const [updateMedia] = useUpdateMediaMutation()
  const [deleteMedia] = useDeleteMediaMutation()

  const media = mediaData?.data || []

  const handleCreateMedia = async (mediaData) => {
    try {
      await createMedia({ ...mediaData, studio: user.studio._id }).unwrap()
      toast.success('Media uploaded successfully')
      setShowModal(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to upload media')
    }
  }

  const handleUpdateMedia = async (mediaData) => {
    try {
      await updateMedia({ id: selectedMedia._id, ...mediaData }).unwrap()
      toast.success('Media updated successfully')
      setShowModal(false)
      setSelectedMedia(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update media')
    }
  }

  const handleDeleteMedia = async (id) => {
    if (window.confirm('Delete this media file?')) {
      try {
        await deleteMedia(id).unwrap()
        toast.success('Media deleted')
      } catch (error) {
        toast.error('Failed to delete media')
      }
    }
  }

  const getMediaStats = () => {
    const total = media.length
    const images = media.filter(m => m.type === 'image').length
    const videos = media.filter(m => m.type === 'video').length
    const audio = media.filter(m => m.type === 'audio').length
    const featured = media.filter(m => m.featured).length
    
    return { total, images, videos, audio, featured }
  }

  const stats = getMediaStats()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Gallery</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your studio's photos, videos, and audio files</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Upload Media
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Images</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.images}</p>
            </div>
            <Image className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.videos}</p>
            </div>
            <Video className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Audio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.audio}</p>
            </div>
            <Music className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.featured}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
          
          <div className="flex space-x-2">
            <Button variant={viewMode === 'grid' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Media Grid/List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {media.map((item) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {viewMode === 'grid' ? (
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      ) : item.type === 'video' ? (
                        <div className="flex items-center justify-center h-full bg-gray-900">
                          <Video className="w-12 h-12 text-white" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-500">
                          <Music className="w-12 h-12 text-white" />
                        </div>
                      )}
                      
                      {item.featured && (
                        <div className="absolute top-2 left-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => (setPreviewMedia(item), setShowPreview(true))} className="bg-white/90">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => (setSelectedMedia(item), setShowModal(true))} className="bg-white/90">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteMedia(item._id)} className="bg-white/90 text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 truncate">{item.title}</h3>
                      {item.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.type}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                        ) : item.type === 'video' ? (
                          <Video className="w-8 h-8 text-gray-600" />
                        ) : (
                          <Music className="w-8 h-8 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.title}</h3>
                          {item.featured && <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{item.type}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => (setPreviewMedia(item), setShowPreview(true))}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => (setSelectedMedia(item), setShowModal(true))}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteMedia(item._id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Media Upload/Edit Modal */}
      <MediaModal
        isOpen={showModal}
        onClose={() => (setShowModal(false), setSelectedMedia(null))}
        media={selectedMedia}
        onSubmit={selectedMedia ? handleUpdateMedia : handleCreateMedia}
      />

      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        media={previewMedia}
      />
    </div>
  )
}

const MediaModal = ({ isOpen, onClose, media, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'image', url: '', tags: [], featured: false
  })

  React.useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || '',
        description: media.description || '',
        type: media.type || 'image',
        url: media.url || '',
        tags: media.tags || [],
        featured: media.featured || false
      })
    } else {
      setFormData({
        title: '', description: '', type: 'image', url: '', tags: [], featured: false
      })
    }
  }, [media, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={media ? 'Edit Media' : 'Upload Media'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL *</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured media</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {media ? 'Update' : 'Upload'} Media
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const MediaPreviewModal = ({ isOpen, onClose, media }) => {
  if (!media) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={media.title} size="xl">
      <div className="space-y-4">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {media.type === 'image' ? (
            <img src={media.url} alt={media.title} className="w-full h-full object-contain" />
          ) : media.type === 'video' ? (
            <video src={media.url} controls className="w-full h-full">
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex items-center justify-center h-full">
              <audio src={media.url} controls className="w-full max-w-md">
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}
        </div>
        
        {media.description && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
            <p className="text-gray-600 dark:text-gray-400">{media.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">Type:</span>
            <span className="ml-2 capitalize text-gray-600 dark:text-gray-400">{media.type}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-white">Created:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(media.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default StudioMediaManager
