
import { useState } from "react"
import { Search, Download, Eye, Truck, Package, CheckCircle, Clock } from "lucide-react"
import { useToast } from "../context/ToastContext"
import Modal from "../components/Modal"

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { addToast } = useToast()

  const [orders, setOrders] = useState([
    {
      id: "#NY1234",
      customer: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 98765 43210",
      products: [{ name: "Elegant Rose Gold Dress", quantity: 1, price: 2999 }],
      date: "2024-03-15",
      status: "Delivered",
      total: 2999,
      paymentStatus: "Paid",
      paymentMethod: "Credit Card",
      shippingAddress: "123 Main St, Mumbai, Maharashtra 400001",
      trackingNumber: "TRK123456789",
    },
    {
      id: "#NY1235",
      customer: "Rahul Kumar",
      email: "rahul@example.com",
      phone: "+91 98765 43211",
      products: [{ name: "Chic Summer Dress", quantity: 1, price: 1499 }],
      date: "2024-03-14",
      status: "Processing",
      total: 1499,
      paymentStatus: "Paid",
      paymentMethod: "UPI",
      shippingAddress: "456 Park Ave, Delhi, Delhi 110001",
      trackingNumber: "TRK123456790",
    },
    {
      id: "#NY1236",
      customer: "Anita Singh",
      email: "anita@example.com",
      phone: "+91 98765 43212",
      products: [
        { name: "Floral Maxi Dress", quantity: 2, price: 1800 },
        { name: "Classic Yellow Top", quantity: 1, price: 1499 },
      ],
      date: "2024-03-13",
      status: "Shipped",
      total: 3299,
      paymentStatus: "Paid",
      paymentMethod: "Debit Card",
      shippingAddress: "789 Oak St, Bangalore, Karnataka 560001",
      trackingNumber: "TRK123456791",
    },
    {
      id: "#NY1237",
      customer: "Vikram Patel",
      email: "vikram@example.com",
      phone: "+91 98765 43213",
      products: [{ name: "Casual Denim Shirt", quantity: 1, price: 899 }],
      date: "2024-03-12",
      status: "Pending",
      total: 899,
      paymentStatus: "Pending",
      paymentMethod: "COD",
      shippingAddress: "321 Pine St, Pune, Maharashtra 411001",
      trackingNumber: "",
    },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Shipped":
        return "bg-blue-100 text-blue-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-gray-100 text-gray-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle size={16} />
      case "Shipped":
        return <Truck size={16} />
      case "Processing":
        return <Package size={16} />
      case "Pending":
        return <Clock size={16} />
      default:
        return <Clock size={16} />
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    addToast(`Order ${orderId} status updated to ${newStatus}`, "success")
  }

  const openOrderModal = (order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          <Download size={20} />
          Export Orders
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Orders Table */}
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
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-medium text-indigo-600">{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{order.products.length} item(s)</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{order.date}</span>
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
                        order.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</span>
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
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="Order Details" size="xl">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedOrder.id}</h3>
                <p className="text-gray-600">Placed on {selectedOrder.date}</p>
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

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Name:</span> {selectedOrder.customer}
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span> {selectedOrder.email}
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span> {selectedOrder.phone}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                {selectedOrder.trackingNumber && (
                  <p className="mt-2">
                    <span className="text-gray-600">Tracking:</span> {selectedOrder.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.products.map((product, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.quantity}</td>
                        <td className="py-3 px-4">₹{product.price}</td>
                        <td className="py-3 px-4">₹{product.quantity * product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p>
                  <span className="text-gray-600">Payment Method:</span> {selectedOrder.paymentMethod}
                </p>
                <p>
                  <span className="text-gray-600">Payment Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      selectedOrder.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">Total: ₹{selectedOrder.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
