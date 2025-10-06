import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { AlertCircle, User, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthenticationStatus = () => {
  const { user, token, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { isConnected } = useSelector((state) => state.notifications);

  // Don't show anything if user is authenticated and connected
  if (isAuthenticated && isConnected) {
    return null;
  }

  // Don't show during initial loading
  if (isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 z-50 max-w-sm"
    >
      {!isAuthenticated ? (
        <div className="bg-yellow-900/90 border border-yellow-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-full">
              <User className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-100 text-sm">
                Not Authenticated
              </h3>
              <p className="text-yellow-200 text-xs mt-1">
                Please log in to access all features and receive notifications.
              </p>
              <div className="mt-2 flex space-x-2">
                <Link
                  to="/login"
                  className="text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded hover:bg-yellow-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs bg-transparent border border-yellow-500 text-yellow-400 px-2 py-1 rounded hover:bg-yellow-500/20 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : !isConnected ? (
        <div className="bg-red-900/90 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-500/20 rounded-full">
              <WifiOff className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-100 text-sm">
                Connection Issue
              </h3>
              <p className="text-red-200 text-xs mt-1">
                Unable to connect to notification service. Some features may be limited.
              </p>
              <div className="mt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs bg-red-500 text-red-900 px-2 py-1 rounded hover:bg-red-400 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default AuthenticationStatus;
