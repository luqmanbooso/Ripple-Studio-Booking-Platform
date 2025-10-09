import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateCheckoutSessionMutation } from "../store/paymentApi";
import { motion } from "framer-motion";
import {
  CreditCard,
  Shield,
  ArrowLeft,
  AlertCircle,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import PayHereGateway from "../components/common/PayHereGateway";
import PayHereCheckout from "../components/payment/PayHereCheckout";
import ReservationTimer from "../components/common/ReservationTimer";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [createCheckoutSession, { isLoading }] =
    useCreateCheckoutSessionMutation();

  const [booking, setBooking] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [useNewPayment, setUseNewPayment] = useState(true); // Toggle between old and new payment flow

  useEffect(() => {
    const bookingData = location.state?.booking;
    const existingCheckoutUrl = location.state?.checkoutUrl;
    const existingCheckoutData = location.state?.checkoutData;

    // Checkout component initialized

    if (!bookingData) {
      setHasError(true);
      setIsInitializing(false);
      toast.error("No booking data found. Please start a new booking.");
      console.error("No booking data in location.state");
      return;
    }

    if (!user) {
      toast.error("Please log in to continue");
      navigate("/login", {
        state: {
          from: location.pathname,
          bookingData,
        },
      });
      return;
    }

    setBooking(bookingData);

    // If we already have checkout data from NewBooking, use it
    if (existingCheckoutData) {
      // Using existing checkout data from booking creation
      setPaymentData({
        checkoutUrl: existingCheckoutUrl,
        checkoutData: existingCheckoutData,
      });
    }

    setIsInitializing(false);
  }, [location.state, user, navigate]);

  useEffect(() => {
    // Only initiate payment if we don't already have payment data
    if (booking && !paymentData && !isInitializing) {
      initiatePayment();
    }
  }, [booking, paymentData, isInitializing]);

  const initiatePayment = async () => {
    try {
      // Initiating payment for booking
      const response = await createCheckoutSession({
        bookingId: booking._id,
      }).unwrap();

      // Payment initiation successful

      setPaymentData({
        checkoutUrl: response.data?.checkoutUrl || response.url,
        checkoutData: response.data?.checkoutData || response.checkoutData,
      });
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error(
        error.data?.message || error.message || "Failed to initiate payment"
      );
    }
  };

  const handleRetry = () => {
    setPaymentData(null);
    initiatePayment();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleReservationExpired = () => {
    toast.error("Your reservation has expired. Please make a new booking.");
    navigate("/search");
  };

  if (isInitializing || !booking) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error page if accessed directly without booking data
  if (hasError) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="container max-w-md mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="p-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>

              <h1 className="text-2xl font-bold text-gray-100 mb-4">
                No Booking Found
              </h1>

              <p className="text-gray-400 mb-6">
                You need to start a booking process to access this checkout
                page. Please search for a studio and create a booking first.
              </p>

              <div className="space-y-3">
                <Link to="/search">
                  <Button
                    className="w-full"
                    icon={<Search className="w-4 h-4" />}
                  >
                    Find Studios
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-full"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Go Back
                </Button>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>
                  Need help?{" "}
                  <Link
                    to="/contact"
                    className="text-accent-400 hover:text-accent-300"
                  >
                    Contact us
                  </Link>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = (orderId) => {
    navigate(`/payment-success?order_id=${orderId}&booking_id=${booking._id}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  };

  const handlePaymentCancel = () => {
    navigate(`/payment-cancel?booking_id=${booking._id}&order_id=${paymentData?.checkoutData?.order_id}`);
  };

  return (
    <>
      <ReservationTimer 
        booking={booking} 
        onExpired={handleReservationExpired}
      />
      
      {useNewPayment && paymentData?.checkoutData ? (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Payment</h1>
                <p className="text-gray-600">Secure payment powered by PayHere</p>
              </div>
              
              {/* Payment Component */}
              <PayHereCheckout
                checkoutData={paymentData.checkoutData}
                bookingId={booking._id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
              
              {/* Back Button */}
              <div className="text-center mt-8">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <PayHereGateway
          booking={booking}
          checkoutData={paymentData?.checkoutData}
          onBack={handleBack}
          onRetry={handleRetry}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default Checkout;
