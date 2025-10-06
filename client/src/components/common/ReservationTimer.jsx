import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

const ReservationTimer = ({ booking, onExpired }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!booking || booking.status !== 'reservation_pending') {
      return;
    }

    const calculateTimeRemaining = () => {
      const createdAt = new Date(booking.createdAt);
      const expiryTime = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 minutes
      const now = new Date();
      const remaining = Math.max(0, expiryTime - now);

      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        onExpired?.();
      }

      return remaining;
    };

    // Update immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [booking, isExpired, onExpired]);

  if (!booking || booking.status !== 'reservation_pending' || isExpired) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const isUrgent = minutes < 5;
  const isCritical = minutes < 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-2 ${
        isCritical
          ? 'bg-red-900/90 border-red-500 text-red-100'
          : isUrgent
          ? 'bg-yellow-900/90 border-yellow-500 text-yellow-100'
          : 'bg-blue-900/90 border-blue-500 text-blue-100'
      } backdrop-blur-sm`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          isCritical
            ? 'bg-red-500/20'
            : isUrgent
            ? 'bg-yellow-500/20'
            : 'bg-blue-500/20'
        }`}>
          {isCritical ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </div>
        
        <div>
          <div className="font-semibold text-sm">
            {isCritical
              ? 'Reservation Expiring Soon!'
              : isUrgent
              ? 'Complete Payment Soon'
              : 'Reservation Active'
            }
          </div>
          
          <div className="text-lg font-mono font-bold">
            {minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
          </div>
          
          <div className="text-xs opacity-75">
            {isCritical
              ? 'Complete payment now or lose your slot'
              : 'Time remaining to complete payment'
            }
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${
            isCritical
              ? 'bg-red-500'
              : isUrgent
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
          initial={{ width: '100%' }}
          animate={{ 
            width: `${(timeRemaining / (15 * 60 * 1000)) * 100}%` 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

export default ReservationTimer;
