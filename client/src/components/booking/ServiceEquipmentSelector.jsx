import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, AlertCircle, Info } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

const ServiceEquipmentSelector = ({ 
  selectedServices = [], 
  availableEquipment = [], 
  onEquipmentChange,
  bookingDate,
  timeSlot 
}) => {
  const [requiredEquipment, setRequiredEquipment] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState([])
  const [equipmentConflicts, setEquipmentConflicts] = useState([])

  // Service-Equipment mapping
  const serviceEquipmentMap = {
    recording: {
      required: ['microphone', 'audio_interface', 'headphones'],
      optional: ['preamp', 'compressor', 'reverb_unit'],
      categories: ['microphones', 'interfaces', 'monitoring']
    },
    mixing: {
      required: ['studio_monitors', 'audio_interface', 'mixing_software'],
      optional: ['analog_console', 'outboard_gear'],
      categories: ['monitors', 'interfaces', 'software']
    },
    mastering: {
      required: ['reference_monitors', 'mastering_software', 'audio_interface'],
      optional: ['mastering_console', 'analog_processors'],
      categories: ['monitors', 'software', 'mastering_gear']
    },
    production: {
      required: ['daw_software', 'midi_controller', 'studio_monitors'],
      optional: ['synthesizers', 'drum_machines', 'samplers'],
      categories: ['software', 'controllers', 'instruments']
    },
    video: {
      required: ['cameras', 'lighting_kit', 'audio_recorder'],
      optional: ['tripods', 'additional_lights', 'green_screen'],
      categories: ['cameras', 'lighting', 'audio']
    }
  }

  useEffect(() => {
    // Calculate required equipment based on selected services
    const required = []
    const optional = []
    
    selectedServices.forEach(service => {
      const serviceMap = serviceEquipmentMap[service.category]
      if (serviceMap) {
        required.push(...serviceMap.required)
        optional.push(...serviceMap.optional)
      }
    })

    setRequiredEquipment([...new Set(required)])
    
    // Check for equipment conflicts
    checkEquipmentAvailability(required, optional)
  }, [selectedServices, bookingDate, timeSlot])

  const checkEquipmentAvailability = (required, optional) => {
    const conflicts = []
    const available = []
    
    required.forEach(equipmentType => {
      const availableItems = availableEquipment.filter(item => 
        item.category === equipmentType && item.available
      )
      
      if (availableItems.length === 0) {
        conflicts.push({
          type: equipmentType,
          severity: 'error',
          message: `No ${equipmentType} available for this time slot`
        })
      } else {
        available.push(...availableItems)
      }
    })
    
    setEquipmentConflicts(conflicts)
  }

  const handleEquipmentToggle = (equipment) => {
    const isSelected = selectedEquipment.find(e => e.id === equipment.id)
    let newSelection
    
    if (isSelected) {
      newSelection = selectedEquipment.filter(e => e.id !== equipment.id)
    } else {
      newSelection = [...selectedEquipment, equipment]
    }
    
    setSelectedEquipment(newSelection)
    onEquipmentChange?.(newSelection)
  }

  const getEquipmentByCategory = (category) => {
    return availableEquipment.filter(item => 
      item.category === category && item.available
    )
  }

  const isEquipmentRequired = (equipment) => {
    return requiredEquipment.includes(equipment.category)
  }

  const isEquipmentSelected = (equipment) => {
    return selectedEquipment.find(e => e.id === equipment.id)
  }

  return (
    <div className="space-y-6">
      {/* Equipment Conflicts Alert */}
      {equipmentConflicts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">Equipment Conflicts</h4>
              <ul className="mt-2 space-y-1">
                {equipmentConflicts.map((conflict, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-200">
                    • {conflict.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Service Requirements Info */}
      {selectedServices.length > 0 && (
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Required Equipment</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                Based on your selected services, the following equipment is required:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {requiredEquipment.map(equipment => (
                  <span key={equipment} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    {equipment.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Equipment Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Equipment ({selectedEquipment.length} selected)
        </h3>
        
        {Object.entries(serviceEquipmentMap).map(([serviceType, config]) => {
          const hasSelectedService = selectedServices.some(s => s.category === serviceType)
          if (!hasSelectedService) return null
          
          return (
            <div key={serviceType} className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                {serviceType} Equipment
              </h4>
              
              {config.categories.map(category => {
                const categoryEquipment = getEquipmentByCategory(category)
                if (categoryEquipment.length === 0) return null
                
                return (
                  <div key={category} className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {category.replace('_', ' ')}
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryEquipment.map(equipment => {
                        const isRequired = isEquipmentRequired(equipment)
                        const isSelected = isEquipmentSelected(equipment)
                        
                        return (
                          <motion.div
                            key={equipment.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              onClick={() => handleEquipmentToggle(equipment)}
                              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                isSelected
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : isRequired
                                  ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {equipment.name}
                                    </span>
                                    {isRequired && (
                                      <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  {equipment.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {equipment.description}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                                    <span className="capitalize">{equipment.condition}</span>
                                    {equipment.manufacturer && (
                                      <span>• {equipment.manufacturer}</span>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Selection Summary */}
      {selectedEquipment.length > 0 && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Selected Equipment Summary
          </h4>
          <div className="space-y-2">
            {selectedEquipment.map(equipment => (
              <div key={equipment.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900 dark:text-white">{equipment.name}</span>
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {equipment.condition}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default ServiceEquipmentSelector
