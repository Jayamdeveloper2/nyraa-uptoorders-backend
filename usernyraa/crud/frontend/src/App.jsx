import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", image_url: "" });

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert price to number
    setForm({ ...form, [name]: name === "price" ? parseFloat(value) || "" : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/products", form);
      setForm({ name: "", price: "", description: "", image_url: "" });
      fetchProducts();
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
      alert("Error adding product. Please check all fields.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mt-4">
      <h2>NYRAA Admin Dashboard</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        <input name="name" className="form-control" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="price" className="form-control" placeholder="Price" value={form.price} onChange={handleChange} type="number" step="0.01" required />
        <input name="description" className="form-control" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="image_url" className="form-control" placeholder="Image URL" value={form.image_url} onChange={handleChange} required />
        <button className="btn btn-primary" type="submit">Add Product</button>
      </form>

      <table className="table mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.description}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
