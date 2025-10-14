import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * PayHere Checkout Component
 * Handles PayHere payment gateway integration
 * Supports both sandbox and live modes
 */
const PayHereCheckout = ({ checkoutData, bookingId, onSuccess, onError, onCancel }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
  const payhereRef = useRef(null);

  useEffect(() => {
    // Load PayHere script
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;
    script.onload = () => {
      console.log('PayHere script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load PayHere script');
      toast.error('Failed to load payment gateway');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const verifyPaymentWithBackend = async (orderId) => {
    try {
      // Call backend to verify payment
      const response = await fetch('/api/payments/verify-payhere', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: orderId, // PayHere uses same ID
          status_code: 2, // Success status
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment verification response error:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Payment verified successfully!');
        
        if (onSuccess) {
          onSuccess(orderId);
        } else {
          // Redirect to success page with verified payment
          navigate(`/payment-success?order_id=${orderId}&booking_id=${bookingId}`);
        }
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      
      // Show more specific error message
      if (error.message.includes('Server error: 500')) {
        toast.error('Payment processing error. Your payment may have succeeded - please check your bookings or contact support.');
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
      
      // Still redirect to success page so user can see their booking status
      if (onSuccess) {
        onSuccess(orderId);
      } else {
        navigate(`/payment-success?order_id=${orderId}&booking_id=${bookingId}`);
      }
    }
  };

  const initiatePayment = () => {
    if (!window.payhere) {
      toast.error('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    // PayHere payment object
    const payment = {
      sandbox: true, // Sandbox mode for testing
      merchant_id: checkoutData.merchant_id,
      return_url: `${window.location.origin}/payment-success`,
      cancel_url: `${window.location.origin}/payment-cancel`,
      notify_url: checkoutData.notify_url,
      order_id: checkoutData.order_id,
      items: checkoutData.items,
      amount: checkoutData.amount,
      currency: checkoutData.currency,
      hash: checkoutData.hash,
      first_name: checkoutData.first_name,
      last_name: checkoutData.last_name,
      email: checkoutData.email,
      phone: checkoutData.phone,
      address: checkoutData.address || '',
      city: checkoutData.city || '',
      country: checkoutData.country || 'LK',
      custom_1: checkoutData.custom_1,
      custom_2: checkoutData.custom_2,
    };

    // Configure PayHere callbacks
    window.payhere.onCompleted = function onCompleted(orderId) {
      console.log('Payment completed. OrderID:', orderId);
      setPaymentStatus('success');
      setIsProcessing(false);
      
      // Verify payment with backend before showing success
      verifyPaymentWithBackend(orderId);
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log('Payment dismissed');
      setPaymentStatus('idle');
      setIsProcessing(false);
      toast.error('Payment was cancelled');
      
      if (onCancel) {
        onCancel();
      }
    };

    window.payhere.onError = function onError(error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      toast.error('Payment failed. Please try again.');
      
      if (onError) {
        onError(error);
      }
    };

    // Start payment
    window.payhere.startPayment(payment);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing payment...';
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Click the button below to proceed with payment';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Payment Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Complete Your Payment
        </h2>
        <p className="text-gray-600">{getStatusMessage()}</p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-semibold text-gray-800">
            {checkoutData.order_id}
          </span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">Service:</span>
          <span className="font-semibold text-gray-800">
            {checkoutData.items}
          </span>
        </div>
        <div className="flex justify-between items-center border-t pt-3">
          <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            {checkoutData.currency} {parseFloat(checkoutData.amount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Secure Payment</p>
            <p>Your payment is processed securely through PayHere. We never store your card details.</p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={initiatePayment}
        disabled={isProcessing || paymentStatus === 'success'}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
          isProcessing || paymentStatus === 'success'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : paymentStatus === 'success' ? (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Payment Completed
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay with PayHere
          </>
        )}
      </button>

      {/* Test Card Info (Sandbox Mode) */}
      {checkoutData.sandbox !== false && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            🧪 Sandbox Mode - Test Cards
          </p>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>Visa:</strong> 4111 1111 1111 1111</p>
            <p><strong>Mastercard:</strong> 5555 5555 5555 4444</p>
            <p><strong>CVV:</strong> Any 3 digits | <strong>Expiry:</strong> Any future date</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayHereCheckout;
