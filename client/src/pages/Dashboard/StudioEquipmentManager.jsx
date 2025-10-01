import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wrench, Plus, Search, Grid, List, Edit, Trash2, 
  DollarSign, Calendar, AlertTriangle, CheckCircle,
  TrendingUp, BarChart3, Settings, Package, Clock, Upload, Image as ImageIcon, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetStudioEquipmentQuery, useCreateEquipmentMutation, useUpdateEquipmentMutation, useDeleteEquipmentMutation } from '../../store/equipmentApi'

const StudioEquipmentManager = () => {
  const { user } = useSelector(state => state.auth)
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [rentalFilter, setRentalFilter] = useState('all')
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)

  const studioId = user?.studio?._id || user?.studio
  
  const { data: equipmentData, isLoading } = useGetStudioEquipmentQuery({
    studioId,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    search: search || undefined
  }, { skip: !studioId })

  const [createEquipment] = useCreateEquipmentMutation()
  const [updateEquipment] = useUpdateEquipmentMutation()
  const [deleteEquipment] = useDeleteEquipmentMutation()

  const allEquipment = equipmentData?.data || []
  
  // Apply rental filter
  const equipment = allEquipment.filter(item => {
    if (rentalFilter === 'rentable') return item.isRentable
    if (rentalFilter === 'not-rentable') return !item.isRentable
    return true
  })

  const categories = [
    { id: 'Microphones', name: 'Microphones', icon: '🎤' },
    { id: 'Audio Interfaces', name: 'Audio Interfaces', icon: '🔊' },
    { id: 'Monitors', name: 'Monitors', icon: '📺' },
    { id: 'Headphones', name: 'Headphones', icon: '🎧' },
    { id: 'Instruments', name: 'Instruments', icon: '🎸' },
    { id: 'Amplifiers', name: 'Amplifiers', icon: '📢' },
    { id: 'Effects', name: 'Effects', icon: '🎛️' },
    { id: 'Recording', name: 'Recording', icon: '🎙️' },
    { id: 'Mixing', name: 'Mixing', icon: '🎚️' },
    { id: 'Mastering', name: 'Mastering', icon: '🎵' },
    { id: 'Lighting', name: 'Lighting', icon: '💡' },
    { id: 'Cameras', name: 'Cameras', icon: '📷' },
    { id: 'Other', name: 'Other', icon: '🔌' }
  ]

  const conditions = [
    { value: 'New', label: 'New', color: 'text-green-600 bg-green-100', rentable: true },
    { value: 'Excellent', label: 'Excellent', color: 'text-blue-600 bg-blue-100', rentable: true },
    { value: 'Good', label: 'Good', color: 'text-yellow-600 bg-yellow-100', rentable: true },
    { value: 'Fair', label: 'Fair', color: 'text-orange-600 bg-orange-100', rentable: true },
    { value: 'Damaged', label: 'Damaged', color: 'text-red-600 bg-red-100', rentable: false },
    { value: 'Under Repair', label: 'Under Repair', color: 'text-purple-600 bg-purple-100', rentable: false },
    { value: 'Out of Service', label: 'Out of Service', color: 'text-gray-600 bg-gray-100', rentable: false }
  ]

  const availabilityStatuses = [
    { value: 'Available', label: 'Available', color: 'text-green-600 bg-green-100', icon: '✅' },
    { value: 'Rented', label: 'Currently Rented', color: 'text-blue-600 bg-blue-100', icon: '📅' },
    { value: 'Maintenance', label: 'In Maintenance', color: 'text-orange-600 bg-orange-100', icon: '🔧' },
    { value: 'Reserved', label: 'Reserved', color: 'text-purple-600 bg-purple-100', icon: '🔒' },
    { value: 'Unavailable', label: 'Unavailable', color: 'text-red-600 bg-red-100', icon: '❌' }
  ]

  const handleCreateEquipment = async (equipmentData) => {
    try {
      await createEquipment({ ...equipmentData, studio: studioId }).unwrap()
      toast.success('Equipment added successfully')
      setShowModal(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to add equipment')
    }
  }

  const handleUpdateEquipment = async (equipmentData) => {
    try {
      await updateEquipment({ id: selectedEquipment._id, ...equipmentData }).unwrap()
      toast.success('Equipment updated successfully')
      setShowModal(false)
      setSelectedEquipment(null)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update equipment')
    }
  }

  const handleDeleteEquipment = async (id) => {
    if (window.confirm('Delete this equipment?')) {
      try {
        await deleteEquipment(id).unwrap()
        toast.success('Equipment deleted')
      } catch (error) {
        toast.error('Failed to delete equipment')
      }
    }
  }

  const getEquipmentStats = () => {
    const total = equipment.length
    const totalValue = equipment.reduce((sum, item) => sum + (item.purchasePrice || 0), 0)
    const currentValue = equipment.reduce((sum, item) => sum + (item.currentValue || item.purchasePrice || 0), 0)
    const needsMaintenance = equipment.filter(item => {
      if (!item.lastMaintenance) return true
      const lastMaintenance = new Date(item.lastMaintenance)
      const monthsAgo = (new Date() - lastMaintenance) / (1000 * 60 * 60 * 24 * 30)
      return monthsAgo > 6
    }).length
    
    const rentableItems = equipment.filter(item => item.isRentable && 
      ['New', 'Excellent', 'Good', 'Fair'].includes(item.condition)).length
    const availableForRent = equipment.filter(item => 
      item.isRentable && 
      item.availabilityStatus === 'Available' && 
      ['New', 'Excellent', 'Good', 'Fair'].includes(item.condition)).length
    const currentlyRented = equipment.filter(item => item.availabilityStatus === 'Rented').length
    const averageRentalPrice = equipment
      .filter(item => item.isRentable && item.rentalPricePerDay > 0)
      .reduce((sum, item) => sum + item.rentalPricePerDay, 0) / 
      equipment.filter(item => item.isRentable && item.rentalPricePerDay > 0).length || 0

    return { 
      total, 
      totalValue, 
      currentValue, 
      needsMaintenance, 
      rentableItems, 
      availableForRent,
      currentlyRented,
      averageRentalPrice 
    }
  }

  const stats = getEquipmentStats()

  const getConditionColor = (condition) => {
    const conditionObj = conditions.find(c => c.value === condition)
    return conditionObj?.color || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Equipment</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your equipment available for rental</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Rental Equipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available for Rent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableForRent}</p>
            </div>
            <Wrench className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently Rented</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentlyRented}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.currentValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-cyan-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Needs Maintenance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.needsMaintenance}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
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
                placeholder="Search equipment..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Conditions</option>
            {conditions.map(condition => (
              <option key={condition.value} value={condition.value}>{condition.label}</option>
            ))}
          </select>
          
          <select
            value={rentalFilter}
            onChange={(e) => setRentalFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Equipment</option>
            <option value="rentable">Rentable Only</option>
            <option value="not-rentable">Not Rentable</option>
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

        {/* Equipment Grid/List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {equipment.map((item) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {viewMode === 'grid' ? (
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    {item.image && (
                      <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                          {item.isRentable && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                              Rentable
                            </span>
                          )}
                          {item.availabilityStatus && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              availabilityStatuses.find(s => s.value === item.availabilityStatus)?.color || 'text-gray-600 bg-gray-100'
                            }`}>
                              {availabilityStatuses.find(s => s.value === item.availabilityStatus)?.icon} {item.availabilityStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => (setSelectedEquipment(item), setShowModal(true))}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEquipment(item._id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.category}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Condition:</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Purchase Price:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">${item.purchasePrice}</span>
                      </div>
                      
                      {item.currentValue && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Current Value:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">${item.currentValue}</span>
                        </div>
                      )}
                      
                      {item.lastMaintenance && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Last Maintenance:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(item.lastMaintenance).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {item.isRentable && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Rental Prices:</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {item.rentalPricePerDay > 0 && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Day:</span>
                                <span className="font-medium text-green-600 dark:text-green-400 ml-1">${item.rentalPricePerDay}</span>
                              </div>
                            )}
                            {item.rentalPricePerWeek > 0 && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Week:</span>
                                <span className="font-medium text-green-600 dark:text-green-400 ml-1">${item.rentalPricePerWeek}</span>
                              </div>
                            )}
                            {item.rentalPricePerMonth > 0 && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Month:</span>
                                <span className="font-medium text-green-600 dark:text-green-400 ml-1">${item.rentalPricePerMonth}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="capitalize">{item.category}</span>
                              <span className={`px-2 py-1 rounded-full ${getConditionColor(item.condition)}`}>
                                {item.condition}
                              </span>
                              <span>${item.purchasePrice}</span>
                              {item.lastMaintenance && (
                                <span>Maintained: {new Date(item.lastMaintenance).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => (setSelectedEquipment(item), setShowModal(true))}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEquipment(item._id)} className="text-red-600">
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

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={showModal}
        onClose={() => (setShowModal(false), setSelectedEquipment(null))}
        equipment={selectedEquipment}
        onSubmit={selectedEquipment ? handleUpdateEquipment : handleCreateEquipment}
        categories={categories}
        conditions={conditions}
        availabilityStatuses={availabilityStatuses}
      />
    </div>
  )
}

const EquipmentModal = ({ isOpen, onClose, equipment, onSubmit, categories, conditions, availabilityStatuses }) => {
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    category: 'Microphones', 
    condition: 'New',
    image: '', 
    isRentable: true, 
    rentalPricePerDay: '', 
    rentalPricePerWeek: '', 
    rentalPricePerMonth: '',
    availabilityStatus: 'Available', 
    minRentalDuration: '1', 
    maxRentalDuration: '',
    securityDeposit: '', 
    rentalTerms: ''
  })
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  React.useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name ?? '',
        description: equipment.description ?? '',
        category: equipment.category ?? 'Microphones',
        condition: equipment.condition ?? 'New',
        image: equipment.image ?? '',
        isRentable: equipment.isRentable ?? true,
        rentalPricePerDay: equipment.rentalPricePerDay?.toString() ?? '',
        rentalPricePerWeek: equipment.rentalPricePerWeek?.toString() ?? '',
        rentalPricePerMonth: equipment.rentalPricePerMonth?.toString() ?? '',
        availabilityStatus: equipment.availabilityStatus ?? 'Available',
        minRentalDuration: equipment.minRentalDuration?.toString() ?? '1',
        maxRentalDuration: equipment.maxRentalDuration?.toString() ?? '',
        securityDeposit: equipment.securityDeposit?.toString() ?? '',
        rentalTerms: equipment.rentalTerms ?? ''
      })
      setImagePreview(equipment.image || '')
    } else {
      setFormData({
        name: '', description: '', category: 'Microphones', condition: 'New',
        image: '', isRentable: true, rentalPricePerDay: '', rentalPricePerWeek: '', rentalPricePerMonth: '',
        availabilityStatus: 'Available', minRentalDuration: '1', maxRentalDuration: '',
        securityDeposit: '', rentalTerms: ''
      })
      setImagePreview('')
    }
  }, [equipment, isOpen])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setFormData(prev => ({ ...prev, image: reader.result }))
      setIsUploading(false)
      toast.success('Image uploaded successfully!')
    }
    reader.onerror = () => {
      toast.error('Failed to upload image')
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview('')
    setFormData(prev => ({ ...prev, image: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      isRentable: true, // Always rentable since this is rental-focused
      rentalPricePerDay: parseFloat(formData.rentalPricePerDay) || 0,
      rentalPricePerWeek: parseFloat(formData.rentalPricePerWeek) || 0,
      rentalPricePerMonth: parseFloat(formData.rentalPricePerMonth) || 0,
      minRentalDuration: parseInt(formData.minRentalDuration) || 1,
      maxRentalDuration: formData.maxRentalDuration ? parseInt(formData.maxRentalDuration) : null,
      securityDeposit: parseFloat(formData.securityDeposit) || 0
    }
    onSubmit(submitData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={equipment ? 'Edit Rental Equipment' : 'Add Rental Equipment'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Equipment Image</label>
          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Equipment preview" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload equipment image</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {!imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Choose Image'}</span>
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Equipment Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g., Shure SM7B Microphone"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            placeholder="Brief description of the equipment and its features..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Condition *</label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {conditions.map(condition => (
              <option key={condition.value} value={condition.value}>{condition.label}</option>
            ))}
          </select>
        </div>

        {/* Rental Pricing */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rental Pricing</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price per Day ($) *</label>
              <input
                type="number"
                value={formData.rentalPricePerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, rentalPricePerDay: e.target.value }))}
                min="0"
                step="0.01"
                required
                placeholder="25.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price per Week ($)</label>
              <input
                type="number"
                value={formData.rentalPricePerWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, rentalPricePerWeek: e.target.value }))}
                min="0"
                step="0.01"
                placeholder="150.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price per Month ($)</label>
              <input
                type="number"
                value={formData.rentalPricePerMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, rentalPricePerMonth: e.target.value }))}
                min="0"
                step="0.01"
                placeholder="500.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Rental (days)</label>
              <input
                type="number"
                value={formData.minRentalDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, minRentalDuration: e.target.value }))}
                min="1"
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security Deposit ($)</label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                min="0"
                step="0.01"
                placeholder="100.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rental Terms</label>
            <textarea
              value={formData.rentalTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, rentalTerms: e.target.value }))}
              rows={2}
              placeholder="Usage guidelines, damage policy, return conditions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability Status</label>
            <select
              value={formData.availabilityStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, availabilityStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {availabilityStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {equipment ? 'Update' : 'Add'} Rental Equipment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default StudioEquipmentManager
