"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Plus, Edit, Trash2, Eye, Download, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from "../context/ToastContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Enhanced Modal Component with better styling
const Modal = ({ isOpen, onClose, title, size = "lg", children }) => {
  if (!isOpen) return null
  
  const sizeClasses = {
    xl: "max-w-6xl",
    lg: "max-w-4xl", 
    md: "max-w-2xl",
    sm: "max-w-md",
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.lg} max-h-[95vh] overflow-hidden`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Enhanced Image Gallery Component
const ImageGallery = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">No images available</p>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden group">
          <img
            src={images[currentImageIndex] || "/placeholder.svg?height=320&width=400"}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            onClick={() => setIsFullscreen(true)}
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=320&width=400"
            }}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={img || "/placeholder.svg?height=64&width=64"}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=64&width=64"
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={`${productName} - Fullscreen`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=600&width=800"
              }}
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                >
                  <ChevronRight size={24} />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                  {currentImageIndex + 1} of {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Enhanced Confirm Dialog
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white font-medium transition-colors ${
              type === "danger" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
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
    setSelectedStatus(newStatus)
    setCurrentPage(1)
    setCacheBuster(Date.now())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600">Manage your product inventory and listings with ease</p>
            </div>
            <div className="flex flex-wrap gap-3">
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
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Upload size={20} />
                <span>Import JSON</span>
              </button>
              {/* Export JSON Button */}
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download size={20} />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
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
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or add your first product to get started.</p>
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                <Plus size={20} />
                Add Your First Product
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="space-y-8">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Variants</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price Range</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => {
                      const prices = product.variants.map((v) => v.price).filter((p) => p > 0)
                      const minPrice = prices.length > 0 ? Math.min(...prices) : 0
                      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

                      return (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name || "Product"}
                                  className="w-16 h-20 object-cover rounded-xl shadow-sm"
                                  onError={(e) => {
                                    e.target.src = "/placeholder.svg?height=80&width=64"
                                  }}
                                />
                                {product.images?.length > 1 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {product.images.length}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">{product.name || "N/A"}</h4>
                                <p className="text-sm text-gray-500">{product.brand || "No brand"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {product.categoryName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
  <div className="flex flex-wrap gap-1">
    {product.variants.length > 0 ? (
      <>
        {product.variants.slice(0, 2).map((variant, i) => (
          <span
            key={i}
            className="inline-flex flex-col items-start px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-800 font-medium"
          >
            {variant.color && <span>Color: {variant.color}</span>}
            {variant.size && <span>Size: {variant.size}</span>}
            {variant.name && <span>Name: {variant.name}</span>}
          </span>
        ))}
        {product.variants.length > 2 && (
          <span className="text-xs text-gray-500 px-2 py-1 self-center">
            +{product.variants.length - 2} more
          </span>
        )}
      </>
    ) : (
      <span className="text-gray-500 text-sm">No variants</span>
    )}
  </div>
</td>
                       <td className="px-6 py-4">
  {minPrice > 0 && maxPrice > 0 ? (
    <div className="font-semibold text-gray-900">
      ₹{minPrice.toLocaleString()}
      {minPrice !== maxPrice && (
        <span className="line-through text-red-500 ml-2">
          ₹{maxPrice.toLocaleString()}
        </span>
      )}
    </div>
  ) : (
    <span className="text-gray-500">N/A</span>
  )}
</td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
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
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openViewModal(product)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Edit Product"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteDialog(product)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
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
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, products.length)}{" "}
                  of {products.length} products
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-700 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => {
                const prices = product.variants.map((v) => v.price).filter((p) => p > 0)
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

                return (
                  <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=192&width=300"
                        }}
                      />
                      {product.images?.length > 1 && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                          {product.images.length} photos
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
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
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{product.name || "N/A"}</h4>
                        <p className="text-sm text-gray-500">{product.brand || "No brand"}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                          {product.categoryName}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Variants:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.variants.length > 0 ? (
                            product.variants.slice(0, 3).map((variant, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-lg font-medium">
                                {variant.color} • {variant.size}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg">No variants</span>
                          )}
                          {product.variants.length > 3 && (
                            <span className="text-xs text-gray-500">+{product.variants.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          {minPrice > 0 && maxPrice > 0 ? (
                            <div className="font-semibold text-gray-900">
                              ₹{minPrice.toLocaleString()}
                              {minPrice !== maxPrice && <span className="text-gray-500 text-sm"> - ₹{maxPrice.toLocaleString()}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-500">Price N/A</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openViewModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(product)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile Pagination */}
            <div className="lg:hidden flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors font-medium"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="text-sm text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors font-medium"
              >
                Next
                <ChevronRight size={18} />
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
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">JSON Data:</label>
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
                rows={12}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
              />
            </div>

            {/* Validation Results */}
            {importErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="text-red-800 font-semibold mb-3">Import Validation Errors:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                  {importErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {importSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-800 font-semibold">
                    Validation successful! {validatedProducts.length} product(s) ready to import.
                  </span>
                </div>
              </div>
            )}

            {/* Preview validated products */}
            {validatedProducts.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Products to be imported:</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {validatedProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.variants.length} variant(s) • {product.brand || "No brand"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 bg-white rounded-lg font-medium">{product.status}</span>
                        <span className="text-xs px-2 py-1 bg-white rounded-lg font-medium">
                          {product.availability.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData("");
                  setImportErrors([]);
                  setImportSuccess(false);
                  setValidatedProducts([]);
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleImportProducts}
                disabled={!importSuccess || validatedProducts.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Import {validatedProducts.length} Products
              </button>
            </div>
          </div>
        </Modal>

        {/* Enhanced View Product Modal */}
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
            <div className="p-6 space-y-8">
              {/* Header Section with Image Gallery */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Gallery */}
                  <div>
                    <ImageGallery 
                      images={selectedProduct.images || []} 
                      productName={selectedProduct.name || "Product"} 
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedProduct.name || "N/A"}</h2>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
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
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
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
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Brand</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedProduct.brand || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Material</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedProduct.material || "N/A"}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedProduct.categoryName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Variants</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedProduct.variants?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}

            {/* Variants */}
<div className="bg-white border border-gray-200 rounded-2xl p-6">
  <h3 className="text-xl font-bold text-gray-900 mb-6">Product Variants</h3>
  {selectedProduct.variants?.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {selectedProduct.variants.map((variant, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col gap-1">
              {variant.name && <div className="font-semibold text-gray-900">Name: {variant.name}</div>}
              <div className="flex items-center gap-2">
                {variant.color && <div className="text-sm bg-gray-100 px-2 py-1 rounded-lg font-medium">Color: {variant.color}</div>}
                {variant.size && <div className="text-sm bg-gray-100 px-2 py-1 rounded-lg font-medium">Size: {variant.size}</div>}
              </div>
            </div>
            {variant.type && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-medium">
                Type: {variant.type}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl font-bold text-green-600">₹{variant.price?.toLocaleString() || 0}</span>
              {variant.originalPrice && variant.originalPrice !== variant.price && (
                <span className="text-sm text-gray-500 line-through ml-2">₹{variant.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
              Qty: {variant.quantity || 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8">
      <p className="text-gray-500">No variants available</p>
    </div>
  )}
</div>

              {/* Specifications */}
              {selectedProduct.specifications?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProduct.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Fabric:</span>
                        <span className="text-gray-900 font-medium">{spec.fabric || spec.Fabric || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedProduct(null)
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditProduct(selectedProduct)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
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
          message={selectedProduct ? `Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.` : "No product selected"}
          type="danger"
        />
      </div>
    </div>
  )
}

export default Products