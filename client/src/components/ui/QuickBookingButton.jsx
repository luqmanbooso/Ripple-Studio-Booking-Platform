import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, CreditCard, Shield } from "lucide-react";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const QuickBookingButton = ({
  studio,
  service = null,
  className = "",
  size = "md",
  children = null,
}) => {
  const navigate = useNavigate();

  const handleQuickBooking = () => {
    if (!studio?._id) {
      toast.error("Studio information not available");
      return;
    }

    // Navigate to booking page with studio and service pre-selected
    const params = new URLSearchParams({
      studioId: studio._id,
    });

    if (service?.name) {
      params.append("service", service.name);
    }

    navigate(`/booking/new?${params.toString()}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Button
        onClick={handleQuickBooking}
        size={size}
        icon={<Calendar className="w-4 h-4" />}
        className="relative overflow-hidden group"
      >
        <span className="relative z-10">
          {children || (service ? `Book ${service.name}` : "Book Studio")}
        </span>

        {/* Payment indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <CreditCard className="w-3 h-3" />
          </div>
        </div>
      </Button>
    </motion.div>
  );
};

export default QuickBookingButton;
