import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, DollarSign, User, Building } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { useGetStudioQuery } from "../store/studioApi";
import { useCreateBookingMutation } from "../store/bookingApi";
import api from "../lib/axios";

const NewBooking = () => {
  // All hooks must be at the top - before any conditional logic
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [duration, setDuration] = useState(180); // 3 hours default
  const [notes, setNotes] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const studioId = searchParams.get("studioId");
  const serviceParam = searchParams.get("service");

  const { data: studioData, isLoading: studioLoading } = useGetStudioQuery(
    studioId,
    {
      skip: !studioId,
    }
  );

  const [createBooking, { isLoading: bookingLoading }] = useCreateBookingMutation();

  // All useEffect hooks must be here, before any conditional returns
  useEffect(() => {
    const provider = studioData?.data?.studio;
    if (provider?.services && serviceParam) {
      const service = provider.services.find(
        (s) => s.name === serviceParam
      );
      if (service) {
        setSelectedService(service);
        setDuration(service.durationMins);
      }
    }
  }, [studioData, serviceParam]);

  // Fetch booked slots effect
  useEffect(() => {
    const fetchBooked = async () => {
      const provider = studioData?.data?.studio;
      if (!selectedDate || !provider) return;

      const pType = "studio";
      const providerId = provider._id;

      try {
        const res = await api.get("/bookings/by-provider", {
          params: { studioId: providerId, date: selectedDate },
        });
        const slots = res.data.data.bookedSlots || [];
        setBookedSlots(slots);
        // If currently selected time is now overlapping a booked slot, clear it
        if (selectedTime) {
          const startDt = new Date(`${selectedDate}T${selectedTime}`);
          const endDt = new Date(startDt.getTime() + duration * 60000);
          const overlaps = slots.some((s) => {
            const bs = new Date(s.start);
            const be = new Date(s.end);
            return startDt < be && endDt > bs;
          });
          if (overlaps) setSelectedTime("");
        }
      } catch (err) {
        console.error("Error fetching booked slots:", err.response?.data || err.message);
        setBookedSlots([]);
      }
    };

    fetchBooked();
  }, [selectedDate, studioData, duration, selectedTime]);

  // Now we can safely use conditional logic and early returns
  const isLoading = studioLoading;
  const provider = studioData?.data?.studio;
  const providerType = "studio";

  // Debug logs removed to prevent console spam

  const calculatePrice = () => {
    if (selectedService) {
      return selectedService.price;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const bookingData = {
      studioId: provider._id,
      service: {
        name: selectedService?.name || "Session",
        price: parseFloat(calculatePrice()),
        durationMins: duration,
        description: selectedService?.description || "",
      },
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      notes,
    };

    // Creating booking reservation (will be confirmed after payment)

    try {
      const result = await createBooking(bookingData).unwrap();
      // Booking reservation created successfully

      // Ensure we have the required data before navigating
      if (!result?.data?.booking) {
        toast.error("Booking creation failed - no booking data received");
        return;
      }

      toast.success("Reservation created! Complete payment within 15 minutes.");

      // Check if we have checkout data from the booking creation
      const navigationState = {
        booking: result.data.booking,
      };

      // Add checkout data if available
      if (result.data.checkoutUrl) {
        navigationState.checkoutUrl = result.data.checkoutUrl;
      }
      if (result.data.checkoutData) {
        navigationState.checkoutData = result.data.checkoutData;
      }

      // Navigating to payment checkout

      navigate("/booking/checkout", {
        state: navigationState,
      });
    } catch (error) {
      console.error("Booking reservation error:", error?.data?.message || error?.message);
      toast.error(
        error.data?.message || error.response?.data?.message || error.message || "Failed to create booking"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Provider Not Found
          </h2>
          <p className="text-gray-400 mb-4">
            The studio you're trying to book doesn't exist.
          </p>
          <Button onClick={() => navigate("/search")}>Browse Providers</Button>
        </div>
      </div>
    );
  }

  const providerName = provider.user?.name || provider.name;
  
  // Generate time slots from 9 AM to 10 PM (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Enhanced availability checking function
  const getSlotStatus = (time) => {
    if (!selectedDate) return { available: false, reason: 'Select a date first' };
    
    const startDt = new Date(`${selectedDate}T${time}`);
    const endDt = new Date(startDt.getTime() + duration * 60000);
    const now = new Date();

    // Check if slot is in the past
    if (startDt < now) {
      return { available: false, reason: 'Past time', type: 'past' };
    }

    // Check if slot overlaps with booked slots (using real backend data)
    const overlappingBooking = bookedSlots.find((s) => {
      const bs = new Date(s.start);
      const be = new Date(s.end);
      return startDt < be && endDt > bs;
    });

    if (overlappingBooking) {
      return { 
        available: false, 
        reason: 'Booked', 
        type: 'booked',
        booking: overlappingBooking 
      };
    }

    // Check studio availability schedule
    const studioAvailability = provider?.availability || [];
    const dayOfWeek = startDt.getDay();
    
    // Check if studio has any availability defined
    if (studioAvailability.length === 0) {
      // Default availability: 9 AM - 6 PM weekdays only
      const hour = startDt.getHours();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      
      if (!isWeekday) {
        return { available: false, reason: 'Weekends closed', type: 'closed' };
      }
      
      if (hour < 9 || hour >= 18) {
        return { available: false, reason: 'Outside hours (9AM-6PM)', type: 'closed' };
      }
    } else {
      // Check against studio's defined availability
      const isWithinAvailability = studioAvailability.some(slot => {
        if (slot.isRecurring && slot.daysOfWeek?.includes(dayOfWeek)) {
          // Recurring slot - check time range
          const slotStart = new Date(`1970-01-01T${slot.startTime}:00`);
          const slotEnd = new Date(`1970-01-01T${slot.endTime}:00`);
          const requestTime = new Date(`1970-01-01T${time}:00`);
          const requestEndTime = new Date(requestTime.getTime() + duration * 60000);
          
          return requestTime >= slotStart && requestEndTime <= slotEnd;
        } else if (!slot.isRecurring) {
          // One-time slot - check date and time range
          const slotStart = new Date(slot.start);
          const slotEnd = new Date(slot.end);
          
          return startDt >= slotStart && endDt <= slotEnd;
        }
        return false;
      });
      
      if (!isWithinAvailability) {
        return { available: false, reason: 'Outside studio hours', type: 'closed' };
      }
    }

    // Check if it's too late in the day (ends after 11 PM)
    if (endDt.getHours() >= 23) {
      return { available: false, reason: 'Too late', type: 'late' };
    }

    return { available: true, reason: 'Available', type: 'available' };
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Book a Session
            </h1>
            <p className="text-gray-400">
              Schedule your session with {providerName}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Select Date
                  </h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border px-3 py-2 rounded bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border-gray-700 dark:border-dark-700"
                    required
                  />
                </Card>

                {/* Time Selection */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Select Time
                  </h3>
                  {!selectedDate && (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Please select a date first to see available time slots</p>
                    </div>
                  )}
                  
                  {selectedDate && (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-400">
                            Duration: {Math.floor(duration / 60)}h {duration % 60}m
                          </div>
                          <div className="flex items-center space-x-3 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded mr-1"></div>
                              <span className="text-gray-400">Available</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded mr-1"></div>
                              <span className="text-gray-400">Booked</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500/20 border border-blue-500 rounded mr-1"></div>
                              <span className="text-gray-400">Loading</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Availability based on studio schedule and real-time bookings
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                        {timeSlots.map((time) => {
                          const slotStatus = getSlotStatus(time);
                          const isSelected = selectedTime === time;
                          
                          // Get appropriate styling based on slot status
                          const getSlotStyles = () => {
                            if (isSelected) {
                              return "border-primary-500 bg-primary-500/20 text-primary-300 ring-2 ring-primary-500/50";
                            }
                            
                            switch (slotStatus.type) {
                              case 'available':
                                return "border-green-500/50 bg-green-500/10 text-green-300 hover:border-green-400 hover:bg-green-500/20";
                              case 'booked':
                                return "border-red-500/50 bg-red-500/10 text-red-400 cursor-not-allowed";
                              case 'past':
                                return "border-gray-600 bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50";
                              case 'late':
                                return "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 cursor-not-allowed";
                              case 'closed':
                                return "border-orange-500/50 bg-orange-500/10 text-orange-400 cursor-not-allowed";
                              case 'loading':
                                return "border-blue-500/50 bg-blue-500/10 text-blue-300 cursor-wait animate-pulse";
                              default:
                                return "border-gray-600 bg-gray-700/50 text-gray-400 cursor-not-allowed";
                            }
                          };

                          const getStatusIcon = () => {
                            switch (slotStatus.type) {
                              case 'available':
                                return <span className="text-green-400 text-xs">✓</span>;
                              case 'booked':
                                return <span className="text-red-400 text-xs">✗</span>;
                              case 'past':
                                return <span className="text-gray-500 text-xs">⏰</span>;
                              case 'late':
                                return <span className="text-yellow-400 text-xs">🌙</span>;
                              case 'closed':
                                return <span className="text-orange-400 text-xs">🔒</span>;
                              case 'loading':
                                return <span className="text-blue-400 text-xs animate-pulse">⏳</span>;
                              default:
                                return null;
                            }
                          };

                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => slotStatus.available && setSelectedTime(time)}
                              disabled={!slotStatus.available}
                              className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center min-h-[60px] ${getSlotStyles()}`}
                              title={slotStatus.reason}
                            >
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">{time}</span>
                                {getStatusIcon()}
                              </div>
                              <span className="text-xs opacity-75 mt-1">
                                {slotStatus.reason}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {timeSlots.filter(time => getSlotStatus(time).available).length === 0 && (
                        <div className="text-center py-6 text-gray-400">
                          <p className="mb-2">No available time slots for this date</p>
                          <p className="text-sm">Try selecting a different date or shorter duration</p>
                        </div>
                      )}
                    </>
                  )}
                </Card>

                {/* Service Selection (Studios only) */}
                {providerType === "studio" && provider.services && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">
                      Select Service
                    </h3>
                    <div className="space-y-3">
                      {provider.services.map((service) => (
                        <div
                          key={service.name}
                          onClick={() => {
                            setSelectedService(service);
                            setDuration(service.durationMins);
                          }}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedService?.name === service.name
                              ? "border-accent-500 bg-accent-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-100">
                                {service.name}
                              </h4>
                              {service.description && (
                                <p className="text-sm text-gray-400 mt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-accent-400">
                                ${service.price}
                              </div>
                              <div className="text-sm text-gray-400">
                                {service.durationMins} mins
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Duration - Not needed for studios with fixed services */}
                {false && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">
                      Duration
                    </h3>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full border px-3 py-2 rounded bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border-gray-700 dark:border-dark-700"
                    >
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                      <option value={240}>4 hours</option>
                      <option value={480}>8 hours (Full day)</option>
                    </select>
                  </Card>
                )}

                {/* Notes */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">
                    Additional Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or notes for the session..."
                    rows={4}
                    className="w-full border px-3 py-2 rounded bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border-gray-700 dark:border-dark-700 resize-none"
                  />
                </Card>

                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-blue-300 text-sm">
                      <div className="font-medium mb-1 flex items-center">
                        <span className="text-blue-400 mr-2">ℹ️</span>
                        Reservation System
                      </div>
                      <p className="text-xs">
                        Your time slot will be reserved for 15 minutes to complete payment.
                        After payment, your booking will be confirmed.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    loading={bookingLoading}
                    className="w-full"
                    size="lg"
                  >
                    Reserve Slot & Pay
                  </Button>
                </div>
              </form>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  Booking Summary
                </h3>

                {/* Provider Info */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-100">
                      {providerName}
                    </h4>
                    <p className="text-sm text-gray-400 capitalize">
                      {providerType}
                    </p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6">
                  {selectedDate && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Date</span>
                        <span className="text-gray-100 font-medium">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedTime && selectedDate && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Session Time</span>
                        <div className="text-right">
                          <div className="text-gray-100 font-medium">
                            {selectedTime} - {(() => {
                              const start = new Date(`${selectedDate}T${selectedTime}`);
                              const end = new Date(start.getTime() + duration * 60000);
                              return end.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              });
                            })()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {Math.floor(duration / 60)}h {duration % 60}m session
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedService && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-400 text-sm">Service</span>
                        <div className="text-right">
                          <div className="text-gray-100 font-medium">
                            {selectedService.name}
                          </div>
                          {selectedService.description && (
                            <div className="text-xs text-gray-400 mt-1 max-w-32">
                              {selectedService.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Availability Status */}
                  {selectedDate && selectedTime && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-green-400 text-sm">✓</span>
                        <span className="text-green-300 text-sm font-medium">
                          Time slot available
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Authentication Warning */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="text-red-300 text-sm">
                      <div className="font-medium mb-2 flex items-center">
                        <span className="text-red-400 mr-2">⚠️</span>
                        Authentication Required
                      </div>
                      <p className="text-xs">
                        You need to be logged in to make bookings. Please sign in to continue.
                      </p>
                    </div>
                  </div>

                  {/* Booking Requirements */}
                  {(!selectedDate || !selectedTime || !selectedService) && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="text-yellow-300 text-sm">
                        <div className="font-medium mb-2">Required to continue:</div>
                        <ul className="space-y-1 text-xs">
                          {!selectedDate && <li>• Select a date</li>}
                          {!selectedTime && <li>• Choose a time slot</li>}
                          {!selectedService && <li>• Pick a service</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-100">
                      Total
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-400">
                        ${calculatePrice()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provider Rating */}
                {provider.ratingAvg && (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.ratingAvg)
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }`}
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {provider.ratingAvg.toFixed(1)} ({provider.ratingCount}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewBooking;
