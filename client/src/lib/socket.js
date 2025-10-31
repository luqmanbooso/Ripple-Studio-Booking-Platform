import { io } from "socket.io-client";
import toast from "react-hot-toast";

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const opts = {
    transports: ["websocket", "polling"],
    withCredentials: true,
  };

  if (token) {
    opts.auth = { token };
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", opts);

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);

    // Handle authentication errors gracefully
    if (error.message && error.message.includes("Authentication")) {
      console.log("Socket authentication failed - user may need to login");
      return;
    }

    if (import.meta.env.DEV) {
      console.debug("Socket handshake auth:", socket && socket.auth);
      console.debug("Socket opts:", socket && socket.io && socket.io.opts);
    }
  });

  // Handle notifications
  socket.on("notification", (data) => {
    toast.success(data.message);
  });

  // Handle booking updates
  socket.on("booking_created", (data) => {
    toast.success(`New booking received from ${data.clientName}`);
    // Trigger refetch of bookings
    window.dispatchEvent(new CustomEvent("refetch-bookings"));
  });

  socket.on("booking_confirmed", (data) => {
    toast.success("Your booking has been confirmed!");
    // Trigger refetch of bookings
    window.dispatchEvent(new CustomEvent("refetch-bookings"));
  });

  socket.on("booking_cancelled", (data) => {
    toast.error(`Booking cancelled: ${data.reason || "No reason provided"}`);
    // Trigger refetch of bookings
    window.dispatchEvent(new CustomEvent("refetch-bookings"));
  });

  socket.on("booking_completed", (data) => {
    toast.success("Your booking has been completed!");
    // Trigger refetch of bookings
    window.dispatchEvent(new CustomEvent("refetch-bookings"));
  });

  // Handle slot updates
  socket.on("slot-held", (data) => {
    // Update UI to show slot is temporarily held
    window.dispatchEvent(new CustomEvent("slot-held", { detail: data }));
  });

  socket.on("slot-released", (data) => {
    // Update UI to show slot is available again
    window.dispatchEvent(new CustomEvent("slot-released", { detail: data }));
  });

  socket.on("calendar_update", (data) => {
    // Trigger calendar refresh
    window.dispatchEvent(new CustomEvent("calendar-update", { detail: data }));
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event helpers
export const joinProviderRoom = (providerId, providerType) => {
  if (socket) {
    socket.emit("join-provider-room", { providerId, providerType });
  }
};

export const holdSlot = (providerId, providerType, start, end) => {
  if (socket) {
    socket.emit("hold-slot", { providerId, providerType, start, end });
  }
};

export const releaseSlot = (providerId, providerType, start, end) => {
  if (socket) {
    socket.emit("release-slot", { providerId, providerType, start, end });
  }
};

export const emitBookingUpdate = (
  bookingId,
  status,
  providerId,
  providerType
) => {
  if (socket) {
    socket.emit("booking-update", {
      bookingId,
      status,
      providerId,
      providerType,
    });
  }
};
