// src/data/profileData.js

// Initial user profile data (default if no data exists in localStorage)
const initialUserData = {
  email: "johndoe@example.com",
  name: "John Doe",
  phone: "(555) 123-4567",
  joinDate: "June 2023",
};

// Initial addresses (empty by default)
const initialAddresses = [];

// Function to get user data
export const getUserData = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : initialUserData;
};

// Function to update user data
export const updateUserData = (newUserData) => {
  localStorage.setItem("userData", JSON.stringify(newUserData));
};

// Function to get addresses
export const getAddresses = () => {
  const addresses = localStorage.getItem("addresses");
  return addresses ? JSON.parse(addresses) : initialAddresses;
};

// Function to update addresses
export const updateAddresses = (newAddresses) => {
  localStorage.setItem("addresses", JSON.stringify(newAddresses));
};

// Function to add or update an address
export const saveAddress = (address, isEditing = false, editingAddressId = null) => {
  let addresses = getAddresses();
  if (isEditing && editingAddressId) {
    addresses = addresses.map((addr) =>
      addr.id === editingAddressId ? { ...address, id: editingAddressId } : addr
    );
  } else {
    addresses = [...addresses, { ...address, id: Date.now() }];
  }
  if (address.isDefault) {
    addresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === (isEditing ? editingAddressId : address.id),
    }));
  }
  updateAddresses(addresses);
  return addresses;
};

// Function to delete an address
export const deleteAddress = (id) => {
  let addresses = getAddresses();
  const isRemovingDefault = addresses.find((addr) => addr.id === id)?.isDefault;
  addresses = addresses.filter((addr) => addr.id !== id);
  if (isRemovingDefault && addresses.length > 0) {
    addresses[0].isDefault = true;
  }
  updateAddresses(addresses);
  return addresses;
};

// Function to set default address
export const setDefaultAddress = (id) => {
  const addresses = getAddresses().map((addr) => ({
    ...addr,
    isDefault: addr.id === id,
  }));
  updateAddresses(addresses);
  return addresses;
};

// Function to get orders
export const getOrders = () => {
  const orders = localStorage.getItem("orders");
  return orders ? JSON.parse(orders) : [];
};

// Function to add an order
export const addOrder = (order) => {
  const orders = getOrders();
  const updatedOrders = [...orders, order];
  localStorage.setItem("orders", JSON.stringify(updatedOrders));
  return updatedOrders;
};

// Function to update order status (e.g., for cancellation or return)
export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getOrders().map((order) =>
    order.id === orderId ? { ...order, status: newStatus } : order
  );
  localStorage.setItem("orders", JSON.stringify(orders));
  return orders;
};