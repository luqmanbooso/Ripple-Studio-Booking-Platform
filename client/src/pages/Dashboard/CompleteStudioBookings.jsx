import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetMyBookingsQuery,
  useCompleteBookingMutation,
  useCancelBookingMutation,
} from "../../store/bookingApi";
import { useGetStudioQuery } from "../../store/studioApi";
import { useGetWalletQuery } from "../../store/walletApi";

const CompleteStudioBookings = () => {
  const { user } = useSelector((state) => state.auth);
  const studioId = user?.studio?._id || user?.studio;

  const { data: studioData } = useGetStudioQuery(studioId, { skip: !studioId });
  const studio = studioData?.data?.studio;
  const { data: walletData } = useGetWalletQuery();
  const wallet = walletData?.data?.wallet;

  const [viewMode, setViewMode] = useState("list"); // list, calendar, timeline
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const {
    data: bookingsData,
    isLoading,
    refetch,
  } = useGetMyBookingsQuery({
    page: 1,
    limit: 50,
    status: filterStatus !== "all" ? filterStatus : undefined,
  });
  const [completeBooking, { isLoading: isCompleting }] =
    useCompleteBookingMutation();
  const [cancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation();

  const bookings = bookingsData?.data?.bookings || [];

  const statusColors = {
    reservation_pending: "bg-orange-100 text-orange-800 border-orange-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    payment_pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      if (newStatus === "completed") {
        await completeBooking({ id: bookingId, notes: "" }).unwrap();
        toast.success("Booking completed!");
      } else if (newStatus === "cancelled") {
        await cancelBooking({
          id: bookingId,
          reason: "Cancelled by studio",
        }).unwrap();
        toast.success("Booking cancelled!");
      } else {
        toast.error("Unsupported status update");
        return;
      }
      refetch();
    } catch (error) {
      console.error("Booking update error:", error);
      const errorMessage =
        error.data?.message ||
        error.message ||
        "Failed to update booking status";
      toast.error(errorMessage);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getUpcomingBookings = () => {
    const now = new Date();
    return filteredBookings.filter((booking) => new Date(booking.start) > now);
  };

  const getTodayBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return filteredBookings.filter((booking) => {
      const bookingDate = new Date(booking.start);
      return bookingDate >= today && bookingDate < tomorrow;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Studio Info Card */}
      {studio && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {studio.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {studio.name}
              </h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                {studio.location && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {typeof studio.location === "object"
                        ? `${studio.location.city || ""}, ${studio.location.country || ""}`
                            .trim()
                            .replace(/^,\s*/, "")
                        : studio.location}
                    </span>
                  </div>
                )}
                {studio.phone && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{studio.phone}</span>
                  </div>
                )}
                {studio.email && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{studio.email}</span>
                  </div>
                )}
                {studio.hourlyRate && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>LKR {studio.hourlyRate.toLocaleString()}/hour</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your studio bookings and schedule
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {["list", "calendar", "timeline"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                  viewMode === mode
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bookings.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Today's Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTodayBookings().length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upcoming
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getUpcomingBookings().length}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                LKR{" "}
                {(wallet?.balance?.available || 0).toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total Earnings: LKR{" "}
                {(wallet?.totalEarnings || 0).toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="reservation_pending">Reservation Pending</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Enhanced Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Header with Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      booking.status === "confirmed"
                        ? "bg-green-100 dark:bg-green-900"
                        : booking.status === "reservation_pending"
                          ? "bg-orange-100 dark:bg-orange-900"
                          : booking.status === "payment_pending"
                            ? "bg-yellow-100 dark:bg-yellow-900"
                            : booking.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900"
                              : booking.status === "completed"
                                ? "bg-blue-100 dark:bg-blue-900"
                                : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    <User
                      className={`w-6 h-6 ${
                        booking.status === "confirmed"
                          ? "text-green-600 dark:text-green-400"
                          : booking.status === "reservation_pending"
                            ? "text-orange-600 dark:text-orange-400"
                            : booking.status === "payment_pending"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : booking.status === "pending"
                                ? "text-yellow-600 dark:text-yellow-400"
                                : booking.status === "completed"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {booking.client?.name || "Unknown Client"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusColors[booking.status]}`}
                    >
                      {booking.status === "reservation_pending"
                        ? "PAYMENT PENDING"
                        : booking.status === "payment_pending"
                          ? "PAYMENT PENDING"
                          : booking.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetails(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* Service Info */}
              {booking.service && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                      {booking.service.name}
                    </span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    {booking.service.description ||
                      "Professional studio service"}
                  </p>
                </div>
              )}

              {/* Date & Time */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">
                    {new Date(booking.start).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">
                    {new Date(booking.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -
                    {new Date(booking.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    ${booking.price}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                {booking.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleStatusUpdate(booking._id, "confirmed")
                      }
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(booking._id, "cancelled")
                      }
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleStatusUpdate(booking._id, "completed")
                      }
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(booking._id, "cancelled")
                      }
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}

                {booking.status === "completed" && (
                  <div className="text-center py-2">
                    <span className="inline-flex items-center space-x-2 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Session Completed</span>
                    </span>
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="text-center py-2">
                    <span className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400 font-medium">
                      <XCircle className="w-4 h-4" />
                      <span>Booking Cancelled</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              {booking.client && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{booking.client.email}</span>
                    </div>
                    {booking.client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{booking.client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your filters"
              : "Your bookings will appear here once clients start booking your studio"}
          </p>
        </div>
      )}

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showDetails && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Booking Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Client Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Client Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 dark:text-white">
                        {selectedBooking.client?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedBooking.client?.email}
                      </span>
                    </div>
                    {selectedBooking.client?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedBooking.client.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Session Details
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedBooking.start).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedBooking.start).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}{" "}
                          -
                          {new Date(selectedBooking.end).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedBooking.service?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${selectedBooking.price}
                        </p>
                      </div>
                    </div>

                    {selectedBooking.notes && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                        <p className="text-gray-900 dark:text-white">
                          {selectedBooking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                {selectedBooking.status === "pending" && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedBooking._id, "confirmed");
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedBooking._id, "cancelled");
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompleteStudioBookings;
