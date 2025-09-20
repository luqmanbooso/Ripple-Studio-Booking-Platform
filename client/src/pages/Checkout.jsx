import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Shield, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

<<<<<<< HEAD
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
=======
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import api from '../lib/axios'
>>>>>>> 255f30f0c24acdc018534457af075ad045b88f26

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, checkoutUrl, checkoutData } = location.state || {};

  useEffect(() => {
    if (!booking || !checkoutUrl || !checkoutData) {
      toast.error("Invalid checkout session");
      navigate("/search");
      return;
    }

<<<<<<< HEAD
    // Create a form and submit to PayHere
    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkoutUrl;

    // Add all PayHere checkout data as hidden fields
    Object.keys(checkoutData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = checkoutData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }, [booking, checkoutUrl, checkoutData, navigate]);
=======
    // If this is a demo checkout URL (local dev), don't auto-redirect; show demo button
    if (checkoutUrl.includes('/booking/demo-checkout')) {
      return
    }

    // Redirect to Stripe Checkout
    window.location.href = checkoutUrl
  }, [booking, checkoutUrl, navigate])
>>>>>>> 255f30f0c24acdc018534457af075ad045b88f26

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-4"
      >
        <Card className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Redirecting to Payment
          </h2>

          <p className="text-gray-400 mb-6">
            You're being redirected to our secure payment processor to complete
            your booking.
          </p>

          <div className="flex items-center justify-center space-x-2 text-green-400 mb-6">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Secured by PayHere</span>
          </div>

          {checkoutUrl.includes('/booking/demo-checkout') ? (
            <div>
              <p className="text-gray-400 mb-4">Demo checkout detected. Complete a simulated payment to continue.</p>
              <Button
                onClick={async () => {
                  try {
                    const sessionId = new URL(checkoutUrl).searchParams.get('session_id') || 'cs_demo'
                    const res = await api.post('/payments/demo-complete', { sessionId, bookingId: booking._id })
                    toast.success('Demo payment completed')
                    navigate('/booking/success', { state: { booking: res.data.data.booking } })
                  } catch (err) {
                    toast.error('Demo payment failed')
                  }
                }}
                className="w-full mb-3"
              >
                Complete Demo Payment
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          ) : (
            <>
              <Spinner className="mx-auto mb-6" />

              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="w-full"
              >
                Go Back
              </Button>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Checkout;
