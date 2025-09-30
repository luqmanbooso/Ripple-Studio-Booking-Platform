import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wrench, Plus, Search, Grid, List, Edit, Trash2, 
  DollarSign, Calendar, AlertTriangle, CheckCircle,
  TrendingUp, BarChart3, Settings, Package, Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useGetEquipmentQuery, useCreateEquipmentMutation, useUpdateEquipmentMutation, useDeleteEquipmentMutation } from '../../store/equipmentApi'

const StudioEquipmentManager = () => {
  const { user } = useSelector(state => state.auth)
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [conditionFilter, setConditionFilter] = useState('all')

  const { data: equipmentData, isLoading } = useGetEquipmentQuery({
    studio: user?.studio?._id,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    search: search || undefined
  }, { skip: !user?.studio?._id })

  const [createEquipment] = useCreateEquipmentMutation()
  const [updateEquipment] = useUpdateEquipmentMutation()
  const [deleteEquipment] = useDeleteEquipmentMutation()

  const equipment = equipmentData?.data || []

  const categories = [
    { id: 'microphones', name: 'Microphones', icon: '🎤' },
    { id: 'speakers', name: 'Speakers', icon: '🔊' },
    { id: 'instruments', name: 'Instruments', icon: '🎸' },
    { id: 'recording', name: 'Recording', icon: '🎛️' },
    { id: 'lighting', name: 'Lighting', icon: '💡' },
    { id: 'accessories', name: 'Accessories', icon: '🔌' }
  ]

  const conditions = [
    { value: 'new', label: 'New', color: 'text-green-600 bg-green-100' },
    { value: 'excellent', label: 'Excellent', color: 'text-blue-600 bg-blue-100' },
    { value: 'good', label: 'Good', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'fair', label: 'Fair', color: 'text-orange-600 bg-orange-100' },
    { value: 'poor', label: 'Poor', color: 'text-red-600 bg-red-100' }
  ]

  const handleCreateEquipment = async (equipmentData) => {
    try {
      await createEquipment({ ...equipmentData, studio: user.studio._id }).unwrap()
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

    return { total, totalValue, currentValue, needsMaintenance }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipment Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your studio equipment</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Equipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.currentValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
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
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h3>
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
      />
    </div>
  )
}

const EquipmentModal = ({ isOpen, onClose, equipment, onSubmit, categories, conditions }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'microphones', condition: 'new',
    purchasePrice: '', currentValue: '', purchaseDate: '', lastMaintenance: '',
    warrantyExpiry: '', serialNumber: '', manufacturer: '', model: ''
  })

  React.useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        category: equipment.category || 'microphones',
        condition: equipment.condition || 'new',
        purchasePrice: equipment.purchasePrice || '',
        currentValue: equipment.currentValue || '',
        purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
        lastMaintenance: equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toISOString().split('T')[0] : '',
        warrantyExpiry: equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toISOString().split('T')[0] : '',
        serialNumber: equipment.serialNumber || '',
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || ''
      })
    } else {
      setFormData({
        name: '', description: '', category: 'microphones', condition: 'new',
        purchasePrice: '', currentValue: '', purchaseDate: '', lastMaintenance: '',
        warrantyExpiry: '', serialNumber: '', manufacturer: '', model: ''
      })
    }
  }, [equipment, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      currentValue: parseFloat(formData.currentValue) || 0,
      purchaseDate: formData.purchaseDate || null,
      lastMaintenance: formData.lastMaintenance || null,
      warrantyExpiry: formData.warrantyExpiry || null
    }
    onSubmit(submitData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={equipment ? 'Edit Equipment' : 'Add Equipment'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manufacturer</label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Serial Number</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Price ($)</label>
            <input
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Value ($)</label>
            <input
              type="number"
              value={formData.currentValue}
              onChange={(e) => setFormData(prev => ({ ...prev, currentValue: e.target.value }))}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Date</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Maintenance</label>
            <input
              type="date"
              value={formData.lastMaintenance}
              onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warranty Expiry</label>
            <input
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
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

export default StudioEquipmentManager
