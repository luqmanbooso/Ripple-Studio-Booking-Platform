import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image,
  Video,
  Music,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  StarOff,
  Upload,
  Download,
  Grid,
  List,
  Play,
  Pause,
  Volume2,
  FileText,
  Calendar,
  User,
  Tag,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { 
  useGetStudioMediaQuery,
  useCreateMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useToggleFeaturedMutation
} from '../../store/mediaApi'

const AdminMediaManager = () => {
  const [selectedStudio, setSelectedStudio] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('create')
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [previewMedia, setPreviewMedia] = useState(null)

  // API hooks
  const { data: mediaData, isLoading, error } = useGetStudioMediaQuery({
    studioId: selectedStudio !== 'all' ? selectedStudio : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page,
    limit: 20,
    search: search || undefined
  }, { skip: !selectedStudio || selectedStudio === 'all' })

  const [createMedia] = useCreateMediaMutation()
  const [updateMedia] = useUpdateMediaMutation()
  const [deleteMedia] = useDeleteMediaMutation()
  const [toggleFeatured] = useToggleFeaturedMutation()

  const handleCreateMedia = async (mediaData) => {
    try {
      await createMedia(mediaData).unwrap()
      toast.success('Media created successfully')
      setShowModal(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create media')
    }
  }

  const handleUpdateMedia = async (mediaData) => {
    try {
      await updateMedia({ id: selectedMedia.id, ...mediaData }).unwrap()
      toast.success('Media updated successfully')
      setShowModal(false)
      setSelectedMedia(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update media')
    }
  }

  const handleDeleteMedia = async (id) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        await deleteMedia(id).unwrap()
        toast.success('Media deleted successfully')
      } catch (error) {
        toast.error(error.data?.message || 'Failed to delete media')
      }
    }
  }

  const handleToggleFeatured = async (id) => {
    try {
      await toggleFeatured(id).unwrap()
      toast.success('Featured status updated')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update featured status')
    }
  }

  const openModal = (type, media = null) => {
    setModalType(type)
    setSelectedMedia(media)
    setShowModal(true)
  }

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Music className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Media Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage studio media files and assets
          </p>
        </div>
        <Button
          onClick={() => openModal('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Media
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Media
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Media Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Studio
            </label>
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Studios</option>
              {/* Add studio options here */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Mode
            </label>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            Error loading media: {error.message}
          </p>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {mediaData?.data?.map((media) => (
            <motion.div
              key={media._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={viewMode === 'grid' ? '' : 'w-full'}
            >
              <Card className={`overflow-hidden ${viewMode === 'list' ? 'flex items-center p-4' : 'p-0'}`}>
                {viewMode === 'grid' ? (
                  <>
                    {/* Media Preview */}
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                      ) : media.type === 'video' ? (
                        <div className="flex items-center justify-center h-full">
                          <Video className="w-12 h-12 text-gray-400" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Music className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {media.isFeatured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewMedia(media)}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleFeatured(media._id)}
                          className="bg-white/90 hover:bg-white"
                        >
                          {media.isFeatured ? (
                            <StarOff className="w-3 h-3" />
                          ) : (
                            <Star className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Media Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {media.title}
                        </h3>
                        <div className="flex items-center space-x-1 ml-2">
                          {getMediaIcon(media.type)}
                        </div>
                      </div>

                      {media.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {media.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{formatFileSize(media.fileSize)}</span>
                        {media.duration && (
                          <span>{formatDuration(media.duration)}</span>
                        )}
                      </div>

                      {/* Tags */}
                      {media.tags && media.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {media.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {media.tags.length > 3 && (
                            <span className="text-gray-500 text-xs">
                              +{media.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal('edit', media)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMedia(media._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                      {getMediaIcon(media.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {media.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          {media.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openModal('edit', media)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMedia(media._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="capitalize">{media.type}</span>
                        <span>{formatFileSize(media.fileSize)}</span>
                        {media.duration && (
                          <span>{formatDuration(media.duration)}</span>
                        )}
                        <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Media Modal */}
      <MediaModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedMedia(null)
        }}
        type={modalType}
        media={selectedMedia}
        onSubmit={modalType === 'create' ? handleCreateMedia : handleUpdateMedia}
      />

      {/* Preview Modal */}
      <PreviewModal
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  )
}

// Media Modal Component
const MediaModal = ({ isOpen, onClose, type, media, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image',
    url: '',
    studio: '',
    tags: [],
    isPublic: true,
    isFeatured: false,
    fileSize: '',
    duration: '',
    format: ''
  })

  React.useEffect(() => {
    if (media && type === 'edit') {
      setFormData({
        title: media.title || '',
        description: media.description || '',
        type: media.type || 'image',
        url: media.url || '',
        studio: media.studio || '',
        tags: media.tags || [],
        isPublic: media.isPublic !== undefined ? media.isPublic : true,
        isFeatured: media.isFeatured || false,
        fileSize: media.fileSize || '',
        duration: media.duration || '',
        format: media.format || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'image',
        url: '',
        studio: '',
        tags: [],
        isPublic: true,
        isFeatured: false,
        fileSize: '',
        duration: '',
        format: ''
      })
    }
  }, [media, type, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({ ...prev, tags }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${type === 'create' ? 'Add' : 'Edit'} Media`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL *
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="studio, music, recording"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Size (bytes)
            </label>
            <input
              type="number"
              value={formData.fileSize}
              onChange={(e) => setFormData(prev => ({ ...prev, fileSize: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {type === 'create' ? 'Create' : 'Update'} Media
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Preview Modal Component
const PreviewModal = ({ media, onClose }) => {
  if (!media) return null

  return (
    <Modal isOpen={!!media} onClose={onClose} title="Media Preview" size="lg">
      <div className="space-y-4">
        {/* Media Display */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.title}
              className="w-full h-auto max-h-96 object-contain"
            />
          ) : media.type === 'video' ? (
            <video
              src={media.url}
              controls
              className="w-full h-auto max-h-96"
            />
          ) : (
            <audio
              src={media.url}
              controls
              className="w-full"
            />
          )}
        </div>

        {/* Media Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {media.title}
            </h3>
            {media.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {media.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <span className="ml-2 capitalize">{media.type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
              <span className="ml-2">{formatFileSize(media.fileSize)}</span>
            </div>
            {media.duration && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                <span className="ml-2">{formatDuration(media.duration)}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <span className="ml-2">{new Date(media.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {media.tags && media.tags.length > 0 && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {media.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => window.open(media.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Original
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AdminMediaManager
