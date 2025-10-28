import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, DollarSign, Clock, CheckCircle, Plus, Minus } from 'lucide-react';
import Card from '../ui/Card';

const ServiceSelector = ({ 
  services = [], 
  selectedServices = [], 
  onServicesChange,
  allowMultiple = true 
}) => {
  const [selectedItems, setSelectedItems] = useState(selectedServices);

  const handleServiceToggle = (service) => {
    if (!allowMultiple) {
      // Single service selection
      const newSelection = selectedItems.find(s => s.name === service.name) ? [] : [service];
      setSelectedItems(newSelection);
      onServicesChange(newSelection);
      return;
    }

    // Multiple service selection
    const isSelected = selectedItems.find(s => s.name === service.name);
    
    if (isSelected) {
      const updated = selectedItems.filter(s => s.name !== service.name);
      setSelectedItems(updated);
      onServicesChange(updated);
    } else {
      const updated = [...selectedItems, service];
      setSelectedItems(updated);
      onServicesChange(updated);
    }
  };

  const getTotalServiceCost = () => {
    return selectedItems.reduce((total, service) => total + service.price, 0);
  };

  const getTotalDuration = () => {
    return selectedItems.reduce((total, service) => total + service.durationMins, 0);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'recording':
        return 'text-blue-600 bg-blue-100';
      case 'mixing':
        return 'text-green-600 bg-green-100';
      case 'mastering':
        return 'text-purple-600 bg-purple-100';
      case 'production':
        return 'text-orange-600 bg-orange-100';
      case 'video':
        return 'text-red-600 bg-red-100';
      case 'consultation':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
          <Music className="w-4 h-4 text-white" />
        </div>
        Select Services
        {allowMultiple && selectedItems.length > 0 && (
          <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
            {selectedItems.length} selected
          </span>
        )}
      </h3>

      {services.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No services available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {services.map((service) => {
              const isSelected = selectedItems.find(s => s.name === service.name);

              return (
                <motion.div
                  key={service.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                    isSelected
                      ? "border-purple-400/70 bg-gradient-to-br from-purple-500/25 to-pink-600/15 shadow-xl shadow-purple-500/30"
                      : "border-gray-600/50 bg-gradient-to-br from-gray-700/20 to-gray-800/10 hover:border-gray-500/70 hover:shadow-lg"
                  }`}
                  onClick={() => handleServiceToggle(service)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-100 mb-1">
                        {service.name}
                      </h4>
                      {service.category && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-purple-400" />
                    )}
                  </div>

                  {service.description && (
                    <p className="text-sm text-gray-400 mb-4">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="font-semibold text-green-400">
                          LKR {service.price?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">
                          {service.durationMins} mins
                        </span>
                      </div>
                    </div>
                    
                    {isSelected ? (
                      <Minus className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-300">Selected Services</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400">
                      {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-lg font-bold text-green-400">
                      LKR {getTotalServiceCost()?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedItems.map((service) => (
                  <div key={service.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">{service.name}</span>
                      <span className="text-xs text-gray-500">({service.durationMins}m)</span>
                    </div>
                    <span className="text-green-400">LKR {service.price?.toLocaleString()}</span>
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

export default ServiceSelector;
