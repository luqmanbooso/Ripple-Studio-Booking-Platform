import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, DollarSign, User, Building } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { useGetArtistQuery } from "../store/artistApi";
import { useGetStudioQuery } from "../store/studioApi";
import { useCreateBookingMutation } from "../store/bookingApi";

const NewBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [duration, setDuration] = useState(180); // 3 hours default
  const [notes, setNotes] = useState("");

  const artistId = searchParams.get("artistId");
  const studioId = searchParams.get("studioId");
  const serviceParam = searchParams.get("service");

  const { data: artistData, isLoading: artistLoading } = useGetArtistQuery(
    artistId,
    {
      skip: !artistId,
    }
  );
  const { data: studioData, isLoading: studioLoading } = useGetStudioQuery(
    studioId,
    {
      skip: !studioId,
    }
  );

  const [createBooking, { isLoading: bookingLoading }] =
    useCreateBookingMutation();

  const isLoading = artistLoading || studioLoading;
  const provider = artistData?.data?.artist || studioData?.data?.studio;
  const providerType = artistId ? "artist" : "studio";

  useEffect(() => {
    if (studioData?.data?.studio?.services && serviceParam) {
      const service = studioData.data.studio.services.find(
        (s) => s.name === serviceParam
      );
      if (service) {
        setSelectedService(service);
        setDuration(service.durationMins);
      }
    }
  }, [studioData, serviceParam]);

  const calculatePrice = () => {
    if (providerType === "artist" && provider?.hourlyRate) {
      return (provider.hourlyRate * (duration / 60)).toFixed(2);
    }
    if (providerType === "studio" && selectedService) {
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

    if (providerType === "studio" && !selectedService) {
      toast.error("Please select a service");
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const bookingData = {
      [providerType === "artist" ? "artistId" : "studioId"]: provider._id,
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

    try {
      const result = await createBooking(bookingData).unwrap();
      toast.success("Booking created! Redirecting to payment...");

      // Redirect to checkout with the booking data
      navigate("/booking/checkout", {
        state: {
          booking: result.data.booking,
          checkoutUrl: result.data.checkoutUrl,
          checkoutData: result.data.checkoutData, // PayHere checkout data
        },
      });
    } catch (error) {
      toast.error(error.data?.message || "Failed to create booking");
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
            The artist or studio you're trying to book doesn't exist.
          </p>
          <Button onClick={() => navigate("/search")}>Browse Providers</Button>
        </div>
      </div>
    );
  }

  const providerName = provider.user?.name || provider.name;
  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

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
                    className="input-field w-full"
                    required
                  />
                </Card>

                {/* Time Selection */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Select Time
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedTime === time
                            ? "border-primary-500 bg-primary-500/20 text-primary-300"
                            : "border-gray-600 hover:border-gray-500 text-gray-300"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
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

                {/* Duration (Artists only) */}
                {providerType === "artist" && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">
                      Duration
                    </h3>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="input-field w-full"
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
                    className="input-field w-full resize-none"
                  />
                </Card>

                <Button
                  type="submit"
                  loading={bookingLoading}
                  className="w-full"
                  size="lg"
                >
                  Continue to Payment
                </Button>
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
                    {providerType === "artist" ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <Building className="w-6 h-6 text-white" />
                    )}
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
                <div className="space-y-3 mb-6">
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date</span>
                      <span className="text-gray-100">
                        {new Date(selectedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time</span>
                      <span className="text-gray-100">{selectedTime}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-gray-100">
                      {duration >= 60 ? `${duration / 60}h` : `${duration}m`}
                    </span>
                  </div>

                  {selectedService && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service</span>
                      <span className="text-gray-100">
                        {selectedService.name}
                      </span>
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
                      {providerType === "artist" && (
                        <div className="text-sm text-gray-400">
                          ${provider.hourlyRate}/hr
                        </div>
                      )}
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
