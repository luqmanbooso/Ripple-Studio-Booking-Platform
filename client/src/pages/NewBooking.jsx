import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, DollarSign, User, Building, Wrench } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ServiceSelector from "../components/booking/ServiceSelector";
import EquipmentSelector from "../components/booking/EquipmentSelector";
import StudioShowcase from "../components/booking/StudioShowcase";
import { useGetStudioQuery } from "../store/studioApi";
import { useCreateBookingMutation } from "../store/bookingApi";
import { formatCurrency } from "../utils/currency";
import api from "../lib/axios";

const NewBooking = () => {
  // All hooks must be at the top - before any conditional logic
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]); // Multiple time slots
  const [selectedService, setSelectedService] = useState(null); // Legacy single service
  const [selectedServices, setSelectedServices] = useState([]); // PRD: Multiple services
  const [selectedEquipment, setSelectedEquipment] = useState([]); // PRD: Equipment rental
  const [slotDuration, setSlotDuration] = useState(60); // 1 hour per slot
  const maxBookingHours = 5; // Maximum 5 hours per booking
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
        // Keep slot duration as 60 minutes (1 hour per slot)
        // setSlotDuration(service.durationMins || 60);
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
        
        // PRD: Hide cancel_pending slots from client view
        const visibleSlots = slots.filter(slot => slot.status !== 'cancel_pending');
        setBookedSlots(visibleSlots);
        // If currently selected times are now overlapping confirmed bookings, clear them
        if (selectedTimes.length > 0) {
          const conflictingTimes = selectedTimes.filter(time => {
            const startDt = new Date(`${selectedDate}T${time}:00`);
            const endDt = new Date(startDt.getTime() + 60 * 60000); // 1 hour per slot
            return slots.some((s) => {
              // Only consider confirmed bookings as conflicts
              if (!['confirmed', 'completed', 'active'].includes(s.status)) {
                return false;
              }
              const bs = new Date(s.start);
              const be = new Date(s.end);
              return startDt < be && endDt > bs;
            });
          });
          if (conflictingTimes.length > 0) {
            setSelectedTimes(prev => prev.filter(time => !conflictingTimes.includes(time)));
          }
        }
      } catch (err) {
        console.error("Error fetching booked slots:", err.response?.data || err.message);
        setBookedSlots([]);
      }
    };

    fetchBooked();
  }, [selectedDate, studioData, selectedTimes]);

  // Now we can safely use conditional logic and early returns
  const isLoading = studioLoading;
  const provider = studioData?.data?.studio;
  const providerType = "studio";

  // Debug logs removed to prevent console spam

  const calculatePrice = () => {
    let total = 0;
    
    // Legacy single service support
    if (selectedService && selectedServices.length === 0) {
      total += selectedService.price;
    }
    
    // PRD: Multiple services support
    if (selectedServices.length > 0) {
      total += selectedServices.reduce((sum, service) => sum + service.price, 0);
    }
    
    return total;
  };

  const calculateEquipmentCost = () => {
    return selectedEquipment.reduce((sum, item) => sum + item.rentalPrice, 0);
  };

  const calculateTotalCost = () => {
    const serviceCost = calculatePrice() * selectedTimes.length;
    const equipmentCost = calculateEquipmentCost();
    return serviceCost + equipmentCost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || selectedTimes.length === 0) {
      toast.error("Please select a date and at least one time slot");
      return;
    }
    // PRD: Validate services (either legacy single or new multiple)
    if (!selectedService && selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    if (!studioId) {
      toast.error("Studio ID is missing");
      return;
    }

    // Create booking data for multiple slots
    const totalDuration = getTotalSelectedDuration();
    const firstSlot = selectedTimes[0];
    const lastSlot = selectedTimes[selectedTimes.length - 1];
    
    // Create start time in local timezone
    const [startHour, startMin] = firstSlot.split(':').map(Number);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMin || 0, 0, 0);
    
    // For multiple slots, end time should be last slot + 1 hour
    const [endHour, endMin] = lastSlot.split(':').map(Number);
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour + 1, endMin || 0, 0, 0); // Add 1 hour to last slot

    // PRD: Enhanced booking data with multiple services and equipment
    const bookingData = {
      studioId: studioId,
      date: selectedDate,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      // Legacy single service support
      service: selectedService ? {
        name: selectedService.name,
        price: selectedService.price,
        durationMins: totalDuration,
        description: selectedService.description || ""
      } : (selectedServices.length > 0 ? {
        name: selectedServices[0].name, // Primary service for legacy compatibility
        price: selectedServices[0].price,
        durationMins: totalDuration,
        description: selectedServices[0].description || ""
      } : null),
      // PRD: Multiple services
      services: selectedServices.length > 0 ? selectedServices : [],
      // PRD: Equipment rentals
      equipment: selectedEquipment,
      notes,
      price: calculateTotalCost(),
      selectedSlots: selectedTimes,
      totalDuration: totalDuration
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
  
  // Generate time slots from 00:00 to 23:00 (hourly intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calculate total selected duration in minutes (1 hour per slot)
  const getTotalSelectedDuration = () => {
    return selectedTimes.length * 60; // Always 60 minutes per slot
  };

  // Check if adding a slot would exceed the 5-hour limit
  const canAddSlot = () => {
    const totalMinutes = getTotalSelectedDuration() + 60; // Each slot is 60 minutes
    return totalMinutes <= (maxBookingHours * 60);
  };

  // Handle slot selection/deselection
  const handleSlotToggle = (time) => {
    const slotStatus = getSlotStatus(time);
    if (!slotStatus.available) return;

    const isSelected = selectedTimes.includes(time);
    
    if (isSelected) {
      // Deselect slot
      setSelectedTimes(prev => prev.filter(t => t !== time));
    } else {
      // Select slot if within limit
      if (canAddSlot()) {
        setSelectedTimes(prev => [...prev, time].sort());
      } else {
        toast.error(`Maximum booking duration is ${maxBookingHours} hours`);
      }
    }
  };

  // Enhanced availability checking function
  const getSlotStatus = (time) => {
    if (!selectedDate) return { available: false, reason: 'Select a date first' };
    
    const startDt = new Date(`${selectedDate}T${time}:00`);
    const endDt = new Date(startDt.getTime() + 60 * 60000); // Always 1 hour per slot
    const now = new Date();

    // Check if slot is in the past
    if (startDt < now) {
      return { available: false, reason: 'Past time', type: 'past' };
    }

    // Check if slot overlaps with confirmed/completed bookings
    const overlappingBooking = bookedSlots.find((s) => {
      // PRD: Only consider confirmed (Booked), completed, and active bookings as conflicts
      // Exclude payment_pending and reservation_pending as they may expire
      // Include cancel_pending as they still block availability until resolved
      if (!['confirmed', 'completed', 'active', 'cancel_pending'].includes(s.status)) {
        return false;
      }
      
      const bs = new Date(s.start);
      const be = new Date(s.end);
      const overlap = startDt < be && endDt > bs;
      return overlap;
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
    const provider = studioData?.data?.studio;
    const studioAvailability = provider?.availability || [];
    const dayOfWeek = startDt.getDay();
    
    // Studio availability validation
    
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
          // Recurring slot - check time range using start/end datetime or startTime/endTime strings
          let slotStartMinutes, slotEndMinutes;
          
          if (slot.start && slot.end) {
            // Old format: full datetime strings
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            slotStartMinutes = slotStart.getHours() * 60 + slotStart.getMinutes();
            slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes();
          } else if (slot.startTime && slot.endTime) {
            // New format: time strings like "09:00"
            const [startHour, startMin] = slot.startTime.split(':').map(Number);
            const [endHour, endMin] = slot.endTime.split(':').map(Number);
            slotStartMinutes = startHour * 60 + startMin;
            slotEndMinutes = endHour * 60 + endMin;
          } else {
            return false;
          }
          
          const requestStartMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1] || 0);
          const requestEndMinutes = requestStartMinutes + 60; // 1 hour per slot
          
          return requestStartMinutes >= slotStartMinutes && requestEndMinutes <= slotEndMinutes;
        } else if (!slot.isRecurring) {
          // Non-recurring slot - check date and time range
          const slotDate = slot.date; // YYYY-MM-DD format
          const requestDate = selectedDate; // selectedDate is already in YYYY-MM-DD format
          
          if (slotDate !== requestDate) return false;
          
          // Check time range using minutes
          const requestStartMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1] || 0);
          const requestEndMinutes = requestStartMinutes + 60; // 1 hour per slot
          
          return requestStartMinutes >= slot.startTime && requestEndMinutes <= slot.endTime;
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
      <div className="container-fluid px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Book a Session
            </h1>
            <p className="text-gray-400">
              Schedule your session with {providerName}
            </p>
          </div>

          {/* Studio Showcase */}
          <StudioShowcase studio={provider} />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            {/* Booking Form */}
            <div className="xl:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Date Selection */}
                <br />
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    Select Date
                  </h3>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border px-3 py-2 pr-10 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all date-input-custom"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 pointer-events-none" />
                  </div>
                </Card>

                {/* Time Selection */}
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
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
                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-200">
                              Selected: <span className="text-blue-400">{selectedTimes.length} slots</span> 
                              <span className="text-gray-400">({Math.floor(getTotalSelectedDuration() / 60)}h {getTotalSelectedDuration() % 60}m)</span>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                              Max: {maxBookingHours}h per booking
                            </div>
                          </div>
                          <div className="flex items-center justify-center space-x-6 text-xs">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-sm"></div>
                              <span className="text-gray-300">Available</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                              <span className="text-gray-300">Selected</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-sm"></div>
                              <span className="text-gray-300">Booked</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
                              <span className="text-gray-300">Closed</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 text-center bg-gray-800/30 rounded px-3 py-2">
                          💡 Availability based on studio schedule and real-time bookings
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/30 rounded-xl p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 max-h-96 overflow-y-auto scrollbar-styled pr-2">
                        {timeSlots.map((time) => {
                          const slotStatus = getSlotStatus(time);
                          const isSelected = selectedTimes.includes(time);
                          
                          // Get appropriate styling based on slot status
                          const getSlotStyles = () => {
                            if (isSelected) {
                              return "border-blue-400/80 bg-gradient-to-br from-blue-500/40 to-blue-600/30 text-blue-100 ring-2 ring-blue-400/70 shadow-xl shadow-blue-500/40 scale-105 backdrop-blur-sm";
                            }
                            
                            switch (slotStatus.type) {
                              case 'available':
                                return "border-green-400/50 bg-gradient-to-br from-green-500/25 to-green-600/15 text-green-100 hover:border-green-400/70 hover:from-green-500/35 hover:to-green-600/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transform transition-all duration-300 backdrop-blur-sm";
                              case 'booked':
                                return "border-red-400/50 bg-gradient-to-br from-red-500/25 to-red-600/15 text-red-200 cursor-not-allowed opacity-70 backdrop-blur-sm";
                              case 'past':
                                return "border-gray-500/30 bg-gradient-to-br from-gray-600/15 to-gray-700/10 text-gray-500 cursor-not-allowed opacity-40 backdrop-blur-sm";
                              case 'late':
                                return "border-yellow-400/50 bg-gradient-to-br from-yellow-500/25 to-yellow-600/15 text-yellow-200 cursor-not-allowed opacity-70 backdrop-blur-sm";
                              case 'closed':
                                return "border-orange-400/50 bg-gradient-to-br from-orange-500/25 to-orange-600/15 text-orange-200 cursor-not-allowed opacity-70 backdrop-blur-sm";
                              case 'loading':
                                return "border-blue-400/50 bg-gradient-to-br from-blue-500/25 to-blue-600/15 text-blue-200 cursor-wait animate-pulse backdrop-blur-sm";
                              default:
                                return "border-gray-500/30 bg-gradient-to-br from-gray-600/15 to-gray-700/10 text-gray-500 cursor-not-allowed opacity-40 backdrop-blur-sm";
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
                              onClick={() => handleSlotToggle(time)}
                              disabled={!slotStatus.available}
                              className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[90px] w-full ${getSlotStyles()}`}
                              title={slotStatus.reason}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg font-bold">{time}</span>
                                {getStatusIcon()}
                              </div>
                              <span className="text-xs opacity-75">
                                {slotStatus.reason}
                              </span>
                            </button>
                          );
                        })}
                        </div>
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

                {/* PRD: Multiple Services Selection */}
                {providerType === "studio" && provider.services && (
                  <ServiceSelector
                    services={provider.services}
                    selectedServices={selectedServices}
                    onServicesChange={setSelectedServices}
                    allowMultiple={true}
                  />
                )}

                {/* PRD: Equipment Rental Selection */}
                {providerType === "studio" && studioId && (
                  <EquipmentSelector
                    studioId={studioId}
                    selectedEquipment={selectedEquipment}
                    onEquipmentChange={setSelectedEquipment}
                    bookingDuration={Math.floor(getTotalSelectedDuration() / 60)}
                  />
                )}


                {/* Notes */}
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    Additional Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or notes for the session..."
                    rows={4}
                    className="w-full border-2 px-4 py-3 rounded-xl bg-gray-800/50 text-gray-100 border-gray-600/50 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none backdrop-blur-sm"
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
            <div className="xl:col-span-1 mt-11">
              <Card className="sticky top-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50 backdrop-blur-sm shadow-2xl">
                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  Booking Summary
                </h3>

                {/* Provider Info */}
                <div className="flex items-center space-x-3 mb-4">
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
                <div className="space-y-4 mb-4">
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

                  {selectedTimes.length > 0 && selectedDate && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Selected Slots</span>
                        <div className="text-right">
                          <div className="text-gray-100 font-medium">
                            {selectedTimes.length} slot{selectedTimes.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-400">
                            {Math.floor(getTotalSelectedDuration() / 60)}h {getTotalSelectedDuration() % 60}m total
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Times: {selectedTimes.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* PRD: Services Summary */}
                  {(selectedService || selectedServices.length > 0) && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Services</span>
                        <span className="text-gray-100 font-medium">
                          {selectedServices.length > 0 ? selectedServices.length : 1} selected
                        </span>
                      </div>
                      <div className="space-y-1">
                        {selectedServices.length > 0 ? (
                          selectedServices.map((service, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-300">{service.name}</span>
                              <span className="text-green-400">{formatCurrency(service.price)}</span>
                            </div>
                          ))
                        ) : selectedService ? (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-300">{selectedService.name}</span>
                            <span className="text-green-400">{formatCurrency(selectedService.price)}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* PRD: Equipment Summary */}
                  {selectedEquipment.length > 0 && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Equipment</span>
                        <span className="text-gray-100 font-medium">
                          {selectedEquipment.length} items
                        </span>
                      </div>
                      <div className="space-y-1">
                        {selectedEquipment.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-300">{item.name}</span>
                            <span className="text-orange-400">{formatCurrency(item.rentalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability Status */}
                  {selectedDate && selectedTimes.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-green-400 text-sm">✓</span>
                        <span className="text-green-300 text-sm font-medium">
                          {selectedTimes.length} slot{selectedTimes.length > 1 ? 's' : ''} selected
                        </span>
                      </div>
                    </div>
                  )}


                  {/* Booking Requirements */}
                  {(!selectedDate || selectedTimes.length === 0 || (!selectedService && selectedServices.length === 0)) && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="text-yellow-300 text-sm">
                        <div className="font-medium mb-2">Required to continue:</div>
                        <ul className="space-y-1 text-xs">
                          {!selectedDate && <li>• Select a date</li>}
                          {selectedTimes.length === 0 && <li>• Choose time slots</li>}
                          {!selectedService && selectedServices.length === 0 && <li>• Pick at least one service</li>}
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
                        ${calculateTotalCost()}
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        {selectedTimes.length > 0 && (
                          <div>Services: {formatCurrency(calculatePrice() * selectedTimes.length)}</div>
                        )}
                        {selectedEquipment.length > 0 && (
                          <div>Equipment: ${calculateEquipmentCost()}</div>
                        )}
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
