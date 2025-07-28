import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import AddColor from "./pages/AddColor";
import AddSize from "./pages/AddSize";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Toast from "./components/Toast";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/colors/add" element={<AddColor />} />
        <Route path="/sizes/add" element={<AddSize />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <AppRoutes />
            <Toast />
          </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;