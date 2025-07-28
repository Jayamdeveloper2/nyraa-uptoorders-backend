
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Package } from "lucide-react"
import { useToast } from "../context/ToastContext"
import Modal from "../components/Modal"
import ConfirmDialog from "../components/ConfirmDialog"
import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    status: "active",
  })

  const { addToast } = useToast()

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/categories`)

      if (response.data.success) {
        setCategories(response.data.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      addToast("Failed to fetch categories", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

const filteredCategories = categories.filter(
  (category) =>
    category.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddCategory = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/categories`, formData)

      if (response.data.success) {
        addToast("Category added successfully!", "success")
        setShowAddModal(false)
        resetForm()
        fetchCategories()
      }
    } catch (error) {
      console.error("Error adding category:", error)
      addToast(error.response?.data?.message || "Failed to add category", "error")
    }
  }

  const handleEditCategory = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/categories/${selectedCategory.id}`, formData)

      if (response.data.success) {
        addToast("Category updated successfully!", "success")
        setShowEditModal(false)
        setSelectedCategory(null)
        resetForm()
        fetchCategories()
      }
    } catch (error) {
      console.error("Error updating category:", error)
      addToast(error.response?.data?.message || "Failed to update category", "error")
    }
  }

  const handleDeleteCategory = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/categories/${selectedCategory.id}`)

      if (response.data.success) {
        addToast("Category deleted successfully!", "success")
        setShowDeleteDialog(false)
        setSelectedCategory(null)
        fetchCategories()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      addToast(error.response?.data?.message || "Failed to delete category", "error")
    }
  }

  const resetForm = () => {
    setFormData({
      category: "",
      description: "",
      status: "active",
    })
  }

  const openEditModal = (category) => {
    setSelectedCategory(category)
    setFormData({
      category: category.category,
      description: category.description || "",
      status: category.status,
    })
    setShowEditModal(true)
  }

  const openDeleteDialog = (category) => {
    setSelectedCategory(category)
    setShowDeleteDialog(true)
  }

  const CategoryForm = ({ isEdit = false }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter category name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter category description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={() => (isEdit ? setShowEditModal(false) : setShowAddModal(false))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={isEdit ? handleEditCategory : handleAddCategory}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover: bg-gradient-to-r from-[#C77096] to-[#A83E68] hover:brightness-110 text-white"
        >
          {isEdit ? "Update Category" : "Add Category"}
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
  <div>
    <h1 className="text-xl sm:text-2xl font-semibold">Category Management</h1>
    <p className="text-sm text-gray-600">Organize your products into categories</p>
  </div>

  <div className="flex justify-end sm:justify-start">
    <button
      onClick={() => {
        resetForm();
        setShowAddModal(true);
      }}
      className="bg-gradient-to-r from-[#C77096] to-[#A83E68] hover:brightness-110 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base"
    >
      <Plus size={20} />
      Add Category
    </button>
  </div>
</div>


      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-xl">
                      <Package className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{category.category}</h3>
                      <p className="text-sm text-gray-500">
                        Created {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      category.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {category.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{category.productCount || 0}</p>
                    <p className="text-sm text-gray-500">Products</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(category)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Category" size="md">
        <CategoryForm />
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Category" size="md">
        <CategoryForm isEdit={true} />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.category}"? This action cannot be undone and may affect associated products.`}
        type="danger"
      />
    </div>
  )
}

export default Categories
