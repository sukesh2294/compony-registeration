import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  User,
  Archive,
  Reply,
  Eye,
  EyeOff,
  ChevronDown,
  Download,
  MoreVertical,
  X,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import companyService from "../services/companyService";
import { format } from "date-fns";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    responded: 0,
    pending: 0,
  });

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await companyService.getInquiries();
      setInquiries(response.data || []);
      
      // Calculate stats
      const total = response.data?.length || 0;
      const unread = response.data?.filter(i => !i.read).length || 0;
      const responded = response.data?.filter(i => i.status === 'responded').length || 0;
      const pending = response.data?.filter(i => i.status === 'pending').length || 0;
      
      setStats({ total, unread, responded, pending });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load inquiries");
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Apply filters
  useEffect(() => {
    let result = [...inquiries];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (inquiry) =>
          inquiry.name?.toLowerCase().includes(term) ||
          inquiry.email?.toLowerCase().includes(term) ||
          inquiry.subject?.toLowerCase().includes(term) ||
          inquiry.message?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((inquiry) => {
        if (statusFilter === "unread") return !inquiry.read;
        if (statusFilter === "read") return inquiry.read;
        if (statusFilter === "responded") return inquiry.status === "responded";
        if (statusFilter === "pending") return inquiry.status === "pending";
        if (statusFilter === "archived") return inquiry.archived;
        return true;
      });
    }

    // Date filter (simplified - in real app, filter by actual dates)
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter((inquiry) => {
        const inquiryDate = new Date(inquiry.createdAt);
        const diffDays = Math.floor((now - inquiryDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === "today") return diffDays === 0;
        if (dateFilter === "week") return diffDays <= 7;
        if (dateFilter === "month") return diffDays <= 30;
        return true;
      });
    }

    // Sort by latest first
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredInquiries(result);
  }, [inquiries, searchTerm, statusFilter, dateFilter]);

  // Mark as read/unread
  const toggleReadStatus = useCallback(async (id, currentStatus) => {
    try {
      await companyService.updateInquiryStatus(id, { read: !currentStatus });
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === id ? { ...inquiry, read: !currentStatus } : inquiry
        )
      );
    } catch (err) {
      console.error("Error updating read status:", err);
    }
  }, []);

  // Archive inquiry
  const archiveInquiry = useCallback(async (id) => {
    try {
      await companyService.archiveInquiry(id);
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === id ? { ...inquiry, archived: true } : inquiry
        )
      );
    } catch (err) {
      console.error("Error archiving inquiry:", err);
    }
  }, []);

  // Send reply
  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedInquiry) return;
    
    try {
      setSendingReply(true);
      await companyService.replyToInquiry(selectedInquiry.id, {
        message: replyText,
      });
      
      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === selectedInquiry.id 
            ? { ...inquiry, status: 'responded', read: true } 
            : inquiry
        )
      );
      
      setReplyText("");
      setSelectedInquiry(prev => ({ ...prev, status: 'responded' }));
      
      // Show success message (could use toast in real app)
      alert("Reply sent successfully!");
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send reply. Please try again.");
    } finally {
      setSendingReply(false);
    }
  }, [replyText, selectedInquiry]);

  // Get status badge style
  const getStatusBadge = (inquiry) => {
    if (inquiry.archived) {
      return "bg-gray-100 text-gray-800";
    }
    if (inquiry.status === "responded") {
      return "bg-green-100 text-green-800";
    }
    if (inquiry.read) {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-yellow-100 text-yellow-800";
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return format(date, "h:mm a");
      } else if (diffHours < 168) {
        return format(date, "EEE");
      }
      return format(date, "MMM d");
    } catch {
      return "—";
    }
  };

  // Stats cards
  const statCards = [
    {
      label: "Total Inquiries",
      value: stats.total,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Unread",
      value: stats.unread,
      icon: <EyeOff className="w-5 h-5" />,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "Responded",
      value: stats.responded,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="w-5 h-5" />,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <DashboardLayout title="Inquiries">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Inquiries</h1>
            <p className="text-gray-600 mt-1">Manage and respond to customer messages</p>
          </div>
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 bg-red-50 border-red-500 text-red-800">
          <AlertCircle className="mt-0.5" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button 
            onClick={fetchInquiries}
            className="text-sm font-medium text-red-800 hover:text-red-900"
          >
            Try again
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Inquiries List */}
        <div className="lg:w-2/3">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inquiries List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading inquiries...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
                <div className="p-4 rounded-full bg-gray-100 text-gray-400 mb-4">
                  <MessageSquare className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm || statusFilter !== "all" || dateFilter !== "all" 
                    ? "No matching inquiries" 
                    : "No inquiries yet"}
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                    ? "Try changing your search or filter criteria"
                    : "Customer inquiries will appear here when they contact you through your profile."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                      selectedInquiry?.id === inquiry.id ? "bg-blue-50" : ""
                    } ${!inquiry.read ? "bg-yellow-50" : ""}`}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">
                              {inquiry.name || "Anonymous"}
                            </span>
                            {!inquiry.read && (
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {formatDate(inquiry.createdAt)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(inquiry)}`}>
                              {inquiry.archived ? "Archived" : 
                               inquiry.status === "responded" ? "Responded" :
                               inquiry.read ? "Read" : "Unread"}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                          {inquiry.subject || "No subject"}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {inquiry.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail size={14} />
                            {inquiry.email}
                          </span>
                          {inquiry.phone && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Phone size={14} />
                              {inquiry.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Selected Inquiry Details */}
        <div className="lg:w-1/3">
          {selectedInquiry ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Inquiry Details</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Sender Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Sender Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedInquiry.name}</p>
                        <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                      </div>
                    </div>
                    {selectedInquiry.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{selectedInquiry.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-700">
                        {format(new Date(selectedInquiry.createdAt), "PPpp")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inquiry Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Inquiry</h4>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{selectedInquiry.subject}</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleReadStatus(selectedInquiry.id, selectedInquiry.read)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                    >
                      {selectedInquiry.read ? <EyeOff size={16} /> : <Eye size={16} />}
                      {selectedInquiry.read ? "Mark as Unread" : "Mark as Read"}
                    </button>
                    <button
                      onClick={() => archiveInquiry(selectedInquiry.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                    >
                      <Archive size={16} />
                      Archive
                    </button>
                  </div>
                </div>

                {/* Reply Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Send Reply</h4>
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                      rows="4"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendingReply}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <Reply size={16} />
                        {sendingReply ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="p-4 rounded-full bg-gray-100 text-gray-400 inline-flex mb-4">
                <MessageSquare className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select an Inquiry
              </h3>
              <p className="text-gray-500">
                Click on any inquiry from the list to view details and respond
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// You'll need to add these functions to your companyService.js:
/*
companyService.getInquiries = async () => {
  return api.get('/inquiries');
}

companyService.updateInquiryStatus = async (id, data) => {
  return api.patch(`/inquiries/${id}`, data);
}

companyService.archiveInquiry = async (id) => {
  return api.post(`/inquiries/${id}/archive`);
}

companyService.replyToInquiry = async (id, data) => {
  return api.post(`/inquiries/${id}/reply`, data);
}
*/

// Also add RefreshCw to imports from lucide-react