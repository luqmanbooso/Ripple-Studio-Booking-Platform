import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateCheckoutSessionMutation } from "../store/paymentApi";
import { motion } from "framer-motion";
import { CreditCard, Shield, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    const bookingData = location.state?.booking;
    const existingCheckoutUrl = location.state?.checkoutUrl;
    const existingCheckoutData = location.state?.checkoutData;

    console.log("Checkout component - location.state:", location.state);
    console.log("Checkout component - bookingData:", bookingData);

    if (!bookingData) {
      toast.error("No booking data found");
      console.error("No booking data in location.state");
      navigate("/search");
      return;
    }

    if (!user) {
      toast.error("Please log in to continue");
      navigate("/login");
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
