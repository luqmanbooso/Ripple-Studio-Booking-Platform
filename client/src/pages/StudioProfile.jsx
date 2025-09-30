import React, { useState } from "react";
import QuickBookingButton from "../components/ui/QuickBookingButton";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Heart,
  Share2,
  Camera,
  Clock,
  Award,
  Wifi,
  Coffee,
  Car,
} from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { useGetStudioQuery } from "../store/studioApi";
import { useGetReviewsQuery } from "../store/reviewApi";

const StudioProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: studioData, isLoading, error } = useGetStudioQuery(id);
  const { data: reviewsData } = useGetReviewsQuery({
    targetType: "studio",
    targetId: id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !studioData?.data?.studio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Studio Not Found
          </h2>
          <p className="text-gray-400 mb-4">
            The studio you're looking for doesn't exist.
          </p>
          <Link to="/search?type=studios">
            <Button>Browse Studios</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { studio } = studioData.data;
  const {
    user,
    name,
    location,
    description,
    services,
    equipment,
    amenities,
    gallery,
    ratingAvg,
    ratingCount,
  } = studio;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services & Pricing" },
    { id: "gallery", label: "Gallery" },
    {
      id: "reviews",
      label: `Reviews (${reviewsData?.data?.pagination?.total || 0})`,
    },
    { id: "availability", label: "Availability" },
  ];

  const amenityIcons = {
    WiFi: Wifi,
    Coffee: Coffee,
    Parking: Car,
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section */}
      <div className="relative">
        {gallery && gallery.length > 0 ? (
          <div className="h-96 overflow-hidden">
            <img
              src={gallery[selectedImage]?.url || gallery[0]?.url}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="h-96 bg-gradient-to-r from-accent-900/20 to-primary-900/20" />
        )}

        {/* Studio Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container py-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    {name}
                  </h1>
                  {user?.verified && (
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Award className="w-6 h-6 fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-200 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>
                    {[location?.address, location?.city, location?.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-white">
                      {ratingAvg ? ratingAvg.toFixed(1) : "New"}
                    </span>
                    {ratingCount > 0 && (
                      <span className="text-gray-300">
                        ({ratingCount} reviews)
                      </span>
                    )}
                  </div>

                  {services && services.length > 0 && (
                    <div className="flex items-center text-accent-300 font-semibold">
                      <span className="text-sm mr-1">from</span>
                      <DollarSign className="w-4 h-4" />
                      <span>{Math.min(...services.map((s) => s.price))}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  onClick={() => setIsFavorited(!isFavorited)}
                  variant="outline"
                  icon={
                    <Heart
                      className={`w-5 h-5 ${isFavorited ? "fill-current text-red-400" : ""}`}
                    />
                  }
                >
                  {isFavorited ? "Favorited" : "Add to Favorites"}
                </Button>

                <Button
                  variant="outline"
                  icon={<Share2 className="w-5 h-5" />}
                  onClick={() =>
                    navigator.share?.({
                      title: name,
                      url: window.location.href,
                    })
                  }
                >
                  Share
                </Button>

                <QuickBookingButton studio={studio} className="inline-block">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>Book Studio</span>
                  </div>
                </QuickBookingButton>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails */}
        {gallery && gallery.length > 1 && (
          <div className="absolute bottom-4 left-4">
            <div className="flex space-x-2">
              {gallery.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-white"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {gallery.length > 4 && (
                <div className="w-16 h-16 rounded-lg bg-black/60 flex items-center justify-center text-white text-sm">
                  +{gallery.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 p-1 bg-dark-800 rounded-lg mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-accent-600 text-white"
                      : "text-gray-400 hover:text-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <Card>
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">
                      About
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {description ||
                        "This studio hasn't added a description yet."}
                    </p>
                  </Card>

                  {equipment && equipment.length > 0 && (
                    <Card>
                      <h3 className="text-xl font-semibold text-gray-100 mb-4">
                        Equipment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {equipment.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 p-3 bg-dark-700 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-accent-400 rounded-full" />
                            <span className="text-gray-200">{item}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {amenities && amenities.length > 0 && (
                    <Card>
                      <h3 className="text-xl font-semibold text-gray-100 mb-4">
                        Amenities
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {amenities.map((amenity, index) => {
                          const Icon = amenityIcons[amenity] || Clock;
                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-3 bg-dark-700 rounded-lg"
                            >
                              <Icon className="w-5 h-5 text-accent-400" />
                              <span className="text-gray-200">{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "services" && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Services & Pricing
                  </h3>
                  {services && services.length > 0 ? (
                    <div className="space-y-4">
                      {services.map((service, index) => (
                        <div key={index} className="p-4 bg-dark-700 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-100">
                              {service.name}
                            </h4>
                            <div className="text-right">
                              <div className="text-xl font-bold text-accent-400">
                                ${service.price}
                              </div>
                              <div className="text-sm text-gray-400">
                                {service.durationMins} mins
                              </div>
                            </div>
                          </div>
                          {service.description && (
                            <p className="text-gray-300 mb-3">
                              {service.description}
                            </p>
                          )}
                          <QuickBookingButton
                            studio={studio}
                            service={service}
                            className="w-full"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>Book {service.name}</span>
                              <span className="text-xs opacity-75 flex items-center gap-1">
                                Secure → PayHere
                              </span>
                            </div>
                          </QuickBookingButton>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No services listed yet.</p>
                  )}
                </Card>
              )}

              {activeTab === "gallery" && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Gallery
                  </h3>
                  {gallery && gallery.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gallery.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-video bg-dark-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(index)}
                        >
                          <img
                            src={image.url}
                            alt={image.caption || `Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">
                        No gallery images available yet.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {activeTab === "reviews" && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Reviews
                  </h3>
                  {reviewsData?.data?.reviews?.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsData.data.reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border-b border-gray-700 pb-4 last:border-b-0"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-600 to-primary-600 rounded-full flex items-center justify-center">
                              {review.author?.avatar?.url ? (
                                <img
                                  src={review.author.avatar.url}
                                  alt={review.author.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-medium">
                                  {review.author?.name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-100">
                                  {review.author?.name}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-600"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-300">{review.comment}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No reviews yet.</p>
                  )}
                </Card>
              )}

              {activeTab === "availability" && (
                <Card>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Availability
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Book a session to see real-time availability and schedule
                    your studio time.
                  </p>
                  <Link to={`/booking/new?studioId=${id}`}>
                    <Button icon={<Calendar className="w-5 h-5" />}>
                      Check Availability
                    </Button>
                  </Link>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-gray-100">Usually within 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner</span>
                  <span className="text-gray-100">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sessions</span>
                  <span className="text-gray-100">
                    {studio.completedBookings || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Location Map Placeholder */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">Location</h3>
              <div className="h-48 bg-dark-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Map integration coming soon
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-3">
                {[location?.address, location?.city, location?.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </Card>

            {/* Similar Studios */}
            <Card>
              <h3 className="font-semibold text-gray-100 mb-4">
                Similar Studios
              </h3>
              <p className="text-gray-400 text-sm">
                Discover more studios in your area.
              </p>
              <Link to="/search?type=studios" className="block mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  Browse Studios
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioProfile;
