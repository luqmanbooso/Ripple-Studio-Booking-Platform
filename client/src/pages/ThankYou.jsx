import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  Home,
  Mail,
  AlertCircle,
  Loader,
} from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { formatCurrency } from "../utils/currency";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("loading");
  const [bookingDetails, setBookingDetails] = useState(null);

  // PayHere return parameters
  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");
  const payhereAmount = searchParams.get("payhere_amount");
  const payhereCurrency = searchParams.get("payhere_currency");
  const statusCode = searchParams.get("status_code");

  // Stripe session ID (for backward compatibility)
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (orderId && paymentId) {
          // PayHere payment verification
          const response = await fetch(`/api/payments/verify-payhere`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order_id: orderId,
              payment_id: paymentId,
              status_code: statusCode,
            }),
          });

          const data = await response.json();

          if (data.success) {
            setVerificationStatus("success");
            setBookingDetails(data.booking);
          } else {
            setVerificationStatus("failed");
          }
        } else if (sessionId) {
          // Stripe session verification (existing functionality)
          setVerificationStatus("success");
        } else {
          setVerificationStatus("failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerificationStatus("failed");
      }
    };

    verifyPayment();
  }, [orderId, paymentId, sessionId, statusCode]);

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying your payment...</p>
        </motion.div>
      </div>
    );
  }

  if (verificationStatus === "failed") {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full mx-4"
        >
          <Card className="text-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              We couldn't verify your payment. Please contact support if you've
              been charged.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button>Contact Support</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" icon={<Home className="w-5 h-5" />}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-4"
      >
        <Card className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-100 mb-4"
          >
            Booking Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg mb-4"
          >
            Your payment has been processed successfully and your booking is
            confirmed.
          </motion.p>

          {/* PayHere Payment Details */}
          {(paymentId || payhereAmount) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-dark-800 rounded-lg p-4 mb-6"
            >
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Payment Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="text-gray-100 font-medium">
                    {bookingDetails?.orderId || "Processing..."}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Payment ID</p>
                  <p className="text-gray-100 font-medium">{paymentId}</p>
                </div>
                {payhereAmount && payhereCurrency && (
                  <>
                    <div>
                      <p className="text-gray-500">Amount Paid</p>
                      <p className="text-green-400 font-semibold text-lg">
                        {payhereCurrency}{" "}
                        {parseFloat(payhereAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment Date</p>
                      <p className="text-gray-100 font-medium">
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Booking Details */}
          {bookingDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.47 }}
              className="bg-primary-900/20 rounded-lg p-4 mb-6"
            >
              <h4 className="text-sm font-semibold text-primary-300 mb-3">
                Booking Details
              </h4>
              <div className="space-y-2">
                {bookingDetails.bookingId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Booking ID:</span>
                    <span className="text-gray-100 font-medium">
                      {bookingDetails.bookingId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Session Date:</span>
                  <span className="text-gray-100 font-medium">
                    {new Date(bookingDetails.start).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-gray-100 font-medium">
                    {new Date(bookingDetails.start).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}{" "}
                    -{" "}
                    {new Date(bookingDetails.end).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-primary-800/30">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-primary-300 font-semibold">
                    {formatCurrency(bookingDetails.price)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-700 rounded-lg p-6 mb-8"
          >
            <h3 className="font-semibold text-gray-100 mb-4">
              What happens next?
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-medium">
                    Confirmation Email
                  </p>
                  <p className="text-gray-400 text-sm">
                    You'll receive a detailed booking confirmation via email
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-accent-400 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-medium">Calendar Invite</p>
                  <p className="text-gray-400 text-sm">
                    Add the session to your calendar with all the details
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-medium">Provider Contact</p>
                  <p className="text-gray-400 text-sm">
                    The provider will reach out to coordinate final details
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/dashboard/bookings">
              <Button icon={<Calendar className="w-5 h-5" />}>
                View My Bookings
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" icon={<Home className="w-5 h-5" />}>
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ThankYou;
