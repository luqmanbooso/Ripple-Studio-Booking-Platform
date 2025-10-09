import React from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * PaymentStatusBadge Component
 * Displays payment status with appropriate colors and icons
 */
const PaymentStatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      Completed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Paid'
      },
      Pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending'
      },
      Failed: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Failed'
      },
      Refunded: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: RefreshCw,
        label: 'Refunded'
      },
      Chargeback: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: AlertCircle,
        label: 'Disputed'
      },
      // Booking statuses
      confirmed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Paid'
      },
      payment_pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Payment Due'
      },
      reservation_pending: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock,
        label: 'Reservation'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle,
        label: 'Cancelled'
      },
      refunded: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: RefreshCw,
        label: 'Refunded'
      }
    };

    return configs[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertCircle,
      label: status || 'Unknown'
    };
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default PaymentStatusBadge;
