import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Shield,
  ArrowLeft,
  CheckCircle,
  Building,
  Mic,
  Calendar,
  Clock,
  DollarSign,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";

const PayHereGateway = ({
  booking,
  checkoutData,
  onBack,
  onRetry,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState(null);

  const provider = booking?.artist || booking?.studio;
  const providerType = booking?.artist ? "artist" : "studio";
  const providerName = provider?.user?.name || provider?.name;

  // Log checkout data when available
  useEffect(() => {
    if (checkoutData) {
      console.log("PayHere checkout data received:", checkoutData);
    }
  }, [checkoutData]);

  const handlePayNow = async () => {
    console.log("handlePayNow called");
    console.log("checkoutData:", checkoutData);

    if (!checkoutData) {
      console.error("Checkout data not available");
      toast.error("Payment data not available. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Show loading toast
      toast.loading("Redirecting to PayHere...", {
        id: "payment-redirect",
        duration: 5000,
      });

      console.log("Creating direct form submission to PayHere");

      // Create a new form for each submission to avoid conflicts
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";
      form.target = "_self"; // Open in same window

      // Add all PayHere fields
      Object.entries(checkoutData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
        console.log(`Adding field: ${key} = ${value}`);
      });

      // Add form to document and submit immediately
      document.body.appendChild(form);
      console.log("Submitting form to PayHere...");
      form.submit();

      // Clean up
      setTimeout(() => {
        if (form.parentNode) {
          form.parentNode.removeChild(form);
        }
      }, 1000);
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Failed to redirect to payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-400">Preparing your payment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={onBack}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="shrink-0"
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                Complete Payment
              </h1>
              <p className="text-gray-400">Secure payment powered by PayHere</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Summary */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-6">
                  Booking Summary
                </h2>

                {/* Provider Info */}
                <div className="flex items-start gap-4 mb-6 p-4 bg-dark-700 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                    {providerType === "studio" ? (
                      <Building className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100">
                      {providerName}
                    </h3>
                    <p className="text-gray-400 capitalize">{providerType}</p>
                    {provider?.location && (
                      <p className="text-sm text-gray-500">
                        {provider.location.city}, {provider.location.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-accent-400" />
                    <div>
                      <p className="text-gray-100 font-medium">
                        {formatDate(booking.start)}
                      </p>
                      <p className="text-gray-400 text-sm">Session Date</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent-400" />
                    <div>
                      <p className="text-gray-100 font-medium">
                        {formatTime(booking.start)} - {formatTime(booking.end)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {booking.service?.durationMins || booking.durationMins}{" "}
                        minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-accent-400" />
                    <div>
                      <p className="text-gray-100 font-medium">
                        {booking.service?.name || "Recording Session"}
                      </p>
                      <p className="text-gray-400 text-sm">Service Type</p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                      <p className="text-gray-300 text-sm">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Payment Security Info */}
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-100">
                    Secure Payment
                  </h3>
                </div>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>
                      Powered by PayHere - Sri Lanka's #1 payment gateway
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Payment Panel */}
            <div>
              <Card className="sticky top-8">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  Payment Details
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session Fee</span>
                    <span className="text-gray-100">
                      {booking.currency?.toUpperCase() || "LKR"} {booking.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Fee</span>
                    <span className="text-gray-100">Free</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-100">Total</span>
                    <span className="text-accent-400">
                      {booking.currency?.toUpperCase() || "LKR"} {booking.price}
                    </span>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handlePayNow}
                  disabled={isSubmitting || !checkoutData}
                  className="w-full mb-4"
                  size="lg"
                  icon={
                    isSubmitting ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )
                  }
                >
                  {isSubmitting ? "Redirecting..." : "Pay with PayHere"}
                </Button>

                {/* Retry Button */}
                {onRetry && (
                  <Button
                    variant="outline"
                    onClick={onRetry}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Retry Payment Setup
                  </Button>
                )}

                {/* Payment Methods */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    Accepted payment methods:
                  </p>
                  <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                    <span>💳 Visa</span>
                    <span>💳 Mastercard</span>
                    <span>💳 AMEX</span>
                    <span>🏦 Bank Transfer</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PayHereGateway;
