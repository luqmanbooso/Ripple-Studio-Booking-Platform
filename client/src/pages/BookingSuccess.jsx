import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  Clock,
  Building,
  User,
  DollarSign,
  ArrowRight,
  Home,
  Eye,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import {
  useGetBookingQuery,
  useConfirmBookingMutation,
} from "../store/bookingApi";
import { useSelector } from "react-redux";
import { validatePayHereResponse } from "../utils/payhereTest";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector((state) => state.auth);
  const [bookingId, setBookingId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("verifying");
  const [pollCount, setPollCount] = useState(0);
  const [maxPolls] = useState(30); // Stop polling after 30 attempts (1 minute)

  const [confirmBooking, { isLoading: confirmLoading }] =
    useConfirmBookingMutation();

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast.error("Please login to view booking status");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [user, navigate]);

  const {
    data: bookingData,
    isLoading,
    error,
    refetch,
  } = useGetBookingQuery(bookingId, {
    skip:
      !bookingId || !user || !["pending", "success"].includes(paymentStatus),
    pollingInterval:
      paymentStatus === "pending" && pollCount < maxPolls && user ? 2000 : 0, // Poll every 2 seconds if pending
  });

  const booking = bookingData?.data?.booking;

  // Debug: Log booking data to check structure
  useEffect(() => {
    if (booking) {
      console.log("=== BOOKING DATA DEBUG ===");
      console.log("Full booking object:", booking);
      console.log("booking.start:", booking.start);
      console.log("booking.end:", booking.end);
      console.log("booking.price:", booking.price);
      console.log("booking.service:", booking.service);
      console.log("booking.studio:", booking.studio);
      console.log("========================");
    }
  }, [booking]);

  // Auto-confirmation function (defined after refetch is available)
  const triggerWebhookConfirmation = async (bookingId) => {
    try {
      // Check if user is authenticated before making request
      if (!user || !token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `/api/bookings/${bookingId}/confirm-payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm payment");
      }

      // Set success status and refetch booking data
      setPaymentStatus("success");
      toast.success("🎉 Payment confirmed! Your booking is ready.");

      // Refetch booking data to get updated status
      setTimeout(async () => {
        try {
          await refetch();
        } catch (error) {
          console.error("Refetch error:", error);
        }
      }, 500);
    } catch (error) {
      console.error("Auto-confirmation error:", error);
      // Fall back to pending status for manual confirmation
      setPaymentStatus("pending");
      toast.error("Auto-confirmation failed. You can confirm manually below.");
    }
  };

  // Extract booking ID from PayHere response and auto-trigger webhook
  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const paymentId = searchParams.get("payment_id");
    const statusCode = searchParams.get("status_code");

    if (orderId) {
      const parts = orderId.split("_");
      if (parts.length >= 2 && parts[0] === "booking") {
        const extractedBookingId = parts[1];
        setBookingId(extractedBookingId);

        // Check payment status from PayHere
        if (statusCode === "2") {
          // PayHere confirmed success - trigger webhook immediately
          setPaymentStatus("processing");
          toast.loading("Confirming your booking...");
          triggerWebhookConfirmation(extractedBookingId);
        } else if (statusCode === "0") {
          setPaymentStatus("pending");
          toast.loading("Verifying payment status...");
        } else if (statusCode && statusCode !== "2") {
          setPaymentStatus("failed");
          toast.error("Payment failed. Please try again.");
        } else {
          // No status code provided - common in sandbox
          // Assume payment was successful if user returned to success page
          setPaymentStatus("processing");
          toast.loading("Confirming your booking...");
          // Auto-trigger webhook after 2 seconds to allow page to load and ensure auth is ready
          setTimeout(() => {
            if (user && token) {
              triggerWebhookConfirmation(extractedBookingId);
            } else {
              console.log(
                "User or token not available, falling back to pending status"
              );
              setPaymentStatus("pending");
              toast.error(
                "Authentication required. Please confirm manually below."
              );
            }
          }, 2000);
        }
      } else {
        setPaymentStatus("failed");
        toast.error("Invalid payment response. Please contact support.");
      }
    } else {
      setPaymentStatus("failed");
      toast.error("No payment information found. Please contact support.");
    }
  }, [searchParams, user, token]);

  const formatDate = (date) => {
    if (!date) return "Not available";
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date));
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Not available";
    }
  };

  const formatTime = (date) => {
    if (!date) return "Not available";
    try {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date));
    } catch (error) {
      console.error("Time formatting error:", error);
      return "Not available";
    }
  };

  // Update payment status based on booking status
  useEffect(() => {
    if (booking) {
      if (booking.status === "confirmed") {
        setPaymentStatus("success");
        toast.success("Payment confirmed! Your booking is ready.");
      } else if (booking.status === "reservation_pending") {
        setPaymentStatus("pending");
        setPollCount((prev) => prev + 1);
      } else if (booking.status === "cancelled") {
        setPaymentStatus("failed");
      }
    } else if (error && error.status === 401) {
      // Handle authentication error
      setPaymentStatus("failed");
      toast.error("Authentication expired. Please login again.");
      setTimeout(() => navigate("/login"), 2000);
    } else if (error) {
      console.error("Booking fetch error:", error);
      setPollCount((prev) => prev + 1);
    }
  }, [booking, error, navigate]);

  // Handle polling timeout
  useEffect(() => {
    if (pollCount >= maxPolls && paymentStatus === "pending") {
      setPaymentStatus("failed");
      toast.error(
        "Payment verification timed out. Please check your dashboard or contact support."
      );
    }
  }, [pollCount, maxPolls, paymentStatus]);

  // Polling counter effect
  useEffect(() => {
    let interval;
    if (paymentStatus === "pending" && pollCount < maxPolls) {
      interval = setInterval(() => {
        setPollCount((prev) => prev + 1);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentStatus, pollCount, maxPolls]);

  // Manual confirmation handler for studios and clients
  const handleManualConfirm = async () => {
    try {
      // Use different endpoint based on user role
      if (isStudioOwner) {
        await confirmBooking(bookingId).unwrap();
        toast.success("Booking confirmed by studio!");
      } else {
        // Use client payment confirmation endpoint
        const response = await fetch(
          `/api/bookings/${bookingId}/confirm-payment`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to confirm payment");
        }

        toast.success("Payment confirmed!");
      }

      setPaymentStatus("success");
      // Refresh booking data
      await refetch();
    } catch (error) {
      console.error("Confirmation error:", error);
      toast.error(error.message || "Failed to confirm booking");
    }
  };

  // Check if current user is the studio owner of this booking
  const isStudioOwner =
    booking &&
    user &&
    user.role === "studio" &&
    booking.studio?.user?._id === user._id;

  if (
    isLoading ||
    paymentStatus === "verifying" ||
    paymentStatus === "processing"
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-400">
            {paymentStatus === "processing"
              ? "Confirming your booking..."
              : "Verifying your payment..."}
          </p>
        </motion.div>
      </div>
    );
  }

  // Handle 401 Authentication Error
  if (error && error.status === 401) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <div className="container max-w-md mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="p-8 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-orange-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">
                Authentication Required
              </h1>

              <p className="text-gray-400 mb-6">
                Your session has expired. Please login again to view your
                booking status.
              </p>

              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Login Again
                  </Button>
                </Link>

                <Link to="/">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    icon={<Home className="w-4 h-4" />}
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <div className="container max-w-md mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="p-8 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">
                Payment Verification Failed
              </h1>

              <p className="text-gray-400 mb-6">
                We couldn't verify your payment. Please contact support if
                you've been charged.
              </p>

              <div className="space-y-3">
                <Link to="/contact">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Contact Support
                  </Button>
                </Link>

                <Link to="/">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    icon={<Home className="w-4 h-4" />}
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <div className="container max-w-md mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="p-8 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">
                Payment Processing
              </h1>

              <p className="text-gray-400 mb-6">
                Your payment is being processed. This usually takes a few
                moments.
                {pollCount > 0 && (
                  <span className="block mt-2 text-sm text-yellow-300">
                    Checking status... ({pollCount}/{maxPolls})
                  </span>
                )}
              </p>

              {isStudioOwner && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <p className="text-blue-300 text-sm">
                    <strong>Studio Owner:</strong> If you've received payment
                    confirmation, you can manually confirm this booking below.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {isStudioOwner && (
                  <Button
                    onClick={handleManualConfirm}
                    loading={confirmLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Confirm Payment Received
                  </Button>
                )}

                {/* Show force confirm after 10 polling attempts */}
                {pollCount >= 10 && !isStudioOwner && (
                  <Button
                    onClick={handleManualConfirm}
                    loading={confirmLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Confirm Payment Received
                  </Button>
                )}

                <Button
                  onClick={async () => {
                    try {
                      await refetch();
                      toast.success("Status refreshed!");
                    } catch (error) {
                      console.error("Refetch error:", error);
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  Check Status
                </Button>

                {/* Debug buttons for development */}
                {process.env.NODE_ENV === "development" && (
                  <>
                    <Button
                      onClick={() => {
                        console.log("=== BOOKING DEBUG INFO ===");
                        console.log("Booking ID:", bookingId);
                        console.log("Current booking status:", booking?.status);
                        console.log("Current payment status:", paymentStatus);
                        console.log("Poll count:", pollCount, "/", maxPolls);
                        console.log("API Error:", error);
                        console.log("Booking data:", booking);
                        console.log("User:", user);
                        console.log("Is Studio Owner:", isStudioOwner);
                        console.log("========================");

                        // Also display in UI
                        toast.success(
                          `Debug: Status=${paymentStatus}, Polls=${pollCount}/${maxPolls}, Error=${error?.status || "none"}`
                        );
                      }}
                      variant="outline"
                      className="w-full border-purple-600 text-purple-300 hover:bg-purple-700"
                    >
                      Debug Info
                    </Button>

                    {bookingId && (
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              "/api/webhooks/test-webhook",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ bookingId }),
                              }
                            );
                            const result = await response.json();
                            console.log("Test webhook result:", result);
                            if (response.ok) {
                              toast.success(
                                "Test webhook triggered successfully!"
                              );
                              // Refresh booking data
                              window.location.reload();
                            } else {
                              toast.error(
                                result.error || "Test webhook failed"
                              );
                            }
                          } catch (error) {
                            console.error("Test webhook error:", error);
                            toast.error("Failed to trigger test webhook");
                          }
                        }}
                        variant="outline"
                        className="w-full border-blue-600 text-blue-300 hover:bg-blue-700"
                      >
                        Trigger Test Webhook
                      </Button>
                    )}
                  </>
                )}

                <Link to="/dashboard/bookings">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Go to My Bookings
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-400">
              Your payment was successful and your studio session is confirmed.
            </p>
          </div>

          {booking && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Details */}
              <div className="lg:col-span-2">
                <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Booking Details
                  </h2>

                  {/* Studio Info */}
                  <div className="flex items-start gap-4 mb-6 p-4 bg-gray-700/50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">
                        {booking.studio?.name}
                      </h3>
                      <p className="text-gray-400">Recording Studio</p>
                      {booking.studio?.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.studio.location.city},{" "}
                          {booking.studio.location.country}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">
                            {booking?.start
                              ? formatDate(booking.start)
                              : "Not available"}
                          </p>
                          <p className="text-gray-400 text-sm">Session Date</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">
                            {booking?.start && booking?.end
                              ? `${formatTime(booking.start)} - ${formatTime(booking.end)}`
                              : "Not available"}
                          </p>
                          <p className="text-gray-400 text-sm">Session Time</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">
                            {booking?.service?.name || "Recording Session"}
                          </p>
                          <p className="text-gray-400 text-sm">Service Type</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">
                            {booking?.currency?.toUpperCase() || "LKR"}{" "}
                            {booking?.price?.toLocaleString() || "0"}
                          </p>
                          <p className="text-gray-400 text-sm">Total Paid</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Notes</h4>
                      <p className="text-gray-300 text-sm">{booking.notes}</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    What's Next?
                  </h3>

                  <div className="space-y-3">
                    <Link to="/dashboard/bookings">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View My Bookings
                      </Button>
                    </Link>

                    <Link to="/search?type=studios">
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Book Another Studio
                      </Button>
                    </Link>

                    <Link to="/">
                      <Button
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <h4 className="text-white font-medium mb-3">Important</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Arrive 10 minutes early for setup</p>
                    <p>• Bring your instruments and materials</p>
                    <p>• Contact the studio for any changes</p>
                    <p>• Check your email for confirmation details</p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingSuccess;
