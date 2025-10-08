import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

// Layout components
import Navbar from "./components/layout/Navbar";
import AdminNavbar from "./components/layout/AdminNavbar";
import StudioNavbar from "./components/layout/StudioNavbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ParticleBackground from "./components/common/ParticleBackground";

// Pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import StudioProfile from "./pages/StudioProfile";
import NewBooking from "./pages/NewBooking";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import Community from "./pages/Community";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";

// Auth pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// Dashboard pages
import ClientDashboard from "./pages/Dashboard/ClientDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminStudios from "./pages/Admin/AdminStudios";
import AdminRevenue from "./pages/Admin/AdminRevenue";
import AdminReviews from "./pages/Admin/AdminReviews";
import AdminPayments from "./pages/Admin/AdminPayments";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import StudioDashboard from "./pages/Dashboard/StudioDashboard";
import AdminFeedback from "./pages/Admin/AdminFeedback";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminStudioApprovals from "./pages/Admin/AdminStudioApprovals";
import AdminMediaManager from "./pages/Admin/AdminMediaManager";
import AdminEquipmentManager from "./pages/Admin/AdminEquipmentManager";
import EnhancedStudioBookings from "./pages/Dashboard/EnhancedStudioBookings";
import StudioServicesManager from "./pages/Dashboard/StudioServicesManager";
import StudioAvailabilityManager from "./pages/Dashboard/StudioAvailabilityManager";
import StudioMediaManager from "./pages/Dashboard/StudioMediaManager";
import StudioEquipmentManager from "./pages/Dashboard/StudioEquipmentManager";
import StudioAnalytics from "./pages/Dashboard/StudioAnalytics";
import StudioRevenue from "./pages/Dashboard/StudioRevenue";
import StudioAmenities from "./pages/Dashboard/StudioAmenities";
import TestPage from "./pages/Dashboard/TestPage";
import DiagnosticPage from "./pages/Dashboard/DiagnosticPage";
import SimpleStudioLayout from "./components/layout/SimpleStudioLayout";
import SimpleStudioDashboard from "./pages/Dashboard/SimpleStudioDashboard";
import CompleteStudioServices from "./pages/Dashboard/CompleteStudioServices";
import CompleteStudioBookings from "./pages/Dashboard/CompleteStudioBookings";
import CompleteStudioAvailability from "./pages/Dashboard/CompleteStudioAvailability";
import CompleteAvailabilityManager from "./pages/Dashboard/CompleteAvailabilityManager";
import CompleteStudioMedia from "./pages/Dashboard/CompleteStudioMedia";
import CompleteStudioProfile from "./pages/Dashboard/CompleteStudioProfile";
import UnifiedBookingsHub from "./pages/Dashboard/UnifiedBookingsHub";
import UnifiedStudioProfile from "./pages/Dashboard/UnifiedStudioProfile";
import UnifiedBookingsPage from "./pages/Dashboard/UnifiedBookingsPage";
import NotificationsPage from "./pages/Dashboard/NotificationsPage";

// Settings pages
import Profile from "./pages/Settings/Profile";
import Security from "./pages/Settings/Security";
import StudioSettings from "./pages/Dashboard/StudioSettings";
import AvailabilityManager from "./pages/Dashboard/AvailabilityManager";
import PaymentHistory from "./pages/Dashboard/PaymentHistory";
import StudioProfileManager from "./pages/Dashboard/StudioProfileManager";
import VerifyEmail from "./pages/VerifyEmail";

// Store
import { setCredentials, initializeAuth } from "./store/authSlice";
import { setTheme, setReducedMotion } from "./store/themeSlice";
import { initializeSocket } from "./lib/socket";
import api from "./lib/axios";
import { store } from "./store/store";

// Providers
import NotificationProvider from "./providers/NotificationProvider";
import AuthenticationStatus from "./components/common/AuthenticationStatus";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);
  const { mode, animations } = useSelector((state) => state.theme);

  // Check if we're on admin routes or admin user on dashboard
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    (location.pathname === "/dashboard" && user?.role === "admin");
    
  // Check if we're on studio routes or studio user logged in
  const isStudioRoute = user?.role === "studio" && !isAdminRoute;

  useEffect(() => {
    // Initialize authentication from localStorage
    dispatch(initializeAuth());

    // Initialize theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    }

    // Set initial theme class on document
    const applyTheme = (themeMode) => {
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Apply current theme
    applyTheme(mode);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    dispatch(setReducedMotion(prefersReducedMotion));

    // Listen for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => {
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        dispatch(setTheme(newTheme));
        applyTheme(newTheme);
      }
    };
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [dispatch, mode]);

  // Watch for theme mode changes to update document class
  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  useEffect(() => {
    // Initialize socket connection when user is authenticated.
    // Ensure access token is valid (or refreshed) before connecting.
    if (!user) return;

    let mounted = true;

    const init = async () => {
      try {
        // Trigger /me to allow axios to refresh tokens via its interceptor
        await api.get("/auth/me");
      } catch (err) {
        // Ignore - refresh may have failed; connection will not be established
        console.error("Socket auth check failed", err);
      }

      if (!mounted) return;

      const latestToken = store.getState().auth.token;
      if (latestToken) {
        initializeSocket(latestToken);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [user, mode]);

  return (
    <ErrorBoundary>
      <NotificationProvider>
      <div
        className={`App min-h-screen bg-dark-950 text-gray-100 relative overflow-x-hidden ${
          mode === "dark" ? "bg-dark-950 text-white" : "bg-white text-gray-900"
        }`}
      >
      {/* Particle Background - Only show on non-admin/non-studio dashboard pages */}
      {!isAdminRoute && !isStudioRoute && <ParticleBackground />}
      
      {/* Authentication Status */}
      <AuthenticationStatus />

      {/* Conditional Navbar */}
      {isAdminRoute ? (
        <AdminNavbar />
      ) : isStudioRoute ? (
        <StudioNavbar />
      ) : (
        <Navbar />
      )}

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/studios/:id" element={<StudioProfile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/genres" element={<Search />} />
            <Route path="/featured" element={<Search />} />
            <Route path="/tools" element={<Blog />} />
            <Route path="/help" element={<Blog />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route
              path="/booking/new"
              element={
                <ProtectedRoute>
                  <NewBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/success"
              element={
                <ProtectedRoute>
                  <BookingSuccess />
                </ProtectedRoute>
              }
            />

            {/* Dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            {/* Settings routes */}
            <Route
              path="/settings/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/security"
              element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/bookings"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <UnifiedBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/services"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <CompleteStudioServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <SimpleStudioDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/availability"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <CompleteAvailabilityManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/media"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <CompleteStudioMedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/equipment"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <StudioEquipmentManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <UnifiedStudioProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute allowedRoles={["studio"]}>
                  <StudioAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute allowedRoles={["studio", "client"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminRoutes />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer - Only show on non-admin/non-studio dashboard pages */}
      {!isAdminRoute && !isStudioRoute && <Footer />}
      </div>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

// Dashboard router component
function DashboardRouter() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "client":
      return <ClientDashboard />;
    case "studio":
      return <StudioDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <ClientDashboard />;
  }
}

// Admin routes component
function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="studios" element={<AdminStudios />} />
      <Route path="studios/approvals" element={<AdminStudioApprovals />} />
      <Route path="revenue" element={<AdminRevenue />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="reviews" element={<AdminReviews />} />
      <Route path="payments" element={<AdminPayments />} />
      <Route path="notifications" element={<AdminNotifications />} />
      <Route path="feedback" element={<AdminFeedback />} />
      <Route path="media" element={<AdminMediaManager />} />
      <Route path="equipment" element={<AdminEquipmentManager />} />
    </Routes>
  );
}

export default App;
