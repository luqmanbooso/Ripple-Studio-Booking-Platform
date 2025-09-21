import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Lightbulb,
  Bug,
  Filter,
  Search,
  Star,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Eye,
  Reply,
  UserX,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    category: "",
    priority: "",
    severity: "",
    search: "",
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const feedbackTypes = [
    { value: "", label: "All Types" },
    { value: "general", label: "General Feedback", icon: MessageSquare },
    { value: "feature", label: "Feature Requests", icon: Lightbulb },
    { value: "bug", label: "Bug Reports", icon: Bug },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "in_review", label: "In Review", color: "blue" },
    { value: "in_progress", label: "In Progress", color: "purple" },
    { value: "resolved", label: "Resolved", color: "green" },
    { value: "rejected", label: "Rejected", color: "red" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "low", label: "Low", color: "green" },
    { value: "medium", label: "Medium", color: "yellow" },
    { value: "high", label: "High", color: "orange" },
    { value: "critical", label: "Critical", color: "red" },
  ];

  useEffect(() => {
    fetchFeedback();
    fetchAnalytics();
  }, [filters]);

  const fetchFeedback = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/feedback/admin/all?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data.data.docs || []);
      }
    } catch (error) {
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/feedback/admin/analytics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics");
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      const response = await fetch(`/api/feedback/admin/${feedbackId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setFeedback((prev) =>
          prev.map((item) =>
            item._id === feedbackId ? { ...item, status: newStatus } : item
          )
        );
        toast.success("Status updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const submitResponse = async () => {
    if (!responseMessage.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    setSubmittingResponse(true);
    try {
      const response = await fetch(
        `/api/feedback/admin/${selectedFeedback._id}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ message: responseMessage }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setFeedback((prev) =>
          prev.map((item) =>
            item._id === selectedFeedback._id ? data.data.feedback : item
          )
        );
        setShowModal(false);
        setResponseMessage("");
        setSelectedFeedback(null);
        toast.success("Response sent successfully");
      }
    } catch (error) {
      toast.error("Failed to send response");
    } finally {
      setSubmittingResponse(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-400 bg-yellow-400/20",
      in_review: "text-blue-400 bg-blue-400/20",
      in_progress: "text-purple-400 bg-purple-400/20",
      resolved: "text-green-400 bg-green-400/20",
      rejected: "text-red-400 bg-red-400/20",
    };
    return colors[status] || "text-gray-400 bg-gray-400/20";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-green-400",
      medium: "text-yellow-400",
      high: "text-orange-400",
      critical: "text-red-400",
    };
    return colors[priority] || "text-gray-400";
  };

  const getTypeIcon = (type) => {
    const icons = {
      general: MessageSquare,
      feature: Lightbulb,
      bug: Bug,
    };
    return icons[type] || MessageSquare;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Feedback Management
          </h1>
          <p className="text-gray-400">
            Manage user feedback, feature requests, and bug reports
          </p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Feedback</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.summary.total}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </Card>

            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {analytics.summary.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>

            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Resolved</p>
                  <p className="text-2xl font-bold text-green-400">
                    {analytics.summary.resolved}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </Card>

            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Resolution Rate</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {analytics.summary.resolutionRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-8 bg-slate-800 border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {feedbackTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {priorityOptions.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  type: "",
                  status: "",
                  category: "",
                  priority: "",
                  severity: "",
                  search: "",
                })
              }
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <Card className="p-8 text-center bg-slate-800 border-slate-700">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No feedback found</p>
            </Card>
          ) : (
            feedback.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <TypeIcon className="w-6 h-6 text-blue-400 mt-1" />

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {item.title || `${item.type} feedback`}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                            {item.type === "general" && item.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < item.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-500"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            {(item.priority || item.severity) && (
                              <span
                                className={`text-sm font-medium ${getPriorityColor(item.priority || item.severity)}`}
                              >
                                {item.priority || item.severity} priority
                              </span>
                            )}
                          </div>

                          <p className="text-gray-300 mb-3 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              {item.user ? (
                                <>
                                  <User className="w-4 h-4" />
                                  <span>{item.user.name}</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-4 h-4" />
                                  <span>Anonymous</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                            {item.category && (
                              <span className="bg-slate-700 px-2 py-1 rounded text-xs">
                                {item.formattedCategory}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedFeedback(item);
                            setShowModal(true);
                          }}
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </Button>

                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateFeedbackStatus(item._id, e.target.value)
                          }
                          className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        >
                          {statusOptions.slice(1).map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Feedback Detail Modal */}
        {showModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Feedback Details
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    {selectedFeedback.title ||
                      `${selectedFeedback.type} feedback`}
                  </h3>
                  <p className="text-gray-300">
                    {selectedFeedback.description}
                  </p>
                </div>

                {selectedFeedback.type === "bug" &&
                  selectedFeedback.stepsToReproduce && (
                    <div>
                      <h4 className="font-medium text-white mb-1">
                        Steps to Reproduce:
                      </h4>
                      <p className="text-gray-300">
                        {selectedFeedback.stepsToReproduce}
                      </p>
                    </div>
                  )}

                {selectedFeedback.useCase && (
                  <div>
                    <h4 className="font-medium text-white mb-1">Use Case:</h4>
                    <p className="text-gray-300">{selectedFeedback.useCase}</p>
                  </div>
                )}

                {selectedFeedback.response ? (
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">
                      Admin Response:
                    </h4>
                    <p className="text-gray-300">
                      {selectedFeedback.response.message}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Responded on{" "}
                      {formatDate(selectedFeedback.response.respondedAt)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-3">
                      Send Response:
                    </h4>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Type your response..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={submitResponse}
                        disabled={submittingResponse}
                        icon={
                          submittingResponse ? (
                            <Spinner className="w-4 h-4" />
                          ) : (
                            <Reply className="w-4 h-4" />
                          )
                        }
                      >
                        {submittingResponse ? "Sending..." : "Send Response"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
