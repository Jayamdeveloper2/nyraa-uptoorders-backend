"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Plus, Edit, Trash2, Eye, Download, Upload } from 'lucide-react'
import { useToast } from "../context/ToastContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Basic Modal Component
const Modal = ({ isOpen, onClose, title, size = "lg", children }) => {
  if (!isOpen) return null
  const sizeClasses = {
    xl: "max-w-4xl",
    lg: "max-w-2xl",
    md: "max-w-lg",
    sm: "max-w-sm",
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.lg} max-h-[90vh] overflow-y-auto m-4`}
      >
        {title && (
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// Basic ConfirmDialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white ${type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  
  // Import/Export states
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState("")
  const [importErrors, setImportErrors] = useState([])
  const [importSuccess, setImportSuccess] = useState(false)
  const [validatedProducts, setValidatedProducts] = useState([])
  const fileInputRef = useRef(null)

  const { addToast } = useToast()
  const navigate = useNavigate()

  // Helper function to normalize image URLs
  const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg?height=48&width=48"

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http")) {
      // Remove multiple cache busters
      return imageUrl.split("?cb=")[0]
    }

    // If it's a relative path, construct full URL
    return `${API_BASE_URL.replace("/api", "")}/${imageUrl}`
  }

  // Helper function to parse JSON safely
  const parseJsonSafely = (jsonString, fallback = []) => {
    if (!jsonString) return fallback
    if (Array.isArray(jsonString)) return jsonString
    if (typeof jsonString === "object") return jsonString

    try {
      return JSON.parse(jsonString)
    } catch (error) {
      console.error("Error parsing JSON:", error)
      return fallback
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy,
        sortOrder,
        _cb: cacheBuster,
      }

      if (selectedStatus !== "all") {
        params.status = selectedStatus
      }

      console.log("Fetching products with params:", params)

      const response = await axios.get(`${API_BASE_URL}/products`, {
        params,
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.data.success) {
        const normalizedProducts = response.data.data.products.map((product) => {
          // Parse images safely
          const images = parseJsonSafely(product.images, [])
          const normalizedImages = images.map((img) => normalizeImageUrl(img))

          // Parse variants safely
          const variants = parseJsonSafely(product.variants, [])
          const normalizedVariants = variants.map((variant) => ({
            color: variant.color || "N/A",
            size: variant.size || "N/A",
            type: variant.type || "N/A",
            price: Number.parseFloat(variant.price) || 0,
            originalPrice: variant.originalPrice ? Number.parseFloat(variant.originalPrice) : null,
            quantity: Number.parseInt(variant.quantity) || 0,
          }))

          // Parse specifications safely
          const specifications = parseJsonSafely(product.specifications, [])
          const normalizedSpecs = specifications.map((spec) => ({
            fabric: spec.Fabric || spec.fabric || "N/A",
            ...spec,
          }))

          return {
            ...product,
            images: normalizedImages,
            image: normalizedImages[0] || "/placeholder.svg?height=48&width=48",
            variants: normalizedVariants,
            specifications: normalizedSpecs,
            categoryName: product.categoryName || product.category?.category || "N/A",
            cat_slug: product.cat_slug || product.category?.cat_slug || "N/A",
          }
        })

        console.log("Normalized products:", normalizedProducts)
        setProducts(normalizedProducts)
        setTotalPages(response.data.data.pagination.totalPages)
      } else {
        throw new Error(response.data.message || "Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      addToast(error.response?.data?.message || "Failed to fetch products", "error")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
    itemsPerPage,
    cacheBuster,
    addToast,
  ])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      if (response.data.success) {
        setCategories(response.data.data?.categories || [])
      } else {
        throw new Error(response.data.message || "Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      addToast(error.response?.data?.message || "Error fetching categories", "error")
    }
  }, [addToast])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Import JSON functionality
  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      addToast("Please select a valid JSON file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setImportData(JSON.stringify(jsonData, null, 2));
        validateImportData(JSON.stringify(jsonData, null, 2));
        setShowImportModal(true);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        addToast("Invalid JSON file format", "error");
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const validateImportData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      const errors = [];
      const products = [];

      // Handle both single product and array of products
      const productsArray = Array.isArray(data.products) ? data.products : 
                           Array.isArray(data) ? data : [data];

      productsArray.forEach((product, index) => {
        const productErrors = [];

        // Required field validation
        if (!product.name) productErrors.push(`Product ${index + 1}: Name is required`);
        if (!product.categoryId) productErrors.push(`Product ${index + 1}: Category ID is required`);
        if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
          productErrors.push(`Product ${index + 1}: At least one variant is required`);
        }

        // Validate variants
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach((variant, vIndex) => {
            if (!variant.color) productErrors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Color is required`);
            if (!variant.size) productErrors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Size is required`);
            if (!variant.type) productErrors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Type is required`);
            if (!variant.price || variant.price <= 0)
              productErrors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Valid price is required`);
            if (variant.quantity === undefined || variant.quantity < 0)
              productErrors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Valid quantity is required`);
          });
        }

        // Check if category exists
        if (product.categoryId && !categories.find((c) => c.id === product.categoryId)) {
          productErrors.push(`Product ${index + 1}: Category ID ${product.categoryId} does not exist`);
        }

        errors.push(...productErrors);

        if (productErrors.length === 0) {
          products.push({
            ...product,
            id: Date.now() + index,
            slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            tags: Array.isArray(product.tags) ? product.tags : [],
            images: Array.isArray(product.images) ? product.images : [],
            stock: product.variants ? product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0) : 0,
            lowStockThreshold: product.lowStockThreshold || 10,
            availability: product.availability || "in_stock",
            status: product.status || "active",
            featured: product.featured || false,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            viewCount: product.viewCount || 0,
            salesCount: product.salesCount || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cat_slug: categories.find((c) => c.id === product.categoryId)?.cat_slug || "",
            specifications: product.specifications || [{ Fabric: "" }],
          });
        }
      });

      setImportErrors(errors);
      setValidatedProducts(products);
      setImportSuccess(errors.length === 0 && products.length > 0);
    } catch (error) {
      setImportErrors(["Invalid JSON format. Please check your file."]);
      setValidatedProducts([]);
      setImportSuccess(false);
    }
  };

  const handleImportProducts = async () => {
    if (validatedProducts.length === 0) return;

    try {
      setLoading(true);
      const importPromises = validatedProducts.map(async (product) => {
        const formData = new FormData();
        
        // Add all product fields
        Object.entries(product).forEach(([key, value]) => {
          if (key !== "images") {
            if (key === "variants" || key === "specifications") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        // Handle images if they are URLs
        if (product.images && Array.isArray(product.images)) {
          formData.append("existingImages", JSON.stringify(product.images));
        }

        return axios.post(`${API_BASE_URL}/products`, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
      });

      await Promise.all(importPromises);
      addToast(`Successfully imported ${validatedProducts.length} products`, "success");
      setShowImportModal(false);
      setCacheBuster(Date.now());
      
      // Reset import state
      setImportData("");
      setImportErrors([]);
      setImportSuccess(false);
      setValidatedProducts([]);
    } catch (error) {
      console.error("Error importing products:", error);
      addToast("Failed to import some products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Export JSON functionality
  const handleExportJSON = () => {
    if (products.length === 0) {
      addToast("No products to export", "error");
      return;
    }

    const exportData = {
      products: products.map((product) => ({
        name: product.name,
        description: product.description,
        shortDescription: product.description?.substring(0, 500) || "",
        slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        discount: 0,
        categoryId: product.categoryId,
        cat_slug: product.cat_slug,
        brand: product.brand,
        tags: Array.isArray(product.tags) ? product.tags : [],
        images: product.images || [],
        material: product.material,
        style: "Casual",
        weight: null,
        dimensions: null,
        stock: product.variants.reduce((total, variant) => total + (variant.quantity || 0), 0),
        lowStockThreshold: 10,
        availability: product.availability,
        status: product.status,
        featured: false,
        rating: 0.00,
        reviewCount: 0,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        metaKeywords: product.metaKeywords,
        variants: product.variants.map(variant => ({
          color: variant.color,
          size: variant.size,
          type: variant.type,
          price: variant.price,
          originalPrice: variant.originalPrice,
          quantity: variant.quantity
        })),
        specifications: product.specifications.map(spec => ({
          Fabric: spec.fabric || spec.Fabric || ""
        })),
        shippingInfo: null,
        warranty: null,
        returnPolicy: null
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast(`Successfully exported ${products.length} products`, "success");
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${selectedProduct.id}`)
      if (response.data.success) {
        addToast("Product deleted successfully", "success")
        setShowDeleteDialog(false)
        setSelectedProduct(null)
        setCacheBuster(Date.now())
      } else {
        throw new Error(response.data.message || "Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      addToast(error.response?.data?.message || "Failed to delete product", "error")
    }
  }

  const openViewModal = (product) => {
    if (!product) {
      console.error("No product provided to openViewModal")
      addToast("Unable to view product details", "error")
      return
    }
    try {
      setSelectedProduct({
        ...product,
        images: product.images || [],
        variants: product.variants || [],
        specifications: product.specifications || [],
      })
      setShowViewModal(true)
    } catch (error) {
      console.error("Error opening view modal:", error)
      addToast("Failed to open product details", "error")
    }
  }

  const openDeleteDialog = (product) => {
    if (!product) {
      console.error("No product provided to openDeleteDialog")
      addToast("Unable to delete product", "error")
      return
    }
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const handleEditProduct = (product) => {
    if (!product) {
      console.error("No product provided to handleEditProduct")
      addToast("Unable to edit product", "error")
      return
    }
    navigate(`/products/add?edit=${product.id}`)
  }

  const handleAddProduct = () => {
    navigate("/products/add")
  }

  const handleStatusChange = (newStatus) => {
    console.log("Status changed to:", newStatus)
    setSelectedStatus(newStatus)
    setCurrentPage(1)
    setCacheBuster(Date.now())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your product inventory and listings</p>
        </div>
        <div className="flex gap-3">
          {/* Import JSON Button */}
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            ref={fileInputRef}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Upload size={18} /> <span className="hidden sm:inline">Import JSON</span>
          </button>
          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download size={18} /> <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C77096] to-[#A83E68] text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <select
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category}
                </option>
              ))}
            </select>
            <select
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <select
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-")
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* No Products Message */}
      {products.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or adding a new product.</p>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C77096] to-[#A83E68] text-white rounded-lg hover:opacity-90"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Products Table (Desktop) */}
      {products.length > 0 && (
        <div className="hidden sm:block bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Variants
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => {
                  const prices = product.variants.map((v) => v.price).filter((p) => p > 0)
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name || "Product"}
                            className="w-12 h-14 object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg?height=48&width=48"
                            }}
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{product.name || "N/A"}</h4>
                            <p className="text-xs text-gray-500">{product.brand || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium">{product.categoryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex flex-wrap gap-1">
                          {product.variants.length > 0 ? (
                            product.variants.slice(0, 2).map((variant, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                              >
                                {variant.color} ({variant.size})
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No variants</span>
                          )}
                          {product.variants.length > 2 && (
                            <span className="text-xs text-gray-500">+{product.variants.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {minPrice > 0 && maxPrice > 0 ? (
                          <div>
                            <span className="font-medium">₹{minPrice}</span>
                            {minPrice !== maxPrice && <span> - ₹{maxPrice}</span>}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : product.status === "inactive"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.status?.toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openViewModal(product)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(product)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, products.length)}{" "}
              of {products.length} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                &lt;
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Cards (Mobile) */}
      {products.length > 0 && (
        <div className="sm:hidden space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex gap-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-20 object-cover rounded-md"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=64&width=64"
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name || "N/A"}</h4>
                  <p className="text-sm text-gray-600 mt-1">{product.categoryName || "N/A"}</p>
                  <p className="text-xs text-gray-500">{product.brand || ""}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.variants.length > 0 ? (
                      product.variants.slice(0, 2).map((variant, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {`${variant.color} (${variant.size})`}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">No variants</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    product.status === "active"
                      ? "bg-green-100 text-green-800"
                      : product.status === "inactive"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.status?.toUpperCase() || "N/A"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(product)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(product)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportData("");
          setImportErrors([]);
          setImportSuccess(false);
          setValidatedProducts([]);
        }}
        title="Import Products from JSON"
        size="xl"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">JSON Data:</label>
            <textarea
              value={importData}
              onChange={(e) => {
                setImportData(e.target.value);
                if (e.target.value.trim()) {
                  validateImportData(e.target.value);
                } else {
                  setImportErrors([]);
                  setValidatedProducts([]);
                  setImportSuccess(false);
                }
              }}
              placeholder="Paste your JSON data here..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          {/* Validation Results */}
          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium mb-2">Import Validation Errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {importErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {importSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-green-800">✅ Validation successful! {validatedProducts.length} product(s) ready to import.</span>
              </div>
            </div>
          )}

          {/* Preview validated products */}
          {validatedProducts.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Products to be imported:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {validatedProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.variants.length} variant(s) • {product.brand || "No brand"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">{product.status}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">{product.availability.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportData("");
                setImportErrors([]);
                setImportSuccess(false);
                setValidatedProducts([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImportProducts}
              disabled={!importSuccess || validatedProducts.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {validatedProducts.length} Products
            </button>
          </div>
        </div>
      </Modal>

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedProduct(null)
          }}
          title={selectedProduct.name || "Product Details"}
          size="xl"
        >
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2">
                  <img
                    src={selectedProduct.images?.[0] || "/placeholder.svg?height=300&width=300"}
                    alt={selectedProduct.name || "Product"}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=300&width=300"
                    }}
                  />
                  {selectedProduct.images?.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {selectedProduct.images.slice(1, 5).map((img, index) => (
                        <img
                          key={index}
                          src={img || "/placeholder.svg?height=80&width=80"}
                          alt={`${selectedProduct.name} ${index + 2}`}
                          className="w-full h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:w-1/2 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name || "N/A"}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedProduct.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedProduct.status === "inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedProduct.status?.toUpperCase() || "N/A"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedProduct.availability === "in_stock"
                            ? "bg-blue-100 text-blue-800"
                            : selectedProduct.availability === "out_of_stock"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedProduct.availability?.replace("_", " ").toUpperCase() || "IN STOCK"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Brand</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProduct.brand || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Category</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProduct.categoryName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Material</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProduct.material || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Total Variants</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProduct.variants?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedProduct.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedProduct.description}</p>
              </div>
            )}

            {/* Variants */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Variants</h3>
              {selectedProduct.variants?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedProduct.variants.map((variant, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{variant.color || "N/A"}</span>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded ml-2">{variant.size || "N/A"}</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {variant.type || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold text-green-600">₹{variant.price || 0}</span>
                          {variant.originalPrice && variant.originalPrice !== variant.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">₹{variant.originalPrice}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">Qty: {variant.quantity || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No variants available</p>
              )}
            </div>

            {/* Specifications */}
            {selectedProduct.specifications?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedProduct.specifications.map((spec, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Fabric:</span>
                      <span className="text-sm text-gray-900">{spec.fabric || spec.Fabric || "N/A"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedProduct(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditProduct(selectedProduct)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Product
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedProduct(null)
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={selectedProduct ? `Are you sure you want to delete "${selectedProduct.name}"?` : "No product selected"}
        type="danger"
      />
    </div>
  )
}

export default Products