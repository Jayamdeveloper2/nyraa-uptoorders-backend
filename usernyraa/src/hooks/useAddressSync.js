"use client"

import { useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchAddresses } from "../store/addressSlice"
import { syncAddressData, getDefaultAddress } from "../utils/addressSync"

export const useAddressSync = () => {
  const dispatch = useDispatch()
  const { addresses, loading, error } = useSelector((state) => state.addresses)

  // Fetch addresses on mount
  useEffect(() => {
    dispatch(fetchAddresses())
  }, [dispatch])

  // Sync and format addresses
  const syncedAddresses = useCallback(() => {
    return syncAddressData(addresses)
  }, [addresses])

  // Get default address
  const defaultAddress = useCallback(() => {
    return getDefaultAddress(addresses)
  }, [addresses])

  // Refresh addresses
  const refreshAddresses = useCallback(() => {
    dispatch(fetchAddresses())
  }, [dispatch])

  return {
    addresses: syncedAddresses(),
    defaultAddress: defaultAddress(),
    loading,
    error,
    refreshAddresses,
  }
}
