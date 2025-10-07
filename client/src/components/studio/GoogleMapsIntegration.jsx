import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ExternalLink, Phone, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const GoogleMapsIntegration = ({ studio }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [directions, setDirections] = useState(null);

  const { location } = studio;
  const address = `${location.address || ''}, ${location.city}, ${location.country}`.trim();

  // Generate Google Maps URLs
  const getMapEmbedUrl = () => {
    const query = encodeURIComponent(address);
    return `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${query}&zoom=15`;
  };

  const getDirectionsUrl = () => {
    const query = encodeURIComponent(address);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  const getSearchUrl = () => {
    const query = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const handleNavigate = () => {
    // Try to open in Google Maps app first, fallback to web
    const mapsUrl = getDirectionsUrl();
    window.open(mapsUrl, '_blank');
  };

  const handleViewOnMaps = () => {
    const searchUrl = getSearchUrl();
    window.open(searchUrl, '_blank');
  };

  // Get user's current location for directions
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const directionsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${encodeURIComponent(address)}`;
          window.open(directionsUrl, '_blank');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to regular directions
          handleNavigate();
        }
      );
    } else {
      handleNavigate();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        Studio Location
      </h3>

      {/* Address Information */}
      <div className="mb-6">
        <div className="flex items-start space-x-3 mb-4">
          <MapPin className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-100 font-medium">{studio.name}</p>
            <p className="text-gray-300 text-sm">{address}</p>
          </div>
        </div>

        {/* Contact Information */}
        {studio.contactInfo?.phone && (
          <div className="flex items-center space-x-3 mb-2">
            <Phone className="w-4 h-4 text-blue-400" />
            <a 
              href={`tel:${studio.contactInfo.phone}`}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {studio.contactInfo.phone}
            </a>
          </div>
        )}

        {/* Business Hours */}
        {studio.availability && studio.availability.length > 0 && (
          <div className="flex items-center space-x-3">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">
              Check availability calendar for hours
            </span>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div className="mb-6">
        <div className="relative rounded-xl overflow-hidden bg-gray-800/50 border border-gray-600/30">
          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
            <iframe
              src={getMapEmbedUrl()}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl"
              onLoad={() => setMapLoaded(true)}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Google Maps integration requires API key
                </p>
                <Button
                  onClick={handleViewOnMaps}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  View on Google Maps
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={getCurrentLocation}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            size="sm"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleViewOnMaps}
            variant="outline"
            className="w-full border-gray-600 hover:border-gray-500"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Maps
          </Button>
        </motion.div>
      </div>

      {/* Additional Location Info */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">City:</span>
            <p className="text-gray-200 font-medium">{location.city}</p>
          </div>
          <div>
            <span className="text-gray-400">Country:</span>
            <p className="text-gray-200 font-medium">{location.country}</p>
          </div>
        </div>
      </div>

      {/* PRD: Navigation Tips */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <Navigation className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <p className="font-medium mb-1">Navigation Tips:</p>
            <ul className="space-y-1 text-blue-200/80">
              <li>• Click "Get Directions" for turn-by-turn navigation</li>
              <li>• Works with Google Maps, Apple Maps, and Waze</li>
              <li>• Call studio if you need parking information</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GoogleMapsIntegration;
