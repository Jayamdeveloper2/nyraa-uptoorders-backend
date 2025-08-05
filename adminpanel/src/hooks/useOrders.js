"use client"

import { useState, useEffect } from "react"
import { orderAPI } from "../services/api"

export const useOrders = (initialFilters = {}) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const fetchOrders = async (page = 1, filters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        limit: pagination.limit,
        ...initialFilters,
        ...filters,
      }

      const response = await orderAPI.getAllOrders(params)

      if (response.success) {
        setOrders(response.orders || [])
        setPagination(
          response.pagination || {
            total: response.orders?.length || 0,
            page: page,
            limit: pagination.limit,
            totalPages: Math.ceil((response.orders?.length || 0) / pagination.limit),
          },
        )
      } else {
        throw new Error(response.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError(error.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus, comment = "") => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, {
        status: newStatus,
        comment: comment || `Status updated to ${newStatus}`,
      })

      if (response.success) {
        // Update the order in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
        )
        return { success: true, message: "Order status updated successfully" }
      } else {
        throw new Error(response.message || "Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      return { success: false, message: error.message }
    }
  }

  const refreshOrders = () => {
    fetchOrders(pagination.page)
  }

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshOrders()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loading, pagination.page])

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    updateOrderStatus,
    refreshOrders,
  }
}
