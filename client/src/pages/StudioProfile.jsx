import React, { useState, useEffect } from "react";
import QuickBookingButton from "../components/ui/QuickBookingButton";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Music,
  Headphones,
  Mic,
  Users,
  Eye,
  Play,
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Zap,
  Shield,
  CheckCircle,
  TrendingUp,
  Volume2,
  Layers,
} from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ImageSlider from "../components/ui/ImageSlider";
import { useGetStudioQuery } from "../store/studioApi";
import { useGetReviewsQuery } from "../store/reviewApi";

const StudioProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [studioMedia, setStudioMedia] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data: studioData, isLoading, error } = useGetStudioQuery(id);
  const { data: reviewsData } = useGetReviewsQuery({
    targetType: "studio",
    targetId: id,
  });

  // Fetch studio media
  useEffect(() => {
    const fetchStudioMedia = async () => {
      if (!id) return;
      
      try {
        setIsLoadingMedia(true);
        const response = await fetch(`/api/media/studio/${id}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Transform API data to slider format
          const transformedMedia = data.data.map(item => ({
            id: item._id,
            type: item.type,
            url: item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`,
            thumbnail: item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`,
            caption: item.title || item.description || 'Studio Media'
          }));
          setStudioMedia(transformedMedia);
        }
      } catch (error) {
        console.error('Error fetching studio media:', error);
      } finally {
        setIsLoadingMedia(false);
      }
    };

    fetchStudioMedia();
  }, [id]);

  // Save/Unsave studio functionality
  const handleSaveStudio = async () => {
    try {
      setIsSaving(true);
      // This would typically call an API to save/unsave the studio
      // For now, we'll just toggle the state
      setIsFavorited(!isFavorited);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // You can add a toast notification here
      console.log(isFavorited ? 'Studio removed from favorites' : 'Studio saved to favorites');
    } catch (error) {
      console.error('Error saving studio:', error);
    } finally {
      setIsSaving(false);
    }
  };

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

  // Get media for display (prefer fetched media, fallback to gallery)
  const displayMedia = studioMedia.length > 0 ? studioMedia : (gallery || []);

  const getStudioTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'recording': return <Mic className="w-6 h-6" />;
      case 'mixing': return <Headphones className="w-6 h-6" />;
      case 'mastering': return <Music className="w-6 h-6" />;
      case 'live': return <Users className="w-6 h-6" />;
      default: return <Music className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Enhanced Back Button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-50"
      >
        <Link to="/search?type=studios">
          <Button
            variant="outline"
            size="sm"
            className="bg-black/30 backdrop-blur-xl border-white/10 text-white hover:bg-black/50 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/20"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Back to Studios</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </motion.div>

      {/* Enhanced Hero Section with Image Slider */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="h-[32rem] lg:h-[40rem] overflow-hidden relative">
          {displayMedia.length > 0 ? (
            <div className="relative h-full">
              <ImageSlider 
                images={displayMedia}
                autoPlay={true}
                autoPlayInterval={8000}
                showThumbnails={true}
                showControls={true}
                className="h-full"
              />
              {/* Enhanced overlay with multiple layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full blur-sm"
              />
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-32 right-32 w-2 h-2 bg-purple-400/40 rounded-full blur-sm"
              />
            </div>
          ) : (
            <div className="h-full bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-pink-900/40 flex items-center justify-center relative">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center relative z-10"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25"
                >
                  {getStudioTypeIcon(studio?.studioType)}
                </motion.div>
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-white mb-3"
                >
                  {name}
                </motion.h3>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-300 text-lg"
                >
                  Professional Studio Experience
                </motion.p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Enhanced Studio Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 pointer-events-auto">
            <div className="container mx-auto">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 max-w-4xl"
                >
                  {/* Studio Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        {getStudioTypeIcon(studio?.studioType)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                          {name}
                        </h1>
                        {user?.verified && (
                          <div className="flex items-center space-x-1 bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                            <Award className="w-5 h-5 text-blue-400" />
                            <span className="text-blue-300 text-sm font-medium">Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                        <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {[location?.city, location?.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                        
                        {ratingAvg > 0 && (
                          <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-bold text-yellow-300">{ratingAvg.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-yellow-200/80">({ratingCount} reviews)</span>
                          </div>
                        )}

                        {services && services.length > 0 && (
                          <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-300">
                              from ${Math.min(...services.map((s) => s.price))}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Media Indicator */}
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
                          studioMedia.length > 0 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          <Camera className="w-4 h-4 mr-2" />
                          {studioMedia.length > 0 ? `${studioMedia.length} Studio Photos` : 'Sample Gallery'}
                        </span>
                        
                        <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Live Studio</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Button
                    onClick={handleSaveStudio}
                    loading={isSaving}
                    variant="outline"
                    className="bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-black/70"
                    icon={
                      <Heart
                        className={`w-5 h-5 transition-colors ${isFavorited ? "fill-current text-red-400" : ""}`}
                      />
                    }
                  >
                    {isFavorited ? "Saved" : "Save Studio"}
                  </Button>

                  <Button
                    variant="outline"
                    className="bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-black/70"
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

                  <Link to={`/booking/new?studioId=${id}`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>Book Now</span>
                      </div>
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Content Section */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Enhanced Tabs */}
            <div className="flex space-x-2 p-2 bg-gradient-to-r from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md rounded-xl mb-8 overflow-x-auto border border-gray-700/30">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-105"
                      : "text-gray-400 hover:text-gray-100 hover:bg-gray-700/30"
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
                <div className="space-y-8">
                  {/* About Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />
                      
                      <div className="relative">
                        <div className="flex items-center mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-100">About This Studio</h3>
                            <p className="text-gray-400 text-sm">Discover what makes this space special</p>
                          </div>
                        </div>
                        
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-300 leading-relaxed text-lg">
                            {description || "This studio hasn't added a description yet, but every space has its own unique character and professional capabilities waiting to be discovered."}
                          </p>
                        </div>
                        
                        {/* Studio highlights */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-gray-800/30 rounded-xl">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="text-sm font-medium text-gray-200">Professional</div>
                            <div className="text-xs text-gray-400">Grade Equipment</div>
                          </div>
                          <div className="text-center p-4 bg-gray-800/30 rounded-xl">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <Shield className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="text-sm font-medium text-gray-200">Secure</div>
                            <div className="text-xs text-gray-400">Environment</div>
                          </div>
                          <div className="text-center p-4 bg-gray-800/30 rounded-xl">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <Zap className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-sm font-medium text-gray-200">Fast</div>
                            <div className="text-xs text-gray-400">Setup</div>
                          </div>
                          <div className="text-center p-4 bg-gray-800/30 rounded-xl">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <TrendingUp className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="text-sm font-medium text-gray-200">Top Rated</div>
                            <div className="text-xs text-gray-400">Studio</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Equipment Section */}
                  {equipment && equipment.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl" />
                        
                        <div className="relative">
                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                              <Volume2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-100">Professional Equipment</h3>
                              <p className="text-gray-400 text-sm">{equipment.length} pieces of professional gear</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {equipment.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-xl border border-gray-600/30 hover:border-green-500/30 transition-all duration-300"
                              >
                                <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-400/25 group-hover:shadow-green-400/50 transition-shadow" />
                                <span className="text-gray-200 font-medium group-hover:text-green-300 transition-colors">{item}</span>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Amenities Section */}
                  {amenities && amenities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl" />
                        
                        <div className="relative">
                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                              <Layers className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-100">Studio Amenities</h3>
                              <p className="text-gray-400 text-sm">Comfort and convenience features</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {amenities.map((amenity, index) => {
                              const Icon = amenityIcons[amenity] || Clock;
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.1 * index }}
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  className="group flex items-center space-x-3 p-4 bg-gradient-to-br from-gray-800/40 to-gray-700/40 rounded-xl border border-gray-600/30 hover:border-orange-500/30 transition-all duration-300"
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all">
                                    <Icon className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
                                  </div>
                                  <span className="text-gray-200 font-medium group-hover:text-orange-300 transition-colors">{amenity}</span>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
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
                          <Link to={`/booking/new?studioId=${id}&service=${encodeURIComponent(service.name)}`} className="w-full">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                              <div className="flex items-center justify-between w-full">
                                <span>Book {service.name}</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-xs opacity-75">Book Now</span>
                                </div>
                              </div>
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No services listed yet.</p>
                  )}
                </Card>
              )}

              {activeTab === "gallery" && (
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      Studio Gallery
                    </h3>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                      {displayMedia.length} items
                    </span>
                  </div>
                  
                  {displayMedia.length > 0 ? (
                    <div className="space-y-6">
                      {/* Featured Image Slider */}
                      <div className="aspect-video rounded-xl overflow-hidden">
                        <ImageSlider 
                          images={displayMedia}
                          autoPlay={false}
                          showThumbnails={true}
                          showControls={true}
                          className="h-full"
                        />
                      </div>
                      
                      {/* Grid View */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {displayMedia.map((image, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedImage(index)}
                          >
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-800/50 border border-gray-600/30">
                              <img
                                src={image.thumbnail || image.url}
                                alt={image.caption || `Gallery ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-3 left-3 right-3">
                                  <div className="flex items-center justify-between">
                                    <Camera className="w-4 h-4 text-white" />
                                    <Eye className="w-4 h-4 text-white" />
                                  </div>
                                  {image.caption && (
                                    <p className="text-white text-xs mt-2 truncate">
                                      {image.caption}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-10 h-10 text-gray-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-300 mb-2">No Gallery Yet</h4>
                      <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        This studio hasn't uploaded any gallery images yet. Check back later for photos and videos.
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

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Booking Card */}
            <Card className="bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-purple-900/20 border-purple-500/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Book?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Check availability and book your session instantly
                </p>
                <Link to={`/booking/new?studioId=${id}`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>Book Studio Now</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Studio Stats */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <h3 className="font-semibold text-gray-100 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                  <Building className="w-3 h-3 text-white" />
                </div>
                Studio Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">Response Time</span>
                  </div>
                  <span className="text-green-300 text-sm font-medium">~1 hour</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">Owner</span>
                  </div>
                  <span className="text-gray-100 text-sm font-medium">{user?.name}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400 text-sm">Sessions</span>
                  </div>
                  <span className="text-gray-100 text-sm font-medium">
                    {studio.completedBookings || 0}+ completed
                  </span>
                </div>

                {studio.studioType && (
                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStudioTypeIcon(studio.studioType)}
                      <span className="text-gray-400 text-sm">Type</span>
                    </div>
                    <span className="text-purple-300 text-sm font-medium capitalize">{studio.studioType}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact & Location */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <h3 className="font-semibold text-gray-100 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                Location & Contact
              </h3>
              
              {/* Location */}
              <div className="mb-4">
                <div className="h-32 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg flex items-center justify-center border border-gray-600/30">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">Interactive map coming soon</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-200 text-sm font-medium">
                        {location?.city}, {location?.country}
                      </p>
                      {location?.address && (
                        <p className="text-gray-400 text-xs mt-1">{location.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  icon={<Phone className="w-4 h-4" />}
                >
                  Contact Studio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  icon={<ExternalLink className="w-4 h-4" />}
                >
                  View on Map
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* Full Width Explore More Section */}
      <div className="w-full bg-gradient-to-br from-gray-900/50 to-black/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Explore More Studios</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Discover amazing studios in your area and find the perfect space for your next project
              </p>
            </div>

            {/* Full Width Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Browse All Studios Card */}
              <Link to="/search?type=studios" className="block">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -8 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl cursor-pointer group overflow-hidden h-full"
                >
                  {/* Enhanced Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <ExternalLink className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">Browse All Studios</h3>
                    <p className="text-gray-400 text-base leading-relaxed">Explore our entire collection of professional recording spaces and creative environments</p>
                  </div>
                </motion.div>
              </Link>

              {/* Local Studios Card */}
              <Link to={`/search?type=studios&location=${location?.city}`} className="block">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -8 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative p-8 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl cursor-pointer group overflow-hidden h-full"
                >
                  {/* Enhanced Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <MapPin className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">Studios in {location?.city}</h3>
                    <p className="text-gray-400 text-base leading-relaxed">Discover local studios near you with convenient access and familiar surroundings</p>
                  </div>
                </motion.div>
              </Link>

              {/* Similar Type Studios Card */}
              {studio?.studioType ? (
                <Link to={`/search?type=studios&studioType=${studio.studioType}`} className="block">
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -8 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative p-8 bg-gradient-to-br from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-2xl cursor-pointer group overflow-hidden h-full"
                  >
                    {/* Enhanced Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getStudioTypeIcon(studio.studioType)}
                        </div>
                        <Music className="w-6 h-6 text-pink-400 group-hover:text-pink-300 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors capitalize">{studio.studioType} Studios</h3>
                      <p className="text-gray-400 text-base leading-relaxed">Find similar studio types with specialized equipment and professional setups</p>
                    </div>
                  </motion.div>
                </Link>
              ) : (
                <Link to="/search?type=studios&featured=true" className="block">
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -8 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative p-8 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl cursor-pointer group overflow-hidden h-full"
                  >
                    {/* Enhanced Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <Star className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">Featured Studios</h3>
                      <p className="text-gray-400 text-base leading-relaxed">Explore our top-rated and most popular studios with exceptional reviews</p>
                    </div>
                  </motion.div>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudioProfile;
