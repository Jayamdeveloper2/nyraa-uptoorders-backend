import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Palette, Edit2 } from 'lucide-react';
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import namer from 'color-namer';

const API_BASE_URL = "http://localhost:5000/api";

const AddColor = () => {
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState({ name: "", isActive: true, sortOrder: 0 });
  const [editingColor, setEditingColor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/colors`);
        if (response.data.success) {
          setColors(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching colors:", error);
        addToast("Failed to fetch colors", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchColors();
  }, [addToast]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewColor((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleColorPickerChange = (e) => {
    const hexValue = e.target.value.toUpperCase();
    const names = namer(hexValue);
    const colorName = names.pantone[0]?.name || hexValue;

    setNewColor((prev) => ({
      ...prev,
      name: colorName,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newColor.name.trim()) {
      addToast("Color name is required", "error");
      return;
    }
    if (newColor.sortOrder < 0) {
      addToast("Sort order must be a non-negative number", "error");
      return;
    }

    try {
      setSubmitting(true);
      let response;
      if (editingColor) {
        response = await axios.put(`${API_BASE_URL}/colors/${editingColor.id}`, newColor);
        if (response.data.success) {
          addToast(response.data.message, "success");
          setColors(response.data.updatedColors);
          setEditingColor(null);
        }
      } else {
        response = await axios.post(`${API_BASE_URL}/colors`, newColor);
        if (response.data.success) {
          addToast(response.data.message, "success");
          setColors(response.data.updatedColors);
        }
      }
      setNewColor({ name: "", isActive: true, sortOrder: 0 });
    } catch (error) {
      addToast(error.response?.data?.message || `Failed to ${editingColor ? 'update' : 'add'} color`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditColor = (color) => {
    setEditingColor(color);
    setNewColor({ name: color.name, isActive: color.isActive, sortOrder: color.sortOrder });
  };

  const cancelEdit = () => {
    setEditingColor(null);
    setNewColor({ name: "", isActive: true, sortOrder: 0 });
  };

  const handleDeleteColor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this color?")) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/colors/${id}`);
      if (response.data.success) {
        addToast(response.data.message, "success");
        setColors(response.data.updatedColors);
        if (editingColor && editingColor.id === id) {
          cancelEdit();
        }
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to delete color", "error");
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          .custom-gradient {
            background-image: linear-gradient(to right, #C77096, #A83E68);
          }
          .custom-gradient-br {
            background-image: linear-gradient(to bottom right, #C77096, #A83E68);
          }
          .custom-gradient-hover:hover {
            background-image: linear-gradient(to right, #A83E68, #C77096);
          }
        `}
      </style>
      <div className="min-h-screen bg-indigo-50 p-3 sm:p-4 lg:p-6 font-sans">
        <div className="max-w-full  mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/90 backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-xl border border-gray-100/50 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 custom-gradient-br rounded-lg flex items-center justify-center">
                <Palette className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Color Management
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Add and manage product colors
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back to Products</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Add/Edit Color Form */}
            <div className="bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-100/50 p-4 sm:p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 custom-gradient-br rounded-md flex items-center justify-center">
                  {editingColor ? <Edit2 className="text-white size={14} sm:w-4 sm:h-4" /> : <Plus className="text-white size={14} sm:w-4 sm:h-4" />}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingColor ? "Edit Color" : "Create New Color"}
                </h2>
              </div>
            
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      name="name"
                      value={newColor.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-md bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm placeholder:text-gray-400 transition-all duration-300"
                      placeholder="e.g., Royal Blue, Forest Green, #FF0000"
                      required
                    />
                    <input
                      type="color"
                      value={newColor.name.startsWith('#') ? newColor.name : '#000000'}
                      onChange={handleColorPickerChange}
                      className="w-10 h-10 rounded-md border border-gray-200 cursor-pointer"
                      title="Pick a color"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sort Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={newColor.sortOrder}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-md bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm placeholder:text-gray-400 transition-all duration-300"
                    placeholder="e.g., 0, 1, 2"
                    min="0"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 p-3 sm:p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={newColor.isActive}
                    onChange={handleInputChange}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <label htmlFor="isActive" className="text-xs sm:text-sm font-medium text-gray-700">
                    Set as Active
                  </label>
                </div>
              
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2.5 custom-gradient custom-gradient-hover text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-80 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <span>{editingColor ? "Updating..." : "Creating..."}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {editingColor ? <Edit2 size={14} className="sm:w-4 sm:h-4" /> : <Plus size={14} className="sm:w-4 sm:h-4" />}
                        {editingColor ? "Update Color" : "Create Color"}
                      </div>
                    )}
                  </button>
                  {editingColor && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-auto px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Color List */}
            <div className="bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-100/50 p-4 sm:p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 custom-gradient-br rounded-md flex items-center justify-center">
                    <Palette className="text-white" size={14} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Color List</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-2.5 py-0.5 rounded-full">
                  {colors.length} {colors.length === 1 ? 'Color' : 'Colors'}
                </div>
              </div>
            
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-full h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              ) : colors.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Palette className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">No colors added</p>
                  <p className="text-gray-400 text-xs mt-1">Create your first color to begin</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {colors.map((color, index) => (
                    <div 
                      key={color.id} 
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/80 rounded-lg border border-gray-100/50 hover:bg-indigo-50/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-white text-xs font-semibold"
                          style={{ backgroundColor: color.name.startsWith('#') ? color.name : '#C77096' }}
                        >
                          {color.name.startsWith('#') ? '' : color.sortOrder}
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 hover:text-indigo-700 transition-colors">
                            {color.name} (Order: {color.sortOrder})
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              color.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {color.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          onClick={() => handleEditColor(color)}
                          className="p-1 sm:p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-md transition-all duration-300"
                          title="Edit Color"
                        >
                          <Edit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteColor(color.id)}
                          className="p-1 sm:p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-all duration-300"
                          title="Delete Color"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddColor;