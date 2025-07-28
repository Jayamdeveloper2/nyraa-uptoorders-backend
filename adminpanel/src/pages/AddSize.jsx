import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Ruler, Edit2 } from 'lucide-react';
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const AddSize = () => {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState({ name: "", isActive: true });
  const [editingSize, setEditingSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/sizes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setSizes(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching sizes:", error);
        addToast("Failed to fetch sizes", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSizes();
  }, [addToast]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSize((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSize.name.trim()) {
      addToast("Size name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      let response;
      if (editingSize) {
        response = await axios.put(`${API_BASE_URL}/sizes/${editingSize.id}`, newSize, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          addToast("Size updated successfully!", "success");
          setSizes(sizes.map((size) =>
            size.id === editingSize.id ? response.data.data : size
          ));
          setEditingSize(null);
        }
      } else {
        response = await axios.post(`${API_BASE_URL}/sizes`, newSize, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          addToast("Size added successfully!", "success");
          setSizes([...sizes, response.data.data]);
        }
      }
      setNewSize({ name: "", isActive: true });
    } catch (error) {
      addToast(error.response?.data?.message || `Failed to ${editingSize ? 'update' : 'add'} size`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSize = (size) => {
    setEditingSize(size);
    setNewSize({ name: size.name, isActive: size.isActive });
  };

  const cancelEdit = () => {
    setEditingSize(null);
    setNewSize({ name: "", isActive: true });
  };

  const handleDeleteSize = async (id) => {
    if (!window.confirm("Are you sure you want to delete this size?")) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/sizes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        addToast("Size deleted successfully!", "success");
        setSizes(sizes.filter((size) => size.id !== id));
        if (editingSize && editingSize.id === id) {
          cancelEdit();
        }
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to delete size", "error");
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
                <Ruler className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Size Management
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Add and manage product sizes
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
            {/* Add/Edit Size Form */}
            <div className="bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-100/50 p-4 sm:p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 custom-gradient-br rounded-md flex items-center justify-center">
                  {editingSize ? <Edit2 className="text-white" size={14} /> : <Plus className="text-white" size={14} />}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingSize ? "Edit Size" : "Create New Size"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Size Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newSize.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-md bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm placeholder:text-gray-400 transition-all duration-300"
                    placeholder="e.g., Small, Medium, Large"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 p-3 sm:p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={newSize.isActive}
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
                        <span>{editingSize ? "Updating..." : "Creating..."}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {editingSize ? <Edit2 size={14} className="sm:w-4 sm:h-4" /> : <Plus size={14} className="sm:w-4 sm:h-4" />}
                        {editingSize ? "Update Size" : "Create Size"}
                      </div>
                    )}
                  </button>
                  {editingSize && (
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

            {/* Size List */}
            <div className="bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-100/50 p-4 sm:p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 custom-gradient-br rounded-md flex items-center justify-center">
                    <Ruler className="text-white" size={14} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Size List</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-2.5 py-0.5 rounded-full">
                  {sizes.length} {sizes.length === 1 ? 'Size' : 'Sizes'}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-full h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              ) : sizes.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Ruler className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">No sizes added</p>
                  <p className="text-gray-400 text-xs mt-1">Create your first size to begin</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {sizes.map((size, index) => (
                    <div
                      key={size.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/80 rounded-lg border border-gray-100/50 hover:bg-indigo-50/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 custom-gradient-br rounded-md flex items-center justify-center text-white text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 hover:text-indigo-700 transition-colors">
                            {size.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              size.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {size.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          onClick={() => handleEditSize(size)}
                          className="p-1 sm:p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-md transition-all duration-300"
                          title="Edit Size"
                        >
                          <Edit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSize(size.id)}
                          className="p-1 sm:p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-all duration-300"
                          title="Delete Size"
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

export default AddSize;