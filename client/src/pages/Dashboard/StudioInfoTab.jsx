import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, MapPin, Phone, Mail, Globe, Edit, Save, X, 
  DollarSign, Users, Star, Music, Instagram, Twitter, Facebook, Youtube,
  AlertTriangle, CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'

const StudioInfoTab = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  const [isEditing, setIsEditing] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    hourlyRate: '',
    capacity: '',
    amenities: [],
    genres: [],
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: ''
    }
  })

  const { data: studioData, isLoading } = useGetStudioQuery(studioId, { skip: !studioId })
  const [updateStudio, { isLoading: isUpdating }] = useUpdateStudioMutation()

  const studio = studioData?.data?.studio

  useEffect(() => {
    if (studio) {
      setFormData({
        name: studio.name || '',
        description: studio.description || '',
        location: typeof studio.location === 'object' 
          ? `${studio.location.city || ''}, ${studio.location.country || ''}`.trim().replace(/^,\s*/, '') 
          : studio.location || '',
        phone: studio.phone || '',
        email: studio.email || '',
        website: studio.website || '',
        hourlyRate: studio.hourlyRate || '',
        capacity: studio.capacity || '',
        amenities: studio.amenities || [],
        genres: studio.genres || [],
        socialMedia: studio.socialMedia || {
          instagram: '',
          twitter: '',
          facebook: '',
          youtube: ''
        }
      })
      
      // Check if studio needs onboarding
      if (studio.onboarded === false) {
        // Don't force edit mode, let user click edit first
        // setIsEditing(true) // Remove this line
      }
    }
  }, [studio])

  const predefinedAmenities = [
    'Air Conditioning', 'Parking', 'WiFi', 'Kitchen', 'Lounge Area',
    'Bathroom', 'Storage', 'Security System', 'Backup Power', 'Soundproofing'
  ]

  const predefinedGenres = [
    'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic',
    'Country', 'R&B', 'Reggae', 'Folk', 'Blues', 'Metal'
  ]

  const handleSave = async () => {
    try {
      // Check if required fields are filled for onboarding
      const isOnboarding = studio?.onboarded === false
      const requiredFields = ['name', 'description', 'location', 'hourlyRate', 'capacity']
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field] === '')

      if (isOnboarding && missingFields.length > 0) {
        setShowOnboardingModal(true)
        return // Don't save yet, show modal first
      }

      // Parse location string into object format
      let locationObject = undefined
      if (formData.location) {
        const locationParts = formData.location.split(',').map(part => part.trim())
        if (locationParts.length >= 2) {
          locationObject = {
            city: locationParts[0],
            country: locationParts[1],
            address: locationParts.slice(2).join(', ') || undefined
          }
        } else if (locationParts.length === 1) {
          // If only one part, assume it's the city and use a default country
          locationObject = {
            city: locationParts[0],
            country: 'Sri Lanka', // Default country
            address: undefined
          }
        }
      }

      // Convert string values to appropriate types
      const processedData = {
        ...formData,
        location: locationObject,
        hourlyRate: formData.hourlyRate && formData.hourlyRate !== '' ? parseFloat(formData.hourlyRate) : undefined,
        capacity: formData.capacity && formData.capacity !== '' ? parseInt(formData.capacity) : undefined,
        onboarded: true // Mark as onboarded when saving
      }

      await updateStudio({
        id: studioId,
        ...processedData
      }).unwrap()
      toast.success('Studio profile updated successfully!')
      setIsEditing(false)
      setShowOnboardingModal(false) // Close onboarding modal
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update studio profile')
    }
  }

  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Studio Information</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your studio's profile and basic information
          </p>
        </div>
        
        {!isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsEditing(true)
                // Show onboarding modal if studio is not onboarded
                if (studio?.onboarded === false) {
                  setTimeout(() => setShowOnboardingModal(true), 100)
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            {studio?.onboarded === false && (
              <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Profile incomplete
              </span>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsEditing(false)
                if (studio) {
                  setFormData({
                    name: studio.name || '',
                    description: studio.description || '',
                    location: typeof studio.location === 'object' 
                      ? `${studio.location.city || ''}, ${studio.location.country || ''}`.trim().replace(/^,\s*/, '') 
                      : studio.location || '',
                    phone: studio.phone || '',
                    email: studio.email || '',
                    website: studio.website || '',
                    hourlyRate: studio.hourlyRate || '',
                    capacity: studio.capacity || '',
                    amenities: studio.amenities || [],
                    genres: studio.genres || [],
                    socialMedia: studio.socialMedia || {
                      instagram: '',
                      twitter: '',
                      facebook: '',
                      youtube: ''
                    }
                  })
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Basic Information</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Studio Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{studio?.name || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">{studio?.description || 'No description'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hourly Rate (LKR)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {studio?.hourlyRate ? `LKR ${studio.hourlyRate.toLocaleString()}` : 'N/A'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacity
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {studio?.capacity ? `${studio.capacity} people` : 'N/A'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>Contact Information</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Colombo, Sri Lanka"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {typeof studio?.location === 'object' 
                    ? `${studio.location.city || ''}, ${studio.location.country || ''}`.trim().replace(/^,\s*/, '') 
                    : studio?.location || 'N/A'}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{studio?.phone || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{studio?.email || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{studio?.website || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-blue-600" />
            <span>Amenities</span>
          </h3>
          
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2">
              {predefinedAmenities.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => setFormData({ ...formData, amenities: toggleArrayItem(formData.amenities, amenity) })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {studio?.amenities?.length > 0 ? (
                studio.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No amenities listed</p>
              )}
            </div>
          )}
        </div>

        {/* Genres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Music className="w-5 h-5 text-blue-600" />
            <span>Genres</span>
          </h3>
          
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2">
              {predefinedGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setFormData({ ...formData, genres: toggleArrayItem(formData.genres, genre) })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.genres.includes(genre)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {studio?.genres?.length > 0 ? (
                studio.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No genres listed</p>
              )}
            </div>
          )}
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, instagram: e.target.value } })}
                  placeholder="@username"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{studio?.socialMedia?.instagram || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, twitter: e.target.value } })}
                  placeholder="@username"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{studio?.socialMedia?.twitter || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, facebook: e.target.value } })}
                  placeholder="Page name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{studio?.socialMedia?.facebook || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Youtube className="w-4 h-4" />
                <span>YouTube</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.socialMedia.youtube}
                  onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, youtube: e.target.value } })}
                  placeholder="Channel name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{studio?.socialMedia?.youtube || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Complete Your Studio Profile
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your studio profile is incomplete. Please fill in the required information above to start accepting bookings and get verified.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Required fields:</strong> Studio Name, Description, Location, Hourly Rate, Capacity
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={async () => {
                  // Force save even if validation fails - let backend handle it
                  try {
                    // Parse location string into object format
                    let locationObject = undefined
                    if (formData.location) {
                      const locationParts = formData.location.split(',').map(part => part.trim())
                      if (locationParts.length >= 2) {
                        locationObject = {
                          city: locationParts[0],
                          country: locationParts[1],
                          address: locationParts.slice(2).join(', ') || undefined
                        }
                      } else if (locationParts.length === 1) {
                        // If only one part, assume it's the city and use a default country
                        locationObject = {
                          city: locationParts[0],
                          country: 'Sri Lanka', // Default country
                          address: undefined
                        }
                      }
                    }

                    const processedData = {
                      ...formData,
                      location: locationObject,
                      hourlyRate: formData.hourlyRate && formData.hourlyRate !== '' ? parseFloat(formData.hourlyRate) : undefined,
                      capacity: formData.capacity && formData.capacity !== '' ? parseInt(formData.capacity) : undefined,
                      onboarded: true
                    }

                    await updateStudio({
                      id: studioId,
                      ...processedData
                    }).unwrap()
                    toast.success('Studio profile completed!')
                    setIsEditing(false)
                    setShowOnboardingModal(false)
                  } catch (error) {
                    toast.error(error?.data?.message || 'Failed to complete profile')
                  }
                }}
                disabled={isUpdating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isUpdating ? 'Saving...' : 'Complete Profile'}</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
              Fill in all required fields and click "Complete Profile" to finish setup.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default StudioInfoTab
