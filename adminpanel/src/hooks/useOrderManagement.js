"use client"

import { useState, useCallback } from "react"
import { orderAPI } from "../services/api"
import { transformOrderData, calculateOrderStats } from "../utils/orderHelpers"

export const useOrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState({})
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  })

  const fetchOrders = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)

      const response = await orderAPI.getAllOrders(params)

      if (response.success) {
        const transformedOrders = response.orders.map(transformOrderData)
        setOrders(transformedOrders)
        setStats(calculateOrderStats(transformedOrders))
        return response
      } else {
        throw new Error(response.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError(error.message)
      setOrders([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateOrderStatus = useCallback(async (orderId, newStatus, comment = "") => {
    try {
      setUpdating((prev) => ({ ...prev, [orderId]: true }))

      const response = await orderAPI.updateOrderStatus(orderId, {
        status: newStatus,
        comment: comment || `Status updated to ${newStatus}`,
      })

      if (response.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
        )

        // Recalculate stats
        setOrders((prevOrders) => {
          setStats(calculateOrderStats(prevOrders))
          return prevOrders
        })

        return { success: true, message: "Order status updated successfully" }
      } else {
        throw new Error(response.message || "Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      return { success: false, message: error.message }
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }))
    }
  }, [])

  const getOrderDetails = useCallback(async (orderId) => {
    try {
      const response = await orderAPI.getOrder(orderId)
      if (response.success) {
        return transformOrderData(response.order)
      } else {
        throw new Error(response.message || "Failed to fetch order details")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      throw error
    }
  }, [])

  const createOrder = useCallback(async (orderData) => {
    try {
      const response = await orderAPI.createOrder(orderData)
      if (response.success) {
        const newOrder = transformOrderData(response.order)
        setOrders((prevOrders) => [newOrder, ...prevOrders])

        // Recalculate stats
        setOrders((prevOrders) => {
          setStats(calculateOrderStats(prevOrders))
          return prevOrders
        })

        return { success: true, order: newOrder }
      } else {
        throw new Error(response.message || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      return { success: false, message: error.message }
    }
  }, [])

  const refreshOrders = useCallback(() => {
    return fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    updating,
    stats,
    fetchOrders,
    updateOrderStatus,
    getOrderDetails,
    createOrder,
    refreshOrders,
  }
}
