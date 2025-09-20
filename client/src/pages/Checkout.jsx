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

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [createCheckoutSession, { isLoading }] =
    useCreateCheckoutSessionMutation();

  const [booking, setBooking] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    const bookingData = location.state?.booking;

    if (!bookingData) {
      toast.error("No booking data found");
      navigate("/search");
      return;
    }

    if (!user) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }

    setBooking(bookingData);
  }, [location.state, user, navigate]);

  useEffect(() => {
    if (booking && !checkoutUrl) {
      initiatePayment();
    }
  }, [booking]);

  const initiatePayment = async () => {
    try {
      const response = await createCheckoutSession(booking._id).unwrap();

      setCheckoutUrl(response.url);
      setCheckoutData(response.checkoutData);

      // Auto-submit to PayHere after a short delay
      setTimeout(() => {
        if (response.url && response.checkoutData) {
          submitToPayHere(response.url, response.checkoutData);
        }
      }, 1000);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error(error.data?.message || "Failed to initiate payment");
      navigate("/search");
    }
  };

  const submitToPayHere = (url, data) => {
    try {
      // Create a form dynamically and submit to PayHere
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      form.style.display = "none";

      // Add all checkout data as hidden form fields
      Object.keys(data).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("PayHere submission error:", error);
      toast.error("Failed to redirect to payment gateway");
      navigate("/search");
    }
  };

  const handleRetry = () => {
    setCheckoutUrl(null);
    setCheckoutData(null);
    initiatePayment();
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Payment
              </h1>
              <p className="text-gray-600">
                You will be redirected to PayHere to complete your payment
                securely
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                Booking Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{booking.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {booking.service?.durationMins} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(booking.start).toLocaleDateString()} at{" "}
                    {new Date(booking.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>LKR {booking.price?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
                <span className="ml-3 text-gray-600">Preparing payment...</span>
              </div>
            ) : checkoutUrl && checkoutData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" />
                  <span className="ml-3 text-gray-600">
                    Redirecting to PayHere...
                  </span>
                </div>
                <Button
                  onClick={() => submitToPayHere(checkoutUrl, checkoutData)}
                  className="w-full"
                >
                  Continue to PayHere
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-600 text-sm">
                  Failed to load payment gateway
                </p>
                <Button onClick={handleRetry} className="w-full">
                  Retry Payment
                </Button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500">
                Secure payment powered by PayHere
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
