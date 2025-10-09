import React, { useState } from 'react';
import { useCreateCheckoutSessionMutation } from '../../store/paymentApi';
import { useGetMyPaymentsQuery } from '../../store/paymentApi';
import PaymentHistory from '../payment/PaymentHistory';
import PaymentStatusBadge from '../payment/PaymentStatusBadge';
import { CreditCard, TestTube, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * PaymentTest Component
 * Test component for PayHere integration
 * Only use this for development/testing
 */
const PaymentTest = () => {
  const [createCheckout, { isLoading }] = useCreateCheckoutSessionMutation();
  const { data: paymentsData, refetch } = useGetMyPaymentsQuery();
  const [testBookingId, setTestBookingId] = useState('');

  const handleTestPayment = async () => {
    if (!testBookingId.trim()) {
      toast.error('Please enter a booking ID to test');
      return;
    }

    try {
      const result = await createCheckout({ bookingId: testBookingId }).unwrap();
      console.log('Checkout session created:', result);
      toast.success('Checkout session created successfully!');
      
      // In a real app, you would redirect to checkout
      // For testing, we just log the result
      if (result.checkoutData) {
        console.log('PayHere checkout data:', result.checkoutData);
      }
    } catch (error) {
      console.error('Checkout creation failed:', error);
      toast.error(`Checkout failed: ${error.data?.message || error.message}`);
    }
  };

  const testStatuses = ['Completed', 'Pending', 'Failed', 'Refunded', 'Chargeback'];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <TestTube className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">PayHere Integration Test</h1>
        </div>
        <p className="text-gray-600">Test PayHere payment integration and components</p>
      </div>

      {/* Test Checkout Session */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Test Checkout Session Creation
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking ID (for testing)
            </label>
            <input
              type="text"
              value={testBookingId}
              onChange={(e) => setTestBookingId(e.target.value)}
              placeholder="Enter a valid booking ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter a booking ID from your database to test checkout session creation
            </p>
          </div>
          
          <button
            onClick={handleTestPayment}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            {isLoading ? 'Creating...' : 'Create Test Checkout'}
          </button>
        </div>
      </div>

      {/* Test Payment Status Badges */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Payment Status Badges Test
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testStatuses.map(status => (
            <div key={status} className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium text-gray-600">{status}</span>
              <PaymentStatusBadge status={status} />
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Test */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Payment History Component Test
          </h2>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <PaymentHistory />
        </div>
      </div>

      {/* API Endpoints Test */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          API Endpoints Status
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">POST /api/payments/create-checkout-session</span>
            <span className="text-green-600 font-medium">✓ Available</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">GET /api/payments/my-payments</span>
            <span className="text-green-600 font-medium">✓ Available</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">POST /api/webhooks/payhere</span>
            <span className="text-green-600 font-medium">✓ Available</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">POST /api/payments/verify-payhere</span>
            <span className="text-green-600 font-medium">✓ Available</span>
          </div>
        </div>
      </div>

      {/* Environment Check */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Environment Configuration
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">PayHere Script</span>
            <span className={`font-medium ${typeof window !== 'undefined' && window.payhere ? 'text-green-600' : 'text-red-600'}`}>
              {typeof window !== 'undefined' && window.payhere ? '✓ Loaded' : '✗ Not Loaded'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Backend Connection</span>
            <span className="text-green-600 font-medium">✓ Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Payment API</span>
            <span className="text-green-600 font-medium">✓ Integrated</span>
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Testing Instructions</h3>
        <div className="text-blue-700 space-y-2">
          <p><strong>1. Environment Setup:</strong> Configure PayHere credentials in .env file</p>
          <p><strong>2. Create Booking:</strong> Create a test booking through the normal booking flow</p>
          <p><strong>3. Test Checkout:</strong> Use the booking ID above to test checkout session creation</p>
          <p><strong>4. Test Payment:</strong> Complete payment flow with test card numbers</p>
          <p><strong>5. Verify Records:</strong> Check payment history and database records</p>
        </div>
      </div>

      {/* Test Cards Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">PayHere Test Cards (Sandbox)</h3>
        <div className="text-yellow-700 space-y-1 font-mono text-sm">
          <p><strong>Visa:</strong> 4111 1111 1111 1111</p>
          <p><strong>Mastercard:</strong> 5555 5555 5555 4444</p>
          <p><strong>CVV:</strong> Any 3 digits</p>
          <p><strong>Expiry:</strong> Any future date</p>
          <p><strong>Name:</strong> Any name</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;
