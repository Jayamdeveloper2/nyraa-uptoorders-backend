"use client";

import { useState, useEffect } from "react";
import { Search, Download, Eye, Truck, Package, CheckCircle, Clock, RefreshCw, Package2, IndianRupee , AlertCircle, XCircle } from 'lucide-react';
import { useToast } from "../context/ToastContext";
import Modal from "../components/Modal";
import { orderAPI } from "../services/api";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });

  const { addToast } = useToast();

  const ORDER_STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  const fetchOrders = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: itemsPerPage,
        ...filters,
      };

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (dateFilter && dateFilter !== "all") {
        const now = new Date();
        const startDate = new Date();

        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            params.startDate = startDate.toISOString();
            params.endDate = now.toISOString();
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            params.startDate = startDate.toISOString();
            params.endDate = now.toISOString();
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            params.startDate = startDate.toISOString();
            params.endDate = now.toISOString();
            break;
        }
      }

      const response = await orderAPI.getAllOrders(params);

      if (response.success) {
        const transformedOrders = response.orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.user?.name || "N/A",
          email: order.user?.email || "N/A",
          phone: order.user?.phone || "N/A",
          products: order.items || [],
          date: order.orderDate
            ? new Date(order.orderDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          status: order.status,
          total: Number.parseFloat(order.total) || 0,
          paymentStatus: order.paymentStatus === "paid" ? "Paid" : "Pending",
          paymentMethod: order.paymentMethod || "N/A",
          shippingAddress: order.shippingAddress || null,
          trackingNumber: order.trackingNumber || "",
          subtotal: Number.parseFloat(order.subtotal) || 0,
          shipping: Number.parseFloat(order.shipping) || 0,
          tax: Number.parseFloat(order.tax) || 0,
          discount: Number.parseFloat(order.discount) || 0,
          specialInstructions: order.specialInstructions || "",
          items: order.items || [],
          statusHistory: order.statusHistory || [],
          user: order.user || {},
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          deliveryDate: order.deliveryDate,
          couponCode: order.couponCode,
        }));

        setOrders(transformedOrders);
        setPagination(
          response.pagination || {
            total: transformedOrders.length,
            page: page,
            limit: itemsPerPage,
            totalPages: Math.ceil(transformedOrders.length / itemsPerPage),
          }
        );

        const stats = {
          totalOrders: transformedOrders.length,
          totalRevenue: transformedOrders.reduce((sum, order) => sum + order.total, 0),
          pendingOrders: transformedOrders.filter((order) => order.status === "pending").length,
          deliveredOrders: transformedOrders.filter((order) => order.status === "delivered").length,
        };
        setOrderStats(stats);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      const errorMessage = error.message.includes("Failed to connect")
        ? "Unable to connect to the server. Please ensure the backend is running on http://localhost:5000."
        : error.message;
      setError(errorMessage);
      addToast(errorMessage, "error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, { status: statusFilter });
  }, [currentPage, statusFilter, dateFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "processing":
        return <Package size={16} />;
      case "confirmed":
        return <AlertCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      case "refunded":
        return <RefreshCw size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customer?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower) ||
      order.phone?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating((prev) => ({ ...prev, [orderId]: true }));

      const response = await orderAPI.updateOrderStatus(orderId, {
        status: newStatus,
        comment: `Status updated to ${newStatus}`,
      });

      if (response.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
        );

        addToast(`Order ${orderId} status updated to ${newStatus}`, "success");
        await fetchOrders(currentPage, { status: statusFilter });
      } else {
        throw new Error(response.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      addToast("Failed to update order status: " + error.message, "error");
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const openOrderModal = async (order) => {
    try {
      const response = await orderAPI.getOrder(order.id);
      if (response.success) {
        const detailedOrder = {
          ...order,
          ...response.order,
          shippingAddress: response.order.shippingAddress,
          items: response.order.items || [],
          statusHistory: response.order.statusHistory || [],
        };
        setSelectedOrder(detailedOrder);
        setShowOrderModal(true);
      } else {
        throw new Error(response.message || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      addToast("Failed to fetch order details: " + error.message, "error");
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const handleRefresh = () => {
    fetchOrders(currentPage, { status: statusFilter });
  };

  const handleExportOrders = async () => {
    try {
      const csvHeaders = [
        "Order Number",
        "Customer",
        "Email",
        "Phone",
        "Date",
        "Status",
        "Payment Status",
        "Total",
        "Items Count",
      ];

      const csvRows = filteredOrders.map((order) => [
        order.orderNumber,
        order.customer,
        order.email,
        order.phone,
        formatDate(order.date),
        order.status,
        order.paymentStatus,
        order.total,
        order.items?.length || 0,
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addToast("Orders exported successfully", "success");
    } catch (error) {
      console.error("Error exporting orders:", error);
      addToast("Failed to export orders", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";

    let addressObj = address;
    if (typeof address === "string") {
      try {
        addressObj = JSON.parse(address);
      } catch (error) {
        console.error("Error parsing address:", error);
        return address;
      }
    }

    if (typeof addressObj !== "object" || !addressObj) return "N/A";

    const parts = [
      addressObj.name,
      addressObj.street,
      `${addressObj.city}, ${addressObj.state} ${addressObj.zip}`,
      addressObj.country,
      addressObj.phone && `Phone: ${addressObj.phone}`,
    ].filter(Boolean);

    return parts.join(", ");
  };

  // Fixed formatVariant function
  const formatVariant = (variant) => {
    if (!variant) {
      return "N/A";
    }

    let variantObj = variant;
    
    // Handle string JSON
    if (typeof variant === "string") {
      try {
        // Handle double-encoded JSON (string within string)
        if (variant.startsWith('"') && variant.endsWith('"')) {
          variantObj = JSON.parse(JSON.parse(variant));
        } else {
          variantObj = JSON.parse(variant);
        }
      } catch (error) {
        console.error("Error parsing variant:", error, "Raw variant:", variant);
        return variant; // Return original string if parsing fails
      }
    }

    // Handle null or undefined
    if (!variantObj || typeof variantObj !== "object") {
      return "N/A";
    }

    // Format the variant object
    const formatted = [];
    
    if (variantObj.color) {
      formatted.push(`Color: ${variantObj.color}`);
    }
    
    if (variantObj.size) {
      formatted.push(`Size: ${variantObj.size}`);
    }
    
    if (variantObj.type) {
      formatted.push(`Type: ${variantObj.type}`);
    }

    return formatted.length > 0 ? formatted.join(", ") : "N/A";
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={20} />
            Export Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package2 size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(orderStats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <IndianRupee  size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.deliveredOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button onClick={handleRefresh} className="mt-2 text-red-800 hover:text-red-900 underline">
            Try again
          </button>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Order ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Products</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Payment</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Total</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 px-6 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 px-6 text-center text-gray-500">
                    {searchQuery ? "No orders found matching your search" : "No orders found"}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-indigo-600">{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">
                        {order.products?.length || order.items?.length || 0} item(s)
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{formatDate(order.date || order.orderDate)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.paymentStatus === "Paid" || order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updating[order.id]}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                          {ORDER_STATUS_OPTIONS.slice(1).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="Order Details" size="xl">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedOrder.orderNumber}</h3>
                <p className="text-gray-600">Placed on {formatDate(selectedOrder.date || selectedOrder.orderDate)}</p>
                {selectedOrder.deliveryDate && (
                  <p className="text-gray-600">Delivered on {formatDate(selectedOrder.deliveryDate)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    {selectedOrder.customer || selectedOrder.user?.name || "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    {selectedOrder.email || selectedOrder.user?.email || "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span>{" "}
                    {selectedOrder.phone || selectedOrder.user?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                <p className="text-gray-700 whitespace-pre-line">{formatAddress(selectedOrder.shippingAddress)}</p>
                {selectedOrder.trackingNumber && (
                  <p className="mt-2">
                    <span className="text-gray-600">Tracking:</span> {selectedOrder.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Variant</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(selectedOrder.items || selectedOrder.products || []).map((item, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4">
                          <p className="font-medium">{item.productName || item.name || "N/A"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-700">{formatVariant(item.variant)}</p>
                        </td>
                        <td className="py-3 px-4">{item.quantity || "N/A"}</td>
                        <td className="py-3 px-4">{formatCurrency(item.price)}</td>
                        <td className="py-3 px-4">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p>
                  <span className="text-gray-600">Payment Method:</span> {selectedOrder.paymentMethod}
                </p>
                <p>
                  <span className="text-gray-600">Payment Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      selectedOrder.paymentStatus === "Paid" || selectedOrder.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </p>
                {selectedOrder.couponCode && (
                  <p>
                    <span className="text-gray-600">Coupon Code:</span> {selectedOrder.couponCode}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  {selectedOrder.subtotal && (
                    <p className="text-sm text-gray-600">Subtotal: {formatCurrency(selectedOrder.subtotal)}</p>
                  )}
                  {selectedOrder.shipping && (
                    <p className="text-sm text-gray-600">Shipping: {formatCurrency(selectedOrder.shipping)}</p>
                  )}
                  {selectedOrder.tax && (
                    <p className="text-sm text-gray-600">Tax: {formatCurrency(selectedOrder.tax)}</p>
                  )}
                  {selectedOrder.discount > 0 && (
                    <p className="text-sm text-gray-600">Discount: -{formatCurrency(selectedOrder.discount)}</p>
                  )}
                  <p className="text-lg font-semibold text-gray-900">Total: {formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
            </div>

            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Status History</h4>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((history, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{history.status}</p>
                        {history.comment && <p className="text-sm text-gray-600">{history.comment}</p>}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{formatDateTime(history.changedAt)}</p>
                        <p>by {history.changedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOrder.specialInstructions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Special Instructions</h4>
                <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{selectedOrder.specialInstructions}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Timeline</h4>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Created:</span> {formatDateTime(selectedOrder.createdAt)}
                  </p>
                  <p>
                    <span className="text-gray-600">Last Updated:</span> {formatDateTime(selectedOrder.updatedAt)}
                  </p>
                  {selectedOrder.deliveryDate && (
                    <p>
                      <span className="text-gray-600">Delivered:</span> {formatDateTime(selectedOrder.deliveryDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;