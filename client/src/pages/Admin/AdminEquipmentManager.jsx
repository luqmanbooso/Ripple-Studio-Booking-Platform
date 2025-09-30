import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Wrench, Plus, Search, Filter, Edit, Trash2, Eye, Settings,
  Package, DollarSign, Calendar, AlertCircle, CheckCircle,
  Grid, List, BarChart3, TrendingUp, Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { 
  useGetStudioEquipmentQuery,
  useGetEquipmentStatsQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  useAddMaintenanceMutation
} from '../../store/equipmentApi'

const AdminEquipmentManager = () => {
  const [selectedStudio, setSelectedStudio] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('create')
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  const { data: equipmentData, isLoading } = useGetStudioEquipmentQuery({
    studioId: selectedStudio !== 'all' ? selectedStudio : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    page, limit: 20
  }, { skip: !selectedStudio || selectedStudio === 'all' })

  const { data: statsData } = useGetEquipmentStatsQuery(
    selectedStudio, 
    { skip: !selectedStudio || selectedStudio === 'all' }
  )

  const [createEquipment] = useCreateEquipmentMutation()
  const [updateEquipment] = useUpdateEquipmentMutation()
  const [deleteEquipment] = useDeleteEquipmentMutation()

  const categories = [
    'Microphones', 'Audio Interfaces', 'Monitors', 'Headphones',
    'Instruments', 'Amplifiers', 'Effects', 'Recording', 'Mixing',
    'Mastering', 'Lighting', 'Cameras', 'Other'
  ]

  const conditions = ['New', 'Excellent', 'Good', 'Fair', 'Poor']

  const handleCreateEquipment = async (equipmentData) => {
    try {
      await createEquipment(equipmentData).unwrap()
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
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await deleteEquipment(id).unwrap()
        toast.success('Equipment deleted successfully')
      } catch (error) {
        toast.error(error.data?.message || 'Failed to delete equipment')
      }
    }
  }

  const openModal = (type, equipment = null) => {
    setModalType(type)
    setSelectedEquipment(equipment)
    setShowModal(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Equipment Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage studio equipment and inventory
          </p>
        </div>
        <Button
          onClick={() => openModal('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Stats Cards */}
      {statsData?.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Equipment
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsData.data.overview.totalEquipment}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statsData.data.overview.totalValue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Available
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsData.data.overview.availableCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Categories
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsData.data.categoryBreakdown?.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Equipment
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condition
            </label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
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
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View
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

      {/* Equipment Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {equipmentData?.data?.map((equipment) => (
            <motion.div
              key={equipment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {equipment.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {equipment.brand} {equipment.model}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openModal('edit', equipment)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEquipment(equipment._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="font-medium">{equipment.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      equipment.condition === 'New' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      equipment.condition === 'Excellent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      equipment.condition === 'Good' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {equipment.condition}
                    </span>
                  </div>

                  {equipment.currentValue && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Value:</span>
                      <span className="font-medium">{formatCurrency(equipment.currentValue)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Available:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      equipment.isAvailable 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {equipment.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {equipment.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                    {equipment.description}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedEquipment(null)
        }}
        type={modalType}
        equipment={selectedEquipment}
        onSubmit={modalType === 'create' ? handleCreateEquipment : handleUpdateEquipment}
        categories={categories}
        conditions={conditions}
      />
    </div>
  )
}

// Equipment Modal Component
const EquipmentModal = ({ isOpen, onClose, type, equipment, onSubmit, categories, conditions }) => {
  const [formData, setFormData] = useState({
    name: '', brand: '', model: '', category: 'Microphones',
    description: '', condition: 'Good', purchasePrice: '',
    currentValue: '', serialNumber: '', location: '',
    isAvailable: true, isInsured: false, studio: ''
  })

  React.useEffect(() => {
    if (equipment && type === 'edit') {
      setFormData({
        name: equipment.name || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        category: equipment.category || 'Microphones',
        description: equipment.description || '',
        condition: equipment.condition || 'Good',
        purchasePrice: equipment.purchasePrice || '',
        currentValue: equipment.currentValue || '',
        serialNumber: equipment.serialNumber || '',
        location: equipment.location || '',
        isAvailable: equipment.isAvailable !== undefined ? equipment.isAvailable : true,
        isInsured: equipment.isInsured || false,
        studio: equipment.studio || ''
      })
    } else {
      setFormData({
        name: '', brand: '', model: '', category: 'Microphones',
        description: '', condition: 'Good', purchasePrice: '',
        currentValue: '', serialNumber: '', location: '',
        isAvailable: true, isInsured: false, studio: ''
      })
    }
  }, [equipment, type, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${type === 'create' ? 'Add' : 'Edit'} Equipment`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purchase Price
            </label>
            <input
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Value
            </label>
            <input
              type="number"
              value={formData.currentValue}
              onChange={(e) => setFormData(prev => ({ ...prev, currentValue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Available</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isInsured}
              onChange={(e) => setFormData(prev => ({ ...prev, isInsured: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Insured</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {type === 'create' ? 'Add' : 'Update'} Equipment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminEquipmentManager
