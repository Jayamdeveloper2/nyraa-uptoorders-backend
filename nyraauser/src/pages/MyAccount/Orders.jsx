"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal"
import {
  ViewOrderButton,
  CancelOrderButton,
  InvoiceButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { orderService } from "../../services/orderService"
import ImageViewer from "react-simple-image-viewer"

const Orders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    itemToDelete: null,
    actionType: "cancel",
    title: "Confirm Order Cancellation",
  })
  const [currentImage, setCurrentImage] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [serverStatus, setServerStatus] = useState("checking")
  const [authStatus, setAuthStatus] = useState("checking")

  useEffect(() => {
    checkSystemAndFetchOrders()
  }, [])

  const checkSystemAndFetchOrders = async () => {
    try {
      setLoading(true)
      setServerStatus("checking")
      setAuthStatus("checking")

      // Step 1: Check server connection
      console.log("🔍 Step 1: Checking server connection...")
      await orderService.testConnection()
      setServerStatus("online")
      console.log("✅ Server is online")

      // Step 2: Check authentication
      console.log("🔍 Step 2: Checking authentication...")
      try {
        await orderService.testAuth()
        setAuthStatus("authenticated")
        console.log("✅ Authentication successful")

        // Step 3: Fetch orders
        console.log("🔍 Step 3: Fetching orders...")
        await fetchOrders()
      } catch (authError) {
        console.error("❌ Authentication failed:", authError)
        setAuthStatus("unauthenticated")
        setLoading(false)

        toast.error("Please log in to view your orders", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch (serverError) {
      console.error("❌ Server check failed:", serverError)
      setServerStatus("offline")
      setLoading(false)

      toast.error("Cannot connect to the server. Please ensure the backend is running.", {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true)
      const result = await orderService.getUserOrders(page, 10)

      if (result.success) {
        setOrders(result.orders)
        setPagination(result.pagination)
        console.log(`✅ Loaded ${result.orders.length} orders`)
      } else {
        toast.error(result.message || "Failed to fetch orders", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error(error.message || "Failed to fetch orders", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl)
    setIsViewerOpen(true)
  }

  const closeImageViewer = () => {
    setCurrentImage(null)
    setIsViewerOpen(false)
  }

  const isCancelEligible = (order) => {
    return ["pending", "processing"].includes(order.status)
  }

  const handleCancelPrompt = (orderId) => {
    setModalConfig({
      itemToDelete: orderId,
      actionType: "cancel",
      title: "Confirm Order Cancellation",
    })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = async () => {
    if (modalConfig.actionType === "cancel" && modalConfig.itemToDelete) {
      try {
        const result = await orderService.updateOrderStatus(
          modalConfig.itemToDelete,
          "cancelled",
          "Order cancelled by user",
        )

        if (result.success) {
          toast.success("Order cancelled successfully!", {
            position: "top-right",
            autoClose: 3000,
          })
          // Refresh orders list
          fetchOrders(pagination.currentPage)
        } else {
          toast.error(result.message || "Failed to cancel order", {
            position: "top-right",
            autoClose: 3000,
          })
        }
      } catch (error) {
        console.error("Error cancelling order:", error)
        toast.error(error.message || "Failed to cancel order", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    }
    setShowConfirmModal(false)
  }

  const handleCancelAction = () => {
    setShowConfirmModal(false)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-success"
      case "cancelled":
        return "bg-danger"
      case "shipped":
        return "bg-info"
      case "processing":
        return "bg-primary"
      default:
        return "bg-warning"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Replace the existing getProductImage function with this corrected version:
  const getProductImage = (item) => {
    // Try multiple sources for product image with proper URL handling
    if (item.productImage) {
      if (item.productImage.startsWith("http")) {
        return item.productImage
      }
      // Use relative path that will be served by express static middleware
      return `/uploads/products/${item.productImage}`
    }

    if (item.product?.images && item.product.images.length > 0) {
      const firstImage = item.product.images[0]
      if (typeof firstImage === "string") {
        if (firstImage.startsWith("http")) {
          return firstImage
        }
        return `/uploads/products/${firstImage}`
      }
      if (typeof firstImage === "object" && firstImage.url) {
        if (firstImage.url.startsWith("http")) {
          return firstImage.url
        }
        return `/uploads/products/${firstImage.url}`
      }
    }

    return "/placeholder.svg?height=80&width=80&text=Product"
  }

  // Get product name with fallback
  const getProductName = (item) => {
    return item.productName || item.product?.name || "Product"
  }

  // Show server offline status
  if (serverStatus === "offline") {
    return (
      <div className="orders-container">
        <div className="text-center py-4">
          <div className="alert alert-danger">
            <h4>🔌 Server Connection Failed</h4>
            <p>Cannot connect to the backend server. Please ensure:</p>
            <ul className="text-start">
              <li>Your backend server is running on http://localhost:5000</li>
              <li>The database connection is working</li>
              <li>The orders tables have been created in your database</li>
            </ul>
            <button className="btn btn-primary" onClick={checkSystemAndFetchOrders}>
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication required status
  if (authStatus === "unauthenticated") {
    return (
      <div className="orders-container">
        <div className="text-center py-4">
          <div className="alert alert-warning">
            <h4>🔐 Authentication Required</h4>
            <p>You need to be logged in to view your orders.</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={() => navigate("/login")}>
                Go to Login
              </button>
              <button className="btn btn-secondary" onClick={checkSystemAndFetchOrders}>
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading status
  if (loading || serverStatus === "checking" || authStatus === "checking") {
    return (
      <div className="orders-container">
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">
            {serverStatus === "checking" && "Connecting to server..."}
            {serverStatus === "online" && authStatus === "checking" && "Checking authentication..."}
            {authStatus === "authenticated" && "Loading your orders..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Your Orders</h2>
        <div className="d-flex gap-2">
          <span className="badge bg-success">🟢 Server Online</span>
          <span className="badge bg-success">🔐 Authenticated</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-4 my-3 bg-light rounded-4 shadow-sm">
          <h5>No orders found</h5>
          <p className="text-muted">Start shopping to place your first order.</p>
          <button className="btn btn-primary" onClick={() => navigate("/products")}>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {orders.map((order) => (
              <div key={order.id} className="col-12">
                <div className="card border-0 shadow-lg rounded-4">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <div>
                        <h5 className="card-title mb-0 fw-semibold">Order #{order.orderNumber}</h5>
                        <p className="text-muted small mb-0">Placed on {formatDate(order.orderDate)}</p>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <span className={`badge ${getStatusBadgeClass(order.status)} rounded-pill px-2 py-1`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="order-details ps-1 mb-3">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="d-flex mb-2 align-items-center">
                          <img
                            src={getProductImage(item) || "/placeholder.svg"}
                            alt={getProductName(item)}
                            className="item-image me-2"
                            onClick={() => openImageViewer(getProductImage(item))}
                            style={{ cursor: "pointer" }}
                            loading="lazy" // Add lazy loading
                            onError={(e) => {
                              // Prevent infinite error loops
                              if (e.target.src !== "/placeholder.svg?height=80&width=80&text=Product") {
                                e.target.src = "/placeholder.svg?height=80&width=80&text=Product"
                              }
                            }}
                          />
                          <div>
                            <p className="mb-0">
                              {getProductName(item)} (x{item.quantity})
                            </p>
                            <p className="text-muted small mb-0">₹{Number.parseFloat(item.totalPrice).toFixed(2)}</p>
                            {item.variant && (
                              <p className="text-muted small mb-0">
                                {item.variant.color && `Color: ${item.variant.color}`}
                                {item.variant.size && ` | Size: ${item.variant.size}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-muted small mb-0">+{order.items.length - 2} more items</p>
                      )}
                      <p className="fw-semibold mt-2">Total: ₹{Number.parseFloat(order.total).toFixed(2)}</p>
                      {order.trackingNumber && (
                        <p className="text-muted small mb-0">Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <ViewOrderButton onClick={() => navigate(`/account/orders/${order.id}`)} />
                      <InvoiceButton onClick={() => navigate(`/account/invoices/${order.id}`)} />
                      {isCancelEligible(order) && <CancelOrderButton onClick={() => handleCancelPrompt(order.id)} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${!pagination.hasPrev ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => fetchOrders(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </button>
                  </li>

                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <li key={index + 1} className={`page-item ${pagination.currentPage === index + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => fetchOrders(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${!pagination.hasNext ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => fetchOrders(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        actionType={modalConfig.actionType}
        confirmButtonText="Cancel Order"
      />

      {isViewerOpen && (
        <ImageViewer
          src={[currentImage] || "/placeholder.svg"}
          currentIndex={0}
          disableScroll={false}
          closeOnClickOutside={true}
          onClose={closeImageViewer}
          backgroundStyle={{
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999,
          }}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        .orders-container {
          font-family: 'Open Sans', sans-serif;
          padding: 1.5rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        h2 { 
          font-size: 1.5rem; 
          font-weight: 700;
          color: #222;
        }
        h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
        }
        p {
          font-size: 0.9rem;
          color: #333;
        }
        .card {
          border-radius: 10px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
        }
        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.2s;
        }
        .item-image:hover {
          transform: scale(1.05);
        }
        .text-muted {
          font-size: 0.85rem;
          color: #666;
        }
        .badge {
          font-size: 0.75rem;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        .pagination .page-link {
          color: #C5A47E;
          border-color: #C5A47E;
        }
        .pagination .page-item.active .page-link {
          background-color: #C5A47E;
          border-color: #C5A47E;
        }
        .pagination .page-link:hover {
          color: #b58963;
          border-color: #b58963;
        }
        .alert-warning {
          background-color: #fff3cd;
          border-color: #ffecb5;
          color: #664d03;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .alert-danger {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
          padding: 1.5rem;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .orders-container {
            padding: 1rem 0.75rem;
          }
          h2 {
            font-size: 1.3rem;
          }
          h5 {
            font-size: 1rem;
          }
          p {
            font-size: 0.85rem;
          }
          .item-image {
            width: 60px;
            height: 60px;
          }
          .badge {
            font-size: 0.7rem;
          }
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .orders-container {
            padding: 0.75rem 0.5rem;
          }
          h2 {
            font-size: 1.2rem;
          }
          h5 {
            font-size: 0.95rem;
          }
          p {
            font-size: 0.8rem;
          }
          .item-image {
            width: 50px;
            height: 50px;
          }
          .badge {
            font-size: 0.65rem;
          }
          .btn {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
          .d-flex.gap-2 {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Orders
