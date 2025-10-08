import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, Home, CreditCard } from 'lucide-react';
import { useGetBookingQuery } from '../store/bookingApi';
import { format } from 'date-fns';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('booking_id');
  const orderId = searchParams.get('order_id');

  // Fetch booking details
  const { data: bookingData, isLoading: bookingLoading } = useGetBookingQuery(bookingId, {
    skip: !bookingId
  });

  const booking = bookingData?.data;

  const retryPayment = () => {
    if (bookingId) {
      navigate(`/checkout?booking=${bookingId}&retry=true`);
    }
  };

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
            <p className="text-lg text-gray-600">Your payment was not completed</p>
          </div>

          {/* Information Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="border-l-4 border-orange-400 bg-orange-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700">
                    <strong>Payment was cancelled or interrupted.</strong> Your booking reservation is still active for a limited time.
                  </p>
                </div>
              </div>
            </div>

            {orderId && (
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-500">Order ID</label>
                <p className="text-gray-800 font-mono">{orderId}</p>
              </div>
            )}

            {/* Booking Details */}
            {booking && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Studio:</span>
                    <span className="font-medium text-gray-800">{booking.studio?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-800">{booking.service?.name || 'Studio Session'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium text-gray-800">
                      {format(new Date(booking.start), 'PPP p')} - {format(new Date(booking.end), 'p')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-800">
                      {booking.currency || 'LKR'} {booking.price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <RefreshCw className="w-3 h-3" />
                      Payment Pending
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* What Happened */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What Happened?</h3>
            <div className="space-y-3 text-gray-600">
              <p>Your payment was cancelled or interrupted. This could happen for several reasons:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You clicked the "Cancel" button on the payment page</li>
                <li>You closed the payment window before completing the transaction</li>
                <li>There was a network interruption during payment</li>
                <li>Your bank declined the transaction</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={retryPayment}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Retry Payment
            </button>
            
            <Link
              to="/studios"
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Browse Studios
            </Link>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">⏰ Important Notice</h3>
            <div className="text-yellow-700 space-y-2">
              <p>
                <strong>Your booking reservation is temporary.</strong> You have a limited time to complete the payment before the reservation expires.
              </p>
              <p>
                If you don't complete the payment within the time limit, the booking slot will be released and made available to other users.
              </p>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Need Help?</h3>
            <div className="text-blue-700 space-y-2">
              <p>If you're experiencing payment issues:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Check your internet connection and try again</li>
                <li>Ensure your card has sufficient funds</li>
                <li>Try using a different payment method</li>
                <li>Contact your bank if the card is being declined</li>
                <li>Contact our support team for assistance</li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center mt-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Home className="w-5 h-5" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
