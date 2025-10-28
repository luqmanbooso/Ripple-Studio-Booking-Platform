import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const EquipmentSelector = ({ 
  studioId, 
  selectedEquipment = [], 
  onEquipmentChange, 
  bookingDuration = 1 
}) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(selectedEquipment);

  useEffect(() => {
    fetchEquipment();
  }, [studioId]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/equipment/studio/${studioId}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter only rentable and available equipment
        const rentableEquipment = data.data.filter(
          item => item.isRentable && item.status === 'Available'
        );
        setEquipment(rentableEquipment);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentToggle = (equipmentItem) => {
    const isSelected = selectedItems.find(item => item.equipmentId === equipmentItem._id);
    
    if (isSelected) {
      // Remove equipment
      const updated = selectedItems.filter(item => item.equipmentId !== equipmentItem._id);
      setSelectedItems(updated);
      onEquipmentChange(updated);
    } else {
      // Add equipment
      const newItem = {
        equipmentId: equipmentItem._id,
        name: equipmentItem.name,
        rentalPrice: calculateRentalPrice(equipmentItem, bookingDuration),
        rentalDuration: 'session',
        category: equipmentItem.category,
        brand: equipmentItem.brand,
        model: equipmentItem.model,
        condition: equipmentItem.condition
      };
      
      const updated = [...selectedItems, newItem];
      setSelectedItems(updated);
      onEquipmentChange(updated);
    }
  };

  const calculateRentalPrice = (equipmentItem, duration) => {
    // For session-based rental, use daily rate proportionally
    const hoursInSession = duration;
    const dailyRate = equipmentItem.rentalPricePerDay || 0;
    
    if (hoursInSession <= 4) {
      return Math.round(dailyRate * 0.5); // Half day rate
    } else if (hoursInSession <= 8) {
      return dailyRate; // Full day rate
    } else {
      return Math.round(dailyRate * 1.5); // Extended session rate
    }
  };

  const getTotalRentalCost = () => {
    return selectedItems.reduce((total, item) => total + item.rentalPrice, 0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In-Use':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'New':
        return 'text-green-600 bg-green-100';
      case 'Excellent':
        return 'text-blue-600 bg-blue-100';
      case 'Good':
        return 'text-yellow-600 bg-yellow-100';
      case 'Fair':
        return 'text-orange-600 bg-orange-100';
      case 'Poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">Loading equipment...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        Equipment Rental
        {selectedItems.length > 0 && (
          <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full">
            {selectedItems.length} selected
          </span>
        )}
      </h3>

      {equipment.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No equipment available for rental</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {equipment.map((item) => {
              const isSelected = selectedItems.find(selected => selected.equipmentId === item._id);
              const rentalPrice = calculateRentalPrice(item, bookingDuration);

              return (
                <motion.div
                  key={item._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                    isSelected
                      ? "border-orange-400/70 bg-gradient-to-br from-orange-500/25 to-red-600/15 shadow-xl shadow-orange-500/30"
                      : "border-gray-600/50 bg-gradient-to-br from-gray-700/20 to-gray-800/10 hover:border-gray-500/70 hover:shadow-lg"
                  }`}
                  onClick={() => handleEquipmentToggle(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <h4 className="font-semibold text-gray-100 text-sm">
                        {item.name}
                      </h4>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-orange-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {item.brand && (
                      <p className="text-xs text-gray-400">
                        {item.brand} {item.model && `• ${item.model}`}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                      <span className="text-xs text-gray-400">{item.category}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-600/30">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span className="text-sm font-semibold text-green-400">
                          LKR {rentalPrice?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">session</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-orange-300">Selected Equipment</h4>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-bold text-green-400">
                    LKR {getTotalRentalCost()?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400">total</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.equipmentId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-green-400">LKR {item.rentalPrice?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default EquipmentSelector;
