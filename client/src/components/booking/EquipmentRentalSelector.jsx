import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Calendar, DollarSign, Clock, 
  CheckCircle, AlertCircle, Plus, Minus 
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Button from '../ui/Button'
import Card from '../ui/Card'

const EquipmentRentalSelector = ({ 
  availableEquipment = [], 
  selectedEquipment = [], 
  onEquipmentChange,
  bookingDates = { startDate: null, endDate: null },
  onPriceUpdate 
}) => {
  const [equipmentQuantities, setEquipmentQuantities] = useState({})
  const [rentalDuration, setRentalDuration] = useState({ days: 1, weeks: 0, months: 0 })

  // Calculate rental duration from booking dates
  useEffect(() => {
    if (bookingDates.startDate && bookingDates.endDate) {
      const start = new Date(bookingDates.startDate)
      const end = new Date(bookingDates.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const months = Math.floor(diffDays / 30)
      const weeks = Math.floor((diffDays % 30) / 7)
      const days = diffDays % 7
      
      setRentalDuration({ days: diffDays, weeks, months })
    }
  }, [bookingDates])

  // Calculate total rental cost
  const calculateRentalCost = (equipment, quantity = 1) => {
    const { days } = rentalDuration
    
    // Use most cost-effective pricing tier
    let dailyRate = equipment.rentalPricePerDay || 0
    let weeklyRate = equipment.rentalPricePerWeek || 0
    let monthlyRate = equipment.rentalPricePerMonth || 0
    
    if (days >= 30 && monthlyRate > 0) {
      const months = Math.ceil(days / 30)
      return months * monthlyRate * quantity
    } else if (days >= 7 && weeklyRate > 0) {
      const weeks = Math.ceil(days / 7)
      return weeks * weeklyRate * quantity
    } else {
      return days * dailyRate * quantity
    }
  }

  // Handle equipment selection
  const handleEquipmentToggle = (equipment) => {
    const isSelected = selectedEquipment.some(item => item._id === equipment._id)
    let newSelection = []
    
    if (isSelected) {
      newSelection = selectedEquipment.filter(item => item._id !== equipment._id)
      setEquipmentQuantities(prev => {
        const updated = { ...prev }
        delete updated[equipment._id]
        return updated
      })
    } else {
      const quantity = 1
      newSelection = [...selectedEquipment, { ...equipment, quantity, rentalCost: calculateRentalCost(equipment, quantity) }]
      setEquipmentQuantities(prev => ({ ...prev, [equipment._id]: quantity }))
    }
    
    onEquipmentChange(newSelection)
    updateTotalPrice(newSelection)
  }

  // Handle quantity change
  const handleQuantityChange = (equipmentId, change) => {
    const currentQuantity = equipmentQuantities[equipmentId] || 1
    const newQuantity = Math.max(1, currentQuantity + change)
    
    setEquipmentQuantities(prev => ({ ...prev, [equipmentId]: newQuantity }))
    
    const updatedSelection = selectedEquipment.map(item => {
      if (item._id === equipmentId) {
        const equipment = availableEquipment.find(eq => eq._id === equipmentId)
        return { 
          ...item, 
          quantity: newQuantity, 
          rentalCost: calculateRentalCost(equipment, newQuantity) 
        }
      }
      return item
    })
    
    onEquipmentChange(updatedSelection)
    updateTotalPrice(updatedSelection)
  }

  // Update total price
  const updateTotalPrice = (equipment) => {
    const totalCost = equipment.reduce((sum, item) => sum + (item.rentalCost || 0), 0)
    onPriceUpdate && onPriceUpdate(totalCost)
  }

  // Get best pricing display
  const getBestPricing = (equipment) => {
    const { days } = rentalDuration
    
    if (days >= 30 && equipment.rentalPricePerMonth > 0) {
      return { rate: equipment.rentalPricePerMonth, period: 'month', total: Math.ceil(days / 30) }
    } else if (days >= 7 && equipment.rentalPricePerWeek > 0) {
      return { rate: equipment.rentalPricePerWeek, period: 'week', total: Math.ceil(days / 7) }
    } else {
      return { rate: equipment.rentalPricePerDay, period: 'day', total: days }
    }
  }

  return (
    <div className="space-y-6">
      {/* Rental Duration Display */}
      {bookingDates.startDate && bookingDates.endDate && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Rental Duration: {rentalDuration.days} {rentalDuration.days === 1 ? 'day' : 'days'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(bookingDates.startDate).toLocaleDateString()} - {new Date(bookingDates.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Equipment Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Available Equipment for Rental
        </h3>
        
        {availableEquipment.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No equipment available for rental</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableEquipment.map((equipment) => {
              const isSelected = selectedEquipment.some(item => item._id === equipment._id)
              const quantity = equipmentQuantities[equipment._id] || 1
              const pricing = getBestPricing(equipment)
              const totalCost = calculateRentalCost(equipment, quantity)
              
              return (
                <motion.div
                  key={equipment._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className={`p-4 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:shadow-md hover:scale-[1.02]'
                  }`}>
                    <div className="space-y-3">
                      {/* Equipment Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{equipment.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{equipment.category}</p>
                          {equipment.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                              {equipment.description}
                            </p>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </div>

                      {/* Equipment Image */}
                      {equipment.image && (
                        <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={equipment.image} 
                            alt={equipment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Pricing Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            LKR {pricing.rate?.toLocaleString()}/{pricing.period}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            equipment.condition === 'New' ? 'bg-green-100 text-green-800' :
                            equipment.condition === 'Excellent' ? 'bg-blue-100 text-blue-800' :
                            equipment.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {equipment.condition}
                          </span>
                        </div>
                        
                        {rentalDuration.days > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Total: </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              LKR {totalCost?.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Selection Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          variant={isSelected ? "primary" : "outline"}
                          onClick={() => handleEquipmentToggle(equipment)}
                          className="flex-1 mr-2"
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </Button>
                        
                        {isSelected && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(equipment._id, -1)}
                              disabled={quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(equipment._id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Equipment Summary */}
      {selectedEquipment.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Selected Equipment ({selectedEquipment.length})
          </h4>
          <div className="space-y-2">
            {selectedEquipment.map((item) => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  LKR {item.rentalCost?.toLocaleString() || '0'}
                </span>
              </div>
            ))}
            <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
              <div className="flex items-center justify-between font-medium">
                <span className="text-gray-900 dark:text-white">Total Equipment Cost:</span>
                <span className="text-green-600 dark:text-green-400 text-lg">
                  LKR {selectedEquipment.reduce((sum, item) => sum + (item.rentalCost || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EquipmentRentalSelector
