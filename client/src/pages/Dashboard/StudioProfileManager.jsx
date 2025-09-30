import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Camera,
  Music,
  Mic,
  Settings as SettingsIcon
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'

const StudioProfileManager = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  
  const { data: studioData, isLoading } = useGetStudioQuery(studioId, { skip: !studioId })
  const [updateStudio, { isLoading: isSaving }] = useUpdateStudioMutation()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      country: 'Sri Lanka',
      city: '',
      address: ''
    },
    equipment: [],
    amenities: [],
    services: [],
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    gallery: []
  })

  const [newEquipment, setNewEquipment] = useState('')
  const [newAmenity, setNewAmenity] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  const studio = studioData?.data?.studio

  useEffect(() => {
    if (studio) {
      setFormData({
        name: studio.name || '',
        description: studio.description || '',
        location: {
          country: studio.location?.country || 'Sri Lanka',
          city: studio.location?.city || '',
          address: studio.location?.address || ''
        },
        equipment: studio.equipment || [],
        amenities: studio.amenities || [],
        services: studio.services || [],
        contactInfo: {
          phone: studio.contactInfo?.phone || '',
          email: studio.contactInfo?.email || '',
          website: studio.contactInfo?.website || ''
        },
        gallery: studio.gallery || []
      })
    }
  }, [studio])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()]
      }))
      setNewEquipment('')
    }
  }

  const removeEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }))
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }))
      setNewAmenity('')
    }
  }

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      await updateStudio({
        id: studioId,
        ...formData
      }).unwrap()
      toast.success('Studio profile updated successfully!')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update studio profile')
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: SettingsIcon },
    { id: 'equipment', label: 'Equipment', icon: Mic },
    { id: 'amenities', label: 'Amenities', icon: Music },
    { id: 'gallery', label: 'Gallery', icon: Camera },
    { id: 'contact', label: 'Contact', icon: Phone }
  ]

  const commonEquipment = [
    'Pro Tools', 'Logic Pro', 'Ableton Live', 'SSL Console', 'Neve Console',
    'Neumann U87', 'AKG C414', 'Shure SM57', 'Yamaha NS-10M', 'KRK Rokit',
    'Universal Audio Apollo', 'Focusrite Scarlett', 'Avalon VT-737SP',
    'Lexicon 480L', 'TC Electronic M5000', 'Eventide H3000'
  ]

  const commonAmenities = [
    'Free Parking', 'WiFi', 'Air Conditioning', 'Kitchen/Lounge',
    'Instrument Storage', 'Vocal Booth', 'Live Room', 'Control Room',
    'Mixing Suite', 'Mastering Suite', '24/7 Access', 'Security System'
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Studio Profile Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your studio information, equipment, and amenities
              </p>
            </div>
            <Button
              onClick={handleSave}
              loading={isSaving}
              icon={<Save className="w-4 h-4" />}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'basic' && (
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Basic Information
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Studio Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter studio name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder="Describe your studio..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              value={formData.location.city}
                              onChange={(e) => handleInputChange('location.city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter city"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              value={formData.location.country}
                              onChange={(e) => handleInputChange('location.country', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter country"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={formData.location.address}
                            onChange={(e) => handleInputChange('location.address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter full address"
                          />
                        </div>
                      </div>
                    </Card>
                  )}

                  {activeTab === 'equipment' && (
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Studio Equipment
                      </h2>
                      
                      {/* Add Equipment */}
                      <div className="mb-6">
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={newEquipment}
                            onChange={(e) => setNewEquipment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Add equipment..."
                          />
                          <Button onClick={addEquipment} icon={<Plus className="w-4 h-4" />}>
                            Add
                          </Button>
                        </div>

                        {/* Common Equipment Suggestions */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Quick Add:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {commonEquipment.map(item => (
                              <button
                                key={item}
                                onClick={() => {
                                  if (!formData.equipment.includes(item)) {
                                    setFormData(prev => ({
                                      ...prev,
                                      equipment: [...prev.equipment, item]
                                    }))
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Equipment List */}
                      <div className="space-y-2">
                        <AnimatePresence>
                          {formData.equipment.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <span className="text-gray-900 dark:text-white">{item}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEquipment(index)}
                                icon={<Trash2 className="w-4 h-4" />}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {formData.equipment.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No equipment added yet</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {activeTab === 'amenities' && (
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Studio Amenities
                      </h2>
                      
                      {/* Add Amenity */}
                      <div className="mb-6">
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={newAmenity}
                            onChange={(e) => setNewAmenity(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Add amenity..."
                          />
                          <Button onClick={addAmenity} icon={<Plus className="w-4 h-4" />}>
                            Add
                          </Button>
                        </div>

                        {/* Common Amenities Suggestions */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Quick Add:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {commonAmenities.map(item => (
                              <button
                                key={item}
                                onClick={() => {
                                  if (!formData.amenities.includes(item)) {
                                    setFormData(prev => ({
                                      ...prev,
                                      amenities: [...prev.amenities, item]
                                    }))
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Amenities List */}
                      <div className="space-y-2">
                        <AnimatePresence>
                          {formData.amenities.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <span className="text-gray-900 dark:text-white">{item}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAmenity(index)}
                                icon={<Trash2 className="w-4 h-4" />}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {formData.amenities.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No amenities added yet</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {activeTab === 'contact' && (
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Contact Information
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.contactInfo.phone}
                            onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.contactInfo.email}
                            onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            value={formData.contactInfo.website}
                            onChange={(e) => handleInputChange('contactInfo.website', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="https://your-website.com"
                          />
                        </div>
                      </div>
                    </Card>
                  )}

                  {activeTab === 'gallery' && (
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Studio Gallery
                      </h2>
                      <div className="text-center py-12">
                        <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Gallery Management
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Upload and manage your studio photos
                        </p>
                        <Button
                          icon={<Upload className="w-4 h-4" />}
                          variant="outline"
                        >
                          Upload Photos
                        </Button>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudioProfileManager
