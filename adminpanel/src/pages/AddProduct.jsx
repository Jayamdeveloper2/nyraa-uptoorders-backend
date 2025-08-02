import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, ImageIcon, X, Pencil, Trash2, ArrowLeft, Save, XCircle, ChevronRight, Upload, Download } from 'lucide-react';
import { useToast } from "../context/ToastContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const AddProduct = () => {
  const [activeTab, setActiveTab] = useState("basic-details");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    cat_slug: "",
    variants: [{ color: "", size: "", type: "", price: "", originalPrice: "", quantity: "" }],
    specifications: [{ name: "Fabric", value: "" }],
    images: [],
    seoTitle: "",
    metaKeywords: "",
    seoDescription: "",
    status: "active",
    availability: "in_stock",
    brand: "",
    material: "",
    tags: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [editingSpecIndex, setEditingSpecIndex] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = new URLSearchParams(location.search).get("edit");
  const fileInputRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [colorsResponse, sizesResponse, categoriesResponse, productResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/colors`, { headers: { 'Cache-Control': 'no-cache', Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get(`${API_BASE_URL}/sizes`, { headers: { 'Cache-Control': 'no-cache', Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get(`${API_BASE_URL}/categories`, { headers: { 'Cache-Control': 'no-cache', Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        isEdit ? axios.get(`${API_BASE_URL}/products/${isEdit}`, { headers: { 'Cache-Control': 'no-cache', Authorization: `Bearer ${localStorage.getItem("token")}` } }) : null
      ]);

      if (colorsResponse?.data?.success) {
        setColors(colorsResponse.data.data || []);
      }

      if (sizesResponse?.data?.success) {
        setSizes(sizesResponse.data.data || []);
      }

      if (categoriesResponse?.data?.success) {
        setCategories(categoriesResponse.data.data?.categories || []);
      }

      if (isEdit && productResponse?.data?.success) {
        const product = productResponse.data.data;
        const images = Array.isArray(product.images) ? product.images.map(img => `${img}?cb=${Date.now()}`) : [];
        
        setFormData({
          name: product.name || "",
          description: product.description || "",
          categoryId: product.categoryId || "",
          cat_slug: product.cat_slug || "",
          variants: product.variants && Array.isArray(product.variants) && product.variants.length > 0 
            ? product.variants.map(variant => ({
                color: variant.color || "",
                size: variant.size || "",
                type: variant.type || "",
                price: variant.price?.toString() || "",
                originalPrice: variant.originalPrice?.toString() || "",
                quantity: variant.quantity?.toString() || ""
              }))
            : [{ color: "", size: "", type: "", price: "", originalPrice: "", quantity: "" }],
          specifications: product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 
            ? product.specifications.map(spec => ({
                name: "Fabric",
                value: spec.Fabric || ""
              }))
            : [{ name: "Fabric", value: "" }],
          images: images,
          seoTitle: product.seoTitle || "",
          metaKeywords: product.metaKeywords || "",
          seoDescription: product.seoDescription || "",
          status: product.status || "active",
          availability: product.availability || "in_stock",
          brand: product.brand || "",
          material: product.material || "",
          tags: Array.isArray(product.tags) ? product.tags : (product.tags ? [product.tags] : [])
        });
        setImagePreviews(images);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  }, [isEdit, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        
        if (!jsonData.products || !Array.isArray(jsonData.products) || jsonData.products.length === 0) {
          addToast("Invalid JSON format. Expected 'products' array", "error");
          return;
        }

        const product = jsonData.products[0]; // Import first product
        
        // Map JSON data to form structure
        setFormData({
          name: product.name || "",
          description: product.description || "",
          categoryId: product.categoryId?.toString() || "",
          cat_slug: product.cat_slug || "",
          variants: product.variants && Array.isArray(product.variants) && product.variants.length > 0 
            ? product.variants.map(variant => ({
                color: variant.color || "",
                size: variant.size || "",
                type: variant.type || "",
                price: variant.price?.toString() || "",
                originalPrice: variant.originalPrice?.toString() || "",
                quantity: variant.quantity?.toString() || ""
              }))
            : [{ color: "", size: "", type: "", price: "", originalPrice: "", quantity: "" }],
          specifications: product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 
            ? product.specifications.map(spec => ({
                name: "Fabric",
                value: spec.Fabric || ""
              }))
            : [{ name: "Fabric", value: "" }],
          images: product.images || [],
          seoTitle: product.seoTitle || "",
          metaKeywords: product.metaKeywords || "",
          seoDescription: product.seoDescription || "",
          status: product.status || "active",
          availability: product.availability || "in_stock",
          brand: product.brand || "",
          material: product.material || "",
          tags: Array.isArray(product.tags) ? product.tags : []
        });

        // Set image previews if images are URLs
        if (product.images && Array.isArray(product.images)) {
          setImagePreviews(product.images);
        }

        addToast("Product data imported successfully", "success");
      } catch (error) {
        console.error("Error parsing JSON:", error);
        addToast("Invalid JSON file format", "error");
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Export JSON functionality
  const handleExportJSON = () => {
    const exportData = {
      products: [{
        name: formData.name,
        description: formData.description,
        shortDescription: formData.description?.substring(0, 500) || "",
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        discount: 0,
        categoryId: parseInt(formData.categoryId) || null,
        cat_slug: formData.cat_slug,
        brand: formData.brand,
        tags: formData.tags,
        images: formData.images,
        material: formData.material,
        style: "Casual",
        weight: null,
        dimensions: null,
        stock: formData.variants.reduce((total, variant) => total + (parseInt(variant.quantity) || 0), 0),
        lowStockThreshold: 10,
        availability: formData.availability,
        status: formData.status,
        featured: false,
        rating: 0.00,
        reviewCount: 0,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        metaKeywords: formData.metaKeywords,
        variants: formData.variants.map(variant => ({
          color: variant.color,
          size: variant.size,
          type: variant.type,
          price: parseFloat(variant.price) || 0,
          originalPrice: parseFloat(variant.originalPrice) || 0,
          quantity: parseInt(variant.quantity) || 0
        })),
        specifications: formData.specifications.map(spec => ({
          Fabric: spec.value
        })),
        shippingInfo: null,
        warranty: null,
        returnPolicy: null
      }]
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `product-${formData.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast("Product data exported successfully", "success");
  };

  const handleInputChange = (e, index, type) => {
    const { name, value } = e.target;
    if (type === 'variant' && index !== undefined) {
      const newVariants = [...formData.variants];
      newVariants[index] = { ...newVariants[index], [name]: value };
      setFormData(prev => ({ ...prev, variants: newVariants }));
    } else if (type === 'specification' && index !== undefined) {
      const newSpecs = [...formData.specifications];
      newSpecs[index] = { ...newSpecs[index], value };
      setFormData(prev => ({ ...prev, specifications: newSpecs }));
    } else if (name === "categoryId") {
      const selectedCategory = categories.find(cat => cat.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        categoryId: value,
        cat_slug: selectedCategory ? selectedCategory.cat_slug : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    } else if (selectedImageIndex > index) {
      setSelectedImageIndex(prev => prev - 1);
    }
  };

  const viewFullImage = (index) => {
    setSelectedImageIndex(index);
  };

  const closeFullImage = () => {
    setSelectedImageIndex(null);
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: "", size: "", type: "", price: "", originalPrice: "", quantity: "" }]
    }));
    setEditingVariantIndex(formData.variants.length);
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
    setEditingVariantIndex(null);
  };

  const startEditingVariant = (index) => {
    setEditingVariantIndex(index);
  };

  const saveVariant = (index) => {
    const variant = formData.variants[index];
    if (!variant.color) {
      addToast("Color is required", "error");
      return;
    }
    if (!variant.size) {
      addToast("Size is required", "error");
      return;
    }
    if (!variant.type) {
      addToast("Type is required", "error");
      return;
    }
    if (!variant.price || isNaN(Number.parseFloat(variant.price))) {
      addToast("Price is required and must be a valid number", "error");
      return;
    }
    if (variant.originalPrice && isNaN(Number.parseFloat(variant.originalPrice))) {
      addToast("Original Price must be a valid number", "error");
      return;
    }
    if (!variant.quantity || isNaN(Number.parseInt(variant.quantity))) {
      addToast("Quantity is required and must be a valid number", "error");
      return;
    }
    setEditingVariantIndex(null);
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: "Fabric", value: "" }]
    }));
    setEditingSpecIndex(formData.specifications.length);
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
    setEditingSpecIndex(null);
  };

  const startEditingSpec = (index) => {
    setEditingSpecIndex(index);
  };

  const saveSpecification = (index) => {
    const spec = formData.specifications[index];
    if (!spec.value) {
      addToast("Fabric is required", "error");
      return;
    }
    setEditingSpecIndex(null);
  };

  const cancelEdit = () => {
    setEditingVariantIndex(null);
    setEditingSpecIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name.trim()) {
      addToast("Product Name is required", "error");
      setLoading(false);
      return;
    }
    if (!formData.categoryId) {
      addToast("Category is required", "error");
      setLoading(false);
      return;
    }

    if (formData.variants.length === 0) {
      addToast("At least one variant is required", "error");
      setLoading(false);
      return;
    }
    if (formData.variants.some(variant => !variant.color)) {
      addToast("All variants must have a color selected", "error");
      setLoading(false);
      return;
    }
    if (formData.variants.some(variant => !variant.size)) {
      addToast("All variants must have a size selected", "error");
      setLoading(false);
      return;
    }
    if (formData.variants.some(variant => !variant.type)) {
      addToast("All variants must have a type selected", "error");
      setLoading(false);
      return;
    }
    if (formData.variants.some(variant => !variant.price || isNaN(Number.parseFloat(variant.price)))) {
      addToast("All variants must have a valid price", "error");
      setLoading(false);
      return;
    }
    if (formData.variants.some(variant => variant.originalPrice && isNaN(Number.parseFloat(variant.originalPrice)))) {
      addToast("All variants must have a valid original price", "error");
      setLoading(false);
      return;
    }
    if (formData.variants.some(variant => !variant.quantity || isNaN(Number.parseInt(variant.quantity)))) {
      addToast("All variants must have a valid quantity", "error");
      setLoading(false);
      return;
    }
    if (formData.specifications.length === 0) {
      addToast("At least one specification is required", "error");
      setLoading(false);
      return;
    }
    if (formData.specifications.some(spec => !spec.value)) {
      addToast("All specifications must have a fabric value", "error");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "images") {
        if (key === "variants" || key === "specifications") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      }
    });

    const existingImages = formData.images.filter(img => typeof img === "string");
    const newImages = formData.images.filter(img => img instanceof File);
    
    if (existingImages.length > 0) {
      formDataToSend.append("existingImages", JSON.stringify(existingImages));
    }
    
    newImages.forEach((image) => {
      formDataToSend.append("images", image);
    });

    try {
      const url = isEdit ? `${API_BASE_URL}/products/${isEdit}` : `${API_BASE_URL}/products`;
      const method = isEdit ? "put" : "post";
      const response = await axios[method](url, formDataToSend, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.data.success) {
        addToast(response.data.message || `Product ${isEdit ? "updated" : "added"} successfully`, "success");
        navigate("/products");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      addToast(error.response?.data?.message || `Failed to ${isEdit ? "update" : "add"} product`, "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic-details", label: "Basic Details" },
    { id: "variants", label: "Variants" },
    { id: "specifications", label: "Specifications" },
    { id: "images", label: "Images" },
    { id: "meta-title-keywords-description", label: "SEO & Meta" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-slate-600">
                <button 
                  onClick={() => navigate("/products")}
                  className="hover:text-blue-600 transition-colors duration-200 flex items-center gap-1"
                >
                  <span>Products</span>
                </button>
                <ChevronRight size={16} className="mx-1 text-slate-400" />
                <span className="font-medium text-slate-800">
                  {isEdit ? "Edit Product" : "Add Product"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                {isEdit ? "Edit Product" : "Add New Product"}
              </h1>
            </div>
            <div className="flex gap-3">
              {/* Import/Export Buttons */}
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
                <Upload size={16} />
                <span>Import JSON</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download size={16} />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ArrowLeft size={16} />
                <span>Back to Products</span>
              </button>
            </div>
          </div>
          <p className="text-slate-600 hidden sm:block text-sm sm:text-base">
            {isEdit ? "Update your product information" : "Create a new product listing"}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="border-b border-slate-200/50 bg-white/50">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 sm:px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-b-3 border-blue-500 text-blue-600 bg-blue-50/50"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            {/* Basic Details Tab */}
            {activeTab === "basic-details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.category}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading categories...</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Category Slug</label>
                    <input
                      type="text"
                      name="cat_slug"
                      value={formData.cat_slug}
                      readOnly
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
                      placeholder="Category slug (auto-filled)"
                    />
                  </div>
                 
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Availability</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="pre_order">Pre-Order</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Material</label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      placeholder="Enter material (e.g., Cotton, Silk)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tags</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                          <span className="text-sm">{tag}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = [...formData.tags];
                              newTags.splice(index, 1);
                              setFormData({...formData, tags: newTags});
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            if (!formData.tags.includes(e.target.value.trim())) {
                              setFormData({...formData, tags: [...formData.tags, e.target.value.trim()]});
                            }
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                        placeholder="Add tag and press Enter"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 resize-none"
                    placeholder="Enter product description"
                  />
                </div>
              </div>
            )}

            {/* Variants Tab */}
            {activeTab === "variants" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Product Variants</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C77096] to-[#A83E68] hover:brightness-110 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus size={18} />
                    Add Variant
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Color</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Size</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Price (₹)</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Original Price (₹)</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/80 divide-y divide-slate-200">
                      {formData.variants.map((variant, index) => (
                        <tr key={`variant-${index}`} className="hover:bg-slate-50/50 transition-colors duration-150">
                          {editingVariantIndex === index ? (
                            <>
                              <td className="px-4 py-4">
                                <select
                                  name="color"
                                  value={variant.color}
                                  onChange={(e) => handleInputChange(e, index, 'variant')}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                                  required
                                >
                                  <option value="">Select Color</option>
                                  {colors.length > 0 ? (
                                    colors.map((color) => (
                                      <option key={color.id} value={color.name}>
                                        {color.name}
                                      </option>
                                    ))
                                  ) : (
                                    <option disabled>Loading colors...</option>
                                  )}
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  name="size"
                                  value={variant.size}
                                  onChange={(e) => handleInputChange(e, index, 'variant')}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                                  required
                                >
                                  <option value="">Select Size</option>
                                  {sizes.length > 0 ? (
                                    sizes.map((size) => (
                                      <option key={size.id} value={size.name}>
                                        {size.name}
                                      </option>
                                    ))
                                  ) : (
                                    <option disabled>Loading sizes...</option>
                                  )}
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  name="type"
                                  value={variant.type}
                                  onChange={(e) => handleInputChange(e, index, 'variant')}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                                  required
                                  placeholder="e.g., Casual"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="number"
                                  name="price"
                                  value={variant.price}
                                  onChange={(e) => handleInputChange(e, index, 'variant')}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                                  required
                                  min="0"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="number"
                                  name="originalPrice"
                                  value={variant.originalPrice}
                                  onChange={(e) => handleInputChange(e, index, 'variant')}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                                  min="0"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="number"
                                  name="quantity"
                                  value={variant.quantity}
                                  onChange={(e) => handleInputChange(e, index, 'variant')}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                                  required
                                  min="0"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveVariant(index)}
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                                    title="Save"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
                                    title="Cancel"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4 text-sm font-medium text-slate-800">{variant.color || '-'}</td>
                              <td className="px-4 py-4 text-sm font-medium text-slate-800">{variant.size || '-'}</td>
                              <td className="px-4 py-4 text-sm font-medium text-slate-800">{variant.type || '-'}</td>
                              <td className="px-4 py-4 text-sm text-slate-700 font-semibold">{variant.price ? `₹${variant.price}` : '-'}</td>
                              <td className="px-4 py-4 text-sm text-slate-700">{variant.originalPrice ? `₹${variant.originalPrice}` : '-'}</td>
                              <td className="px-4 py-4 text-sm text-slate-700">{variant.quantity || '-'}</td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditingVariant(index)}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                    title="Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specifications" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Product Specifications</h3>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C77096] to-[#A83E68] hover:brightness-110 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus size={18} />
                    Add Specification
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Fabric</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/80 divide-y divide-slate-200">
                      {formData.specifications.map((spec, index) => (
                        <tr key={`spec-${index}`} className="hover:bg-slate-50/50 transition-colors duration-150">
                          {editingSpecIndex === index ? (
                            <>
                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  name="value"
                                  value={spec.value}
                                  onChange={(e) => handleInputChange(e, index, 'specification')}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                                  required
                                  placeholder="e.g., Cotton Blend"
                                />
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveSpecification(index)}
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                                    title="Save"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
                                    title="Cancel"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4 text-sm font-medium text-slate-800">{spec.value || '-'}</td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditingSpec(index)}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                    title="Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeSpecification(index)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === "images" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4">Product Images</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="product-images"
                    />
                    <label htmlFor="product-images" className="cursor-pointer flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <ImageIcon size={32} className="text-white" />
                      </div>
                      <span className="text-lg font-semibold text-slate-700 mb-2">Upload Product Images</span>
                      <span className="text-sm text-slate-500">PNG, JPG, WEBP up to 5MB each</span>
                    </label>
                  </div>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-blue-300 transition-all duration-200">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => { e.target.src = "/placeholder.svg?height=200&width=200" }}
                            onClick={() => viewFullImage(index)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedImageIndex !== null && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl w-full">
                      <img
                        src={imagePreviews[selectedImageIndex] || "/placeholder.svg"}
                        alt="Full view"
                        className="w-full h-auto rounded-xl"
                      />
                      <button
                        onClick={closeFullImage}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEO & Meta Tab */}
            {activeTab === "meta-title-keywords-description" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">SEO & Meta Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      placeholder="Enter SEO title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Meta Keywords</label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      placeholder="e.g., t-shirt, cotton, casual, fashion"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">SEO Description</label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 resize-none"
                    placeholder="Enter SEO description for better search visibility"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-slate-200/50 mt-8">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-all duration-200 order-2 sm:order-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#C77096] to-[#A83E68] hover:brightness-110 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isEdit ? "Update Product" : "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;