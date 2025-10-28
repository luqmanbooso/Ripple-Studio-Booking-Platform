import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  Download,
  Calendar,
  ArrowRight,
  Home,
} from "lucide-react";
import { useGetBookingPaymentsQuery } from "../store/paymentApi";
import { useGetBookingQuery } from "../store/bookingApi";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  const orderId = searchParams.get("order_id");
  const bookingId = searchParams.get("booking_id");
  const paymentId = searchParams.get("payment_id");

  // Fetch booking details
  const {
    data: bookingData,
    isLoading: bookingLoading,
    refetch: refetchBooking,
  } = useGetBookingQuery(bookingId, {
    skip: !bookingId,
  });

  // Fetch payment details
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useGetBookingPaymentsQuery(bookingId, {
    skip: !bookingId,
  });

  const booking = bookingData?.data;
  const payments = paymentsData?.data?.payments || [];
  const completedPayment =
    payments.find((p) => p.status === "Completed") ||
    payments.find((p) => p.payhereOrderId === orderId);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const verifyPayment = async () => {
      if (
        orderId &&
        bookingId &&
        !completedPayment &&
        retryCount < maxRetries
      ) {
        retryCount++;
        console.log(`Payment verification attempt ${retryCount}/${maxRetries}`);

        // Refetch data to check for updated payment status
        await Promise.all([refetchBooking(), refetchPayments()]);

        // If still no payment found, retry after delay
        if (!completedPayment && retryCount < maxRetries) {
          setTimeout(verifyPayment, 2000);
        } else {
          setIsVerifying(false);
          if (completedPayment) {
            toast.success("Payment verified successfully!");
          }
        }
      } else {
        setIsVerifying(false);
        if (completedPayment) {
          toast.success("Payment verified successfully!");
        }
      }
    };

    const timer = setTimeout(verifyPayment, 1000);
    return () => clearTimeout(timer);
  }, [orderId, bookingId, completedPayment, refetchBooking, refetchPayments]);

  const generateCalendarLink = () => {
    if (!booking || !booking.start || !booking.end) return "";

    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "";
    }

    const formatDate = (date) => {
      try {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      } catch (error) {
        console.error("Date formatting error:", error);
        return "";
      }
    };

    const title = encodeURIComponent(
      `Studio Booking - ${booking.studio?.name || "Studio"}`
    );
    const details = encodeURIComponent(
      `Booking at ${booking.studio?.name || "Studio"}\n` +
        `Service: ${booking.service?.name || "Studio Session"}\n` +
        `Duration: ${Math.round((endDate - startDate) / (1000 * 60))} minutes\n` +
        `Payment ID: ${completedPayment?.payherePaymentId || "N/A"}`
    );

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    if (!formattedStartDate || !formattedEndDate) {
      return "";
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedStartDate}/${formattedEndDate}&details=${details}`;

    return googleCalendarUrl;
  };

  const downloadReceipt = () => {
    if (!completedPayment || !booking) return;

    const receiptData = {
      orderId: completedPayment.payhereOrderId,
      paymentId: completedPayment.payherePaymentId,
      amount: completedPayment.amount,
      currency: completedPayment.currency,
      date: completedPayment.completedAt || completedPayment.createdAt,
      service: booking.service?.name || "Studio Session",
      studio: booking.studio?.name || "Studio",
      duration:
        booking.start && booking.end
          ? (() => {
              try {
                const startDate = new Date(booking.start);
                const endDate = new Date(booking.end);
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                  return "Not available";
                }
                return `${format(startDate, "PPp")} - ${format(endDate, "p")}`;
              } catch (error) {
                console.error("Date formatting error in receipt:", error);
                return "Not available";
              }
            })()
          : "Not available",
    };

    const receiptContent = `
RIPPLE MUSIC BOOKING PLATFORM
=============================

PAYMENT RECEIPT
---------------

Order ID: ${receiptData.orderId}
Payment ID: ${receiptData.paymentId}
Date: ${format(new Date(receiptData.date), "PPP p")}

SERVICE DETAILS
---------------
Studio: ${receiptData.studio}
Service: ${receiptData.service}
Session Time: ${receiptData.duration}

PAYMENT DETAILS
---------------
Amount: ${receiptData.currency} ${receiptData.amount.toLocaleString()}
Status: COMPLETED
Payment Method: Card

Thank you for booking with Ripple!
Visit: https://ripple.lk
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receiptData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Receipt downloaded!");
  };

  if (bookingLoading || paymentsLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isVerifying ? "Verifying Payment..." : "Loading..."}
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (!booking || !completedPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Payment Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your payment details. Please check your email for
            confirmation or contact support.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Your booking has been confirmed
            </p>
          </div>

          {/* Payment Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Order ID
                </label>
                <p className="text-gray-800 font-mono">
                  {completedPayment.payhereOrderId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment ID
                </label>
                <p className="text-gray-800 font-mono">
                  {completedPayment.payherePaymentId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Amount Paid
                </label>
                <p className="text-2xl font-bold text-green-600">
                  {completedPayment.currency}{" "}
                  {completedPayment.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment Date
                </label>
                <p className="text-gray-800">
                  {format(
                    new Date(
                      completedPayment.completedAt || completedPayment.createdAt
                    ),
                    "PPP p"
                  )}
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Booking Details
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Studio:</span>
                  <span className="font-medium text-gray-800">
                    {booking.studio?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-800">
                    {booking.service?.name || "Studio Session"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium text-gray-800">
                    {booking.start
                      ? format(new Date(booking.start), "PPP")
                      : "Not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-800">
                    {booking.start && booking.end
                      ? `${format(new Date(booking.start), "p")} - ${format(new Date(booking.end), "p")}`
                      : "Not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={downloadReceipt}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            <a
              href={generateCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Add to Calendar
            </a>

            <Link
              to="/dashboard/bookings"
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Booking
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              What's Next?
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  The studio will contact you if any additional information is
                  needed
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  You can view and manage your booking from your dashboard
                </span>
              </li>
            </ul>
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

export default PaymentSuccess;
