import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit, Trash2, Save, Star, Coffee, Wifi, Car, 
  AirVent, Shield, Music, Mic, Camera, Headphones, 
  Settings, Clock, Users, MapPin, CheckCircle, X
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'

const StudioAmenities = () => {
  const { user } = useSelector(state => state.auth)
  const studioId = user?.studio?._id || user?.studio
  
  const { data: studioData, isLoading } = useGetStudioQuery(studioId, { skip: !studioId })
  const [updateStudio, { isLoading: isSaving }] = useUpdateStudioMutation()
  
  const [amenities, setAmenities] = useState([])
  const [equipment, setEquipment] = useState([])
  const [showAmenityModal, setShowAmenityModal] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('amenities')

  const studio = studioData?.data?.studio

  useEffect(() => {
    if (studio) {
      setAmenities(studio.amenities?.map(a => ({ ...a, id: a._id || Date.now() + Math.random() })) || [])
      setEquipment(studio.equipment?.map(e => ({ ...e, id: e._id || Date.now() + Math.random() })) || [])
    }
  }, [studio])

  const predefinedAmenities = [
    { id: 'wifi', name: 'High-Speed WiFi', icon: Wifi, category: 'connectivity' },
    { id: 'parking', name: 'Free Parking', icon: Car, category: 'convenience' },
    { id: 'coffee', name: 'Coffee & Refreshments', icon: Coffee, category: 'comfort' },
    { id: 'ac', name: 'Air Conditioning', icon: AirVent, category: 'comfort' },
    { id: 'security', name: '24/7 Security', icon: Shield, category: 'safety' },
    { id: 'lounge', name: 'Client Lounge', icon: Users, category: 'comfort' },
    { id: 'storage', name: 'Equipment Storage', icon: Settings, category: 'convenience' },
    { id: 'isolation', name: 'Sound Isolation', icon: Music, category: 'technical' }
  ]

  const equipmentCategories = [
    { id: 'microphones', name: 'Microphones', items: ['Neumann U87', 'Shure SM57', 'AKG C414', 'Rode NTK'] },
    { id: 'monitors', name: 'Studio Monitors', items: ['Yamaha HS8', 'KRK Rokit', 'Genelec 8040', 'Adam Audio A7X'] },
    { id: 'interfaces', name: 'Audio Interfaces', items: ['Focusrite Scarlett', 'Universal Audio Apollo', 'RME Fireface', 'PreSonus Studio'] },
    { id: 'instruments', name: 'Instruments', items: ['Steinway Piano', 'Fender Stratocaster', 'Gibson Les Paul', 'Roland Jupiter'] },
    { id: 'software', name: 'Software', items: ['Pro Tools', 'Logic Pro X', 'Ableton Live', 'Cubase'] }
  ]

  const handleSaveAmenities = async () => {
    try {
      await updateStudio({ 
        id: studioId, 
        amenities: amenities.map(({ id, ...amenity }) => amenity)
      }).unwrap()
      toast.success('Amenities updated successfully')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update amenities')
    }
  }

  const handleSaveEquipment = async () => {
    try {
      await updateStudio({ 
        id: studioId, 
        equipment: equipment.map(({ id, ...equip }) => equip)
      }).unwrap()
      toast.success('Equipment updated successfully')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update equipment')
    }
  }

  const handleAddAmenity = (amenityData) => {
    const newAmenity = { ...amenityData, id: Date.now() + Math.random() }
    
    if (editingItem) {
      setAmenities(prev => prev.map(a => a.id === editingItem.id ? newAmenity : a))
    } else {
      setAmenities(prev => [...prev, newAmenity])
    }
    
    setShowAmenityModal(false)
    setEditingItem(null)
  }

  const handleAddEquipment = (equipmentData) => {
    const newEquipment = { ...equipmentData, id: Date.now() + Math.random() }
    
    if (editingItem) {
      setEquipment(prev => prev.map(e => e.id === editingItem.id ? newEquipment : e))
    } else {
      setEquipment(prev => [...prev, newEquipment])
    }
    
    setShowEquipmentModal(false)
    setEditingItem(null)
  }

  const handleDeleteAmenity = (amenityId) => {
    setAmenities(prev => prev.filter(a => a.id !== amenityId))
  }

  const handleDeleteEquipment = (equipmentId) => {
    setEquipment(prev => prev.filter(e => e.id !== equipmentId))
  }

  const togglePredefinedAmenity = (predefinedAmenity) => {
    const exists = amenities.find(a => a.name === predefinedAmenity.name)
    
    if (exists) {
      handleDeleteAmenity(exists.id)
    } else {
      const newAmenity = {
        id: Date.now() + Math.random(),
        name: predefinedAmenity.name,
        category: predefinedAmenity.category,
        available: true
      }
      setAmenities(prev => [...prev, newAmenity])
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Studio Amenities & Features
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showcase your studio's facilities and equipment to attract clients
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={activeTab === 'amenities' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('amenities')}
          >
            Amenities
          </Button>
          <Button
            variant={activeTab === 'equipment' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment
          </Button>
        </div>
      </div>

      {/* Amenities Tab */}
      {activeTab === 'amenities' && (
        <div className="space-y-6">
          {/* Quick Add Predefined Amenities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Add Popular Amenities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {predefinedAmenities.map(amenity => {
                const Icon = amenity.icon
                const isSelected = amenities.some(a => a.name === amenity.name)
                
                return (
                  <motion.button
                    key={amenity.id}
                    onClick={() => togglePredefinedAmenity(amenity)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-green-600' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
                        {amenity.name}
                      </span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </Card>

          {/* Custom Amenities */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Custom Amenities ({amenities.length})
              </h3>
              <div className="flex space-x-3">
                <Button onClick={() => setShowAmenityModal(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </Button>
                <Button onClick={handleSaveAmenities} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {amenities.map(amenity => (
                <motion.div
                  key={amenity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{amenity.name}</h4>
                      {amenity.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{amenity.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          amenity.available 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {amenity.available ? 'Available' : 'Unavailable'}
                        </span>
                        {amenity.category && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full capitalize">
                            {amenity.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => (setEditingItem(amenity), setShowAmenityModal(true))}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAmenity(amenity.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          {/* Equipment Categories */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Studio Equipment ({equipment.length} items)
              </h3>
              <div className="flex space-x-3">
                <Button onClick={() => setShowEquipmentModal(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
                <Button onClick={handleSaveEquipment} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Quick Add by Category */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Add by Category</h4>
              <div className="space-y-4">
                {equipmentCategories.map(category => (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">{category.name}</h5>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map(item => {
                        const exists = equipment.some(e => e.name === item)
                        return (
                          <button
                            key={item}
                            onClick={() => {
                              if (!exists) {
                                const newEquipment = {
                                  id: Date.now() + Math.random(),
                                  name: item,
                                  category: category.id,
                                  available: true
                                }
                                setEquipment(prev => [...prev, newEquipment])
                              }
                            }}
                            disabled={exists}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              exists 
                                ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {exists && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {item}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.available 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.available ? 'Available' : 'In Use'}
                        </span>
                        {item.category && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full capitalize">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => (setEditingItem(item), setShowEquipmentModal(true))}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEquipment(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Amenity Modal */}
      <AmenityModal
        isOpen={showAmenityModal}
        onClose={() => (setShowAmenityModal(false), setEditingItem(null))}
        amenity={editingItem}
        onSubmit={handleAddAmenity}
      />

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={showEquipmentModal}
        onClose={() => (setShowEquipmentModal(false), setEditingItem(null))}
        equipment={editingItem}
        onSubmit={handleAddEquipment}
        categories={equipmentCategories}
      />
    </div>
  )
}

const AmenityModal = ({ isOpen, onClose, amenity, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'comfort', available: true
  })

  useEffect(() => {
    if (amenity) {
      setFormData({
        name: amenity.name || '',
        description: amenity.description || '',
        category: amenity.category || 'comfort',
        available: amenity.available !== false
      })
    } else {
      setFormData({
        name: '', description: '', category: 'comfort', available: true
      })
    }
  }, [amenity, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={amenity ? 'Edit Amenity' : 'Add Amenity'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="comfort">Comfort</option>
            <option value="convenience">Convenience</option>
            <option value="technical">Technical</option>
            <option value="safety">Safety</option>
            <option value="connectivity">Connectivity</option>
          </select>
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
              checked={formData.available}
              onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Currently available</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {amenity ? 'Update' : 'Add'} Amenity
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const EquipmentModal = ({ isOpen, onClose, equipment, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'microphones', available: true
  })

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        category: equipment.category || 'microphones',
        available: equipment.available !== false
      })
    } else {
      setFormData({
        name: '', description: '', category: 'microphones', available: true
      })
    }
  }, [equipment, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={equipment ? 'Edit Equipment' : 'Add Equipment'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Equipment Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
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
              checked={formData.available}
              onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Currently available</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {equipment ? 'Update' : 'Add'} Equipment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudioAmenities
