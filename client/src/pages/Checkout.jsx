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

  useEffect(() => {
    const bookingData = location.state?.booking;
    const existingCheckoutUrl = location.state?.checkoutUrl;
    const existingCheckoutData = location.state?.checkoutData;

    console.log("Checkout component - location.state:", location.state);
    console.log("Checkout component - bookingData:", bookingData);

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
      console.log("Using existing checkout data:", existingCheckoutData);
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
      console.log("Initiating payment for booking:", booking._id);
      const response = await createCheckoutSession({
        bookingId: booking._id,
      }).unwrap();

      console.log("Payment initiation response:", response);

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

  return (
    <PayHereGateway
      booking={booking}
      checkoutData={paymentData?.checkoutData}
      onBack={handleBack}
      onRetry={handleRetry}
      isLoading={isLoading}
    />
  );
};

export default Checkout;
