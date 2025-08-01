// Utility functions for address synchronization between components
export const syncAddressData = (addresses) => {
  // Ensure all addresses have required fields
  return addresses.map((address) => ({
    id: address.id,
    name: address.name || "",
    street: address.street || "",
    city: address.city || "",
    state: address.state || "",
    zip: address.zip || "",
    country: address.country || "United States",
    phone: address.phone || "",
    type: address.type || "home",
    isDefault: Boolean(address.isDefault),
    createdAt: address.createdAt || new Date().toISOString(),
    updatedAt: address.updatedAt || new Date().toISOString(),
  }))
}

export const validateAddressForCheckout = (address) => {
  const requiredFields = ["name", "street", "city", "state", "zip", "phone"]
  const missingFields = requiredFields.filter((field) => !address[field] || address[field].trim() === "")

  return {
    isValid: missingFields.length === 0,
    missingFields,
    errors: missingFields.map((field) => `${field.charAt(0).toUpperCase() + field.slice(1)} is required`),
  }
}

export const formatAddressForDisplay = (address) => {
  return {
    ...address,
    fullAddress: `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`,
    displayName: `${address.name} (${address.type})`,
    isComplete: validateAddressForCheckout(address).isValid,
  }
}

export const getDefaultAddress = (addresses) => {
  return addresses.find((addr) => addr.isDefault) || addresses[0] || null
}

export const sortAddressesByDefault = (addresses) => {
  return [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })
}
