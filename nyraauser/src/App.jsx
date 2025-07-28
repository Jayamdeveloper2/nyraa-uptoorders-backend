import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/NavbarCom";
import Footer from "./components/Footer/Footer";
import BottomNavbar from "./components/BottomNavbar/BottomNavbar";
import HomePage from "./pages/HomePage";
import ProductList from "./pages/ProductList";
import SearchResults from "./pages/SearchResults";
import ProductDetail from "./pages/productdetailpage/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import OfferNav from "./components/OfferNav/OfferNav";
import AccountLayout from "./pages/MyAccount/AccountLayout";
import Orders from "./pages/MyAccount/Orders";
import Addresses from "./pages/MyAccount/Addresses";
import TrackOrder from "./pages/MyAccount/TrackOrder";
import Profile from "./pages/MyAccount/Profile";
import InvoiceDetail from "./pages/MyAccount/InvoiceDetail";
import ReturnOrder from "./pages/MyAccount/ReturnOrder";
import OrderDetail from "./pages/MyAccount/OrderDetail";
import PrivateRoute from "./components/routes/PrivateRoute";
import ErrorBoundary from "./components/error/ErrorBoundary";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <ErrorBoundary>
      <Router basename="/nyraa">
        <div className="app">
          <OfferNav />
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/collections/:category" element={<ProductList />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/account/profile" replace /> : <Login />}
            />

            {/* Private Routes */}
            <Route
              path="/cart"
              element={<PrivateRoute><Cart /></PrivateRoute>} 
            />
            <Route
              path="/wishlist"
              element={<PrivateRoute><Wishlist /></PrivateRoute>}
            />
            <Route
              path="/checkout"
              element={<PrivateRoute><Checkout /></PrivateRoute>}
            />
            <Route
              path="/checkout/confirmation"
              element={<PrivateRoute><CheckoutConfirmation /></PrivateRoute>}
            />
            <Route
              path="/account"
              element={<PrivateRoute><AccountLayout /></PrivateRoute>}
            >
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="orders/:orderId/return" element={<ReturnOrder />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="track" element={<TrackOrder />} />
              <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
            </Route>
          </Routes>
          <BottomNavbar />
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;