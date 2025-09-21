import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MessageSquare,
  Lightbulb,
  Bug,
  Heart,
  Send,
  Upload,
  Check,
  AlertCircle,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // General feedback state
  const [generalForm, setGeneralForm] = useState({
    rating: 0,
    category: "",
    title: "",
    description: "",
    email: "",
    anonymous: false,
  });

  // Feature request state
  const [featureForm, setFeatureForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    useCase: "",
    email: "",
  });

  // Bug report state
  const [bugForm, setBugForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    browser: "",
    device: "",
    screenshot: null,
    email: "",
  });

  const feedbackTabs = [
    {
      id: "general",
      label: "General Feedback",
      icon: MessageSquare,
      description: "Share your overall experience with Ripple",
    },
    {
      id: "feature",
      label: "Feature Request",
      icon: Lightbulb,
      description: "Suggest new features or improvements",
    },
    {
      id: "bug",
      label: "Report Bug",
      icon: Bug,
      description: "Report issues or bugs you've encountered",
    },
  ];

  const generalCategories = [
    { value: "ui_ux", label: "User Interface & Experience" },
    { value: "performance", label: "Performance & Speed" },
    { value: "booking", label: "Booking Process" },
    { value: "payment", label: "Payment & Billing" },
    { value: "search", label: "Search & Discovery" },
    { value: "communication", label: "Communication Features" },
    { value: "mobile", label: "Mobile Experience" },
    { value: "other", label: "Other" },
  ];

  const featureCategories = [
    { value: "booking", label: "Booking & Scheduling" },
    { value: "payment", label: "Payment & Billing" },
    { value: "communication", label: "Communication" },
    { value: "discovery", label: "Search & Discovery" },
    { value: "profile", label: "Profile & Portfolio" },
    { value: "mobile", label: "Mobile App" },
    { value: "integration", label: "Third-party Integration" },
    { value: "other", label: "Other" },
  ];

  const priorityLevels = [
    { value: "low", label: "Low - Nice to have", color: "text-green-400" },
    {
      value: "medium",
      label: "Medium - Would be helpful",
      color: "text-yellow-400",
    },
    { value: "high", label: "High - Really needed", color: "text-orange-400" },
    { value: "critical", label: "Critical - Essential", color: "text-red-400" },
  ];

  const severityLevels = [
    {
      value: "low",
      label: "Low - Minor cosmetic issue",
      color: "text-green-400",
    },
    {
      value: "medium",
      label: "Medium - Affects functionality",
      color: "text-yellow-400",
    },
    {
      value: "high",
      label: "High - Major functionality broken",
      color: "text-orange-400",
    },
    {
      value: "critical",
      label: "Critical - App unusable",
      color: "text-red-400",
    },
  ];

  const handleRatingClick = (rating) => {
    setGeneralForm((prev) => ({ ...prev, rating }));
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();

    if (
      !generalForm.rating ||
      !generalForm.category ||
      !generalForm.description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: JSON.stringify({
          rating: generalForm.rating,
          category: generalForm.category,
          title: generalForm.title,
          description: generalForm.description,
          email: generalForm.email,
          anonymous: generalForm.anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      toast.success("Thank you for your feedback!");
      setSubmitted(true);
      setGeneralForm({
        rating: 0,
        category: "",
        title: "",
        description: "",
        email: "",
        anonymous: false,
      });
    } catch (error) {
      toast.error(
        error.message || "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();

    if (
      !featureForm.title ||
      !featureForm.description ||
      !featureForm.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback/feature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: JSON.stringify({
          title: featureForm.title,
          description: featureForm.description,
          category: featureForm.category,
          priority: featureForm.priority,
          useCase: featureForm.useCase,
          email: featureForm.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feature request");
      }

      toast.success("Feature request submitted successfully!");
      setSubmitted(true);
      setFeatureForm({
        title: "",
        description: "",
        priority: "medium",
        category: "",
        useCase: "",
        email: "",
      });
    } catch (error) {
      toast.error(
        error.message || "Failed to submit feature request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBugSubmit = async (e) => {
    e.preventDefault();

    if (!bugForm.title || !bugForm.description || !bugForm.stepsToReproduce) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", bugForm.title);
      formData.append("description", bugForm.description);
      formData.append("severity", bugForm.severity);
      formData.append("stepsToReproduce", bugForm.stepsToReproduce);
      if (bugForm.expectedBehavior)
        formData.append("expectedBehavior", bugForm.expectedBehavior);
      if (bugForm.actualBehavior)
        formData.append("actualBehavior", bugForm.actualBehavior);
      if (bugForm.browser) formData.append("browser", bugForm.browser);
      if (bugForm.device) formData.append("device", bugForm.device);
      if (bugForm.email) formData.append("email", bugForm.email);
      if (bugForm.screenshot) formData.append("screenshot", bugForm.screenshot);

      const response = await fetch("/api/feedback/bug", {
        method: "POST",
        headers: {
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit bug report");
      }

      toast.success("Bug report submitted successfully!");
      setSubmitted(true);
      setBugForm({
        title: "",
        description: "",
        severity: "medium",
        stepsToReproduce: "",
        expectedBehavior: "",
        actualBehavior: "",
        browser: "",
        device: "",
        screenshot: null,
        email: "",
      });
    } catch (error) {
      toast.error(
        error.message || "Failed to submit bug report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            className={`p-1 transition-colors ${
              star <= generalForm.rating
                ? "text-yellow-400"
                : "text-gray-600 hover:text-yellow-300"
            }`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= generalForm.rating ? "fill-current" : ""
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-gray-400">
          {generalForm.rating > 0 && (
            <>
              {generalForm.rating}/5
              {generalForm.rating <= 2 && (
                <Frown className="w-5 h-5 ml-1 inline text-red-400" />
              )}
              {generalForm.rating === 3 && (
                <Meh className="w-5 h-5 ml-1 inline text-yellow-400" />
              )}
              {generalForm.rating >= 4 && (
                <Smile className="w-5 h-5 ml-1 inline text-green-400" />
              )}
            </>
          )}
        </span>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4"
        >
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-400 mb-6">
              Your feedback has been submitted successfully. We appreciate you
              taking the time to help us improve Ripple.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setSubmitted(false)} className="w-full">
                Submit More Feedback
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 mb-4">
              We Value Your Feedback
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Help us improve Ripple by sharing your thoughts, suggestions, and
              reporting any issues you encounter.
            </p>
          </div>

          {/* Feedback Type Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {feedbackTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    activeTab === tab.id
                      ? "border-accent-500 bg-accent-500/20"
                      : "border-gray-600 hover:border-gray-500 bg-dark-800"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mb-3 ${
                      activeTab === tab.id ? "text-accent-400" : "text-gray-400"
                    }`}
                  />
                  <h3 className="font-semibold text-gray-100 mb-2">
                    {tab.label}
                  </h3>
                  <p className="text-sm text-gray-400">{tab.description}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback Forms */}
          <Card className="p-6">
            {activeTab === "general" && (
              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    General Feedback
                  </h3>

                  {/* Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Overall Rating *
                    </label>
                    {renderStarRating()}
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={generalForm.category}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-accent-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {generalCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={generalForm.title}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Brief summary of your feedback"
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Feedback *
                    </label>
                    <textarea
                      value={generalForm.description}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Please share your detailed feedback, suggestions, or thoughts..."
                      rows={6}
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500 resize-vertical"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={generalForm.email}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Provide your email if you'd like us to follow up on your
                      feedback
                    </p>
                  </div>

                  {/* Anonymous option */}
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generalForm.anonymous}
                        onChange={(e) =>
                          setGeneralForm((prev) => ({
                            ...prev,
                            anonymous: e.target.checked,
                          }))
                        }
                        className="mr-2 rounded"
                      />
                      <span className="text-gray-300">Submit anonymously</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    icon={
                      isSubmitting ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )
                    }
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "feature" && (
              <form onSubmit={handleFeatureSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Feature Request
                  </h3>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Feature Title *
                    </label>
                    <input
                      type="text"
                      value={featureForm.title}
                      onChange={(e) =>
                        setFeatureForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Concise name for the feature"
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={featureForm.category}
                      onChange={(e) =>
                        setFeatureForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-accent-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {featureCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority Level
                    </label>
                    <div className="space-y-2">
                      {priorityLevels.map((level) => (
                        <label key={level.value} className="flex items-center">
                          <input
                            type="radio"
                            name="priority"
                            value={level.value}
                            checked={featureForm.priority === level.value}
                            onChange={(e) =>
                              setFeatureForm((prev) => ({
                                ...prev,
                                priority: e.target.value,
                              }))
                            }
                            className="mr-3"
                          />
                          <span className={`${level.color} font-medium`}>
                            {level.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Feature Description *
                    </label>
                    <textarea
                      value={featureForm.description}
                      onChange={(e) =>
                        setFeatureForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the feature in detail. What should it do? How should it work?"
                      rows={6}
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500 resize-vertical"
                      required
                    />
                  </div>

                  {/* Use Case */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Use Case (Optional)
                    </label>
                    <textarea
                      value={featureForm.useCase}
                      onChange={(e) =>
                        setFeatureForm((prev) => ({
                          ...prev,
                          useCase: e.target.value,
                        }))
                      }
                      placeholder="Describe when and why you would use this feature. What problem does it solve?"
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500 resize-vertical"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={featureForm.email}
                      onChange={(e) =>
                        setFeatureForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    icon={
                      isSubmitting ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <Lightbulb className="w-4 h-4" />
                      )
                    }
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feature Request"}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "bug" && (
              <form onSubmit={handleBugSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Bug Report
                  </h3>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bug Title *
                    </label>
                    <input
                      type="text"
                      value={bugForm.title}
                      onChange={(e) =>
                        setBugForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Brief description of the bug"
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                      required
                    />
                  </div>

                  {/* Severity */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Severity Level
                    </label>
                    <div className="space-y-2">
                      {severityLevels.map((level) => (
                        <label key={level.value} className="flex items-center">
                          <input
                            type="radio"
                            name="severity"
                            value={level.value}
                            checked={bugForm.severity === level.value}
                            onChange={(e) =>
                              setBugForm((prev) => ({
                                ...prev,
                                severity: e.target.value,
                              }))
                            }
                            className="mr-3"
                          />
                          <span className={`${level.color} font-medium`}>
                            {level.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bug Description *
                    </label>
                    <textarea
                      value={bugForm.description}
                      onChange={(e) =>
                        setBugForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe what went wrong and what you were trying to do"
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500 resize-vertical"
                      required
                    />
                  </div>

                  {/* Steps to Reproduce */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Steps to Reproduce *
                    </label>
                    <textarea
                      value={bugForm.stepsToReproduce}
                      onChange={(e) =>
                        setBugForm((prev) => ({
                          ...prev,
                          stepsToReproduce: e.target.value,
                        }))
                      }
                      placeholder="1. Go to... 2. Click on... 3. See error..."
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500 resize-vertical"
                      required
                    />
                  </div>

                  {/* Expected vs Actual Behavior */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expected Behavior
                      </label>
                      <textarea
                        value={bugForm.expectedBehavior}
                        onChange={(e) =>
                          setBugForm((prev) => ({
                            ...prev,
                            expectedBehavior: e.target.value,
                          }))
                        }
                        placeholder="What should have happened?"
                        rows={3}
                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500 resize-vertical"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Actual Behavior
                      </label>
                      <textarea
                        value={bugForm.actualBehavior}
                        onChange={(e) =>
                          setBugForm((prev) => ({
                            ...prev,
                            actualBehavior: e.target.value,
                          }))
                        }
                        placeholder="What actually happened?"
                        rows={3}
                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500 resize-vertical"
                      />
                    </div>
                  </div>

                  {/* Environment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Browser & Version
                      </label>
                      <input
                        type="text"
                        value={bugForm.browser}
                        onChange={(e) =>
                          setBugForm((prev) => ({
                            ...prev,
                            browser: e.target.value,
                          }))
                        }
                        placeholder="e.g., Chrome 119, Firefox 120"
                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Device & OS
                      </label>
                      <input
                        type="text"
                        value={bugForm.device}
                        onChange={(e) =>
                          setBugForm((prev) => ({
                            ...prev,
                            device: e.target.value,
                          }))
                        }
                        placeholder="e.g., iPhone 14, Windows 11"
                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Screenshot (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 mb-2">
                        Click to upload a screenshot
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setBugForm((prev) => ({
                            ...prev,
                            screenshot: e.target.files[0],
                          }))
                        }
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="cursor-pointer text-accent-400 hover:text-accent-300"
                      >
                        Choose File
                      </label>
                      {bugForm.screenshot && (
                        <p className="text-sm text-green-400 mt-2">
                          {bugForm.screenshot.name} selected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={bugForm.email}
                      onChange={(e) =>
                        setBugForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    icon={
                      isSubmitting ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <Bug className="w-4 h-4" />
                      )
                    }
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <Card className="p-6 bg-accent-900/20 border-accent-500/30">
              <AlertCircle className="w-6 h-6 text-accent-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-100 mb-2">
                Need Immediate Help?
              </h4>
              <p className="text-gray-400 mb-4">
                For urgent issues or immediate support, please contact us
                directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm">
                  Live Chat
                </Button>
                <Button variant="outline" size="sm">
                  Email Support
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
