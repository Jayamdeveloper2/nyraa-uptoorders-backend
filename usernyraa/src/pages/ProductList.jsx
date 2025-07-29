import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { addToWishlist, removeFromWishlist } from "../store/wishlistSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterSection from "../components/ProductList/FilterSection";
import CartSidebar from "../components/CartSidebar/CartSidebar";
import BannerBreadcrumb from "../components/ui/BannerBreadcrumb";
import { PurchaseNowButton, AddToCartButton, PurchaseNowTwoButton } from "../components/ui/Buttons";
import IconLink from "../components/ui/Icons";
import "./ProductList.css";

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const ProductList = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items) || [];
  const wishlistItems = useSelector((state) => state.wishlist.items) || [];
  const displayCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Products";

  const [filters, setFilters] = useState({
    availability: [],
    priceRange: { min: 0, max: 50000 },
    size: [],
    style: [],
    material: [],
    brand: [],
    color: [],
  });
  const [sort, setSort] = useState("bestSelling");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [hoveredProductId, setHoveredProductId] = useState(null);

  // Fetch products from the API
  useEffect(() => {
   const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);
    let allProducts = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await fetch(`http://localhost:5000/api/products?page=${page}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }
      const productArray = data.data?.products || [];
      if (!Array.isArray(productArray)) {
        throw new Error("Could not extract product array from API response");
      }
      allProducts = [...allProducts, ...productArray];
      totalPages = data.data?.pagination?.totalPages || 1;
      page++;
    }

    const transformedData = allProducts.map((item) => {
      const variants = Array.isArray(item.variants) ? item.variants : [];
      const firstVariant = variants[0] || {};
      return {
        id: item.id?.toString(),
        slug: item.slug || generateSlug(item.name), // Add slug
        name: item.name || "Unnamed Product",
        price: firstVariant.price || item.price || 0,
        originalPrice: firstVariant.originalPrice || item.originalPrice || firstVariant.price || 0,
        discount: item.discount || 0,
        category: item.category || "Uncategorized",
        categorySlug: item.cat_slug || generateSlug(item.category || "uncategorized"), // Add category slug
        size: variants
          .map((v) => v.size)
          .filter(Boolean)
          .join(", ") || item.specifications?.Size || "N/A",
        style: item.style || item.specifications?.Detail || "N/A",
        material: item.material || item.specifications?.Fabric || "N/A",
        brand: item.brand || "N/A",
        color: variants
          .map((v) => v.color)
          .filter(Boolean)
          .join(", ") || item.specifications?.Color || "N/A",
        image: item.image || item.images?.[0] || "/placeholder.svg",
        secondaryImage: item.images?.[1] || "",
        availability: item.availability || "N/A",
        description: item.description || "No description available",
        rating: parseFloat(item.rating) || 0,
        variants,
      };
    });
    setProducts(transformedData);
    setLoading(false);
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.message);
    setProducts([]);
    setLoading(false);
    toast.error(`Failed to load products: ${err.message}`, {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

    fetchProducts();
    window.scrollTo(0, 0);
  }, []);

  // Compute filter options
  const filterOptions = useMemo(() => {
    const productsToFilter =
      category && category.toLowerCase() !== "dresses"
        ? products.filter((p) => p.categorySlug?.toLowerCase() === category.toLowerCase()) // Use categorySlug
        : products;

    const counts = {
      availability: {},
      size: {},
      style: {},
      material: {},
      brand: {},
      color: {},
    };

    productsToFilter.forEach((p) => {
      counts.availability[p.availability] = (counts.availability[p.availability] || 0) + 1;
      p.size?.split(", ").forEach((s) => {
        counts.size[s] = (counts.size[s] || 0) + 1;
      });
      counts.style[p.style] = (counts.style[p.style] || 0) + 1;
      counts.material[p.material] = (counts.material[p.material] || 0) + 1;
      counts.brand[p.brand] = (counts.brand[p.brand] || 0) + 1;
      p.color?.split(", ").forEach((c) => {
        counts.color[c] = (counts.color[c] || 0) + 1;
      });
    });

    return {
      availability: Object.entries(counts.availability)
        .filter(([value]) => value !== "N/A")
        .map(([value, count]) => ({ value, label: `${value} (${count})` })),
      size: Object.entries(counts.size)
        .filter(([value]) => value !== "N/A")
        .map(([value, count]) => ({ value, label: `${value} (${count})` }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      style: Object.entries(counts.style)
        .filter(([value]) => value !== "N/A")
        .map(([value, count]) => ({ value, label: `${value} (${count})` }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      material: Object.entries(counts.material)
        .filter(([value]) => value !== "N/A")
        .map(([value, count]) => ({ value, label: `${value} (${count})` }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      brand: Object.entries(counts.brand)
        .filter(([value]) => value !== "N/A")
        .map(([value, count]) => ({ value, label: `${value} (${count})` }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      color: Object.entries(counts.color)
        .filter(([value]) => value !== "N/A")
        .map(([value, count]) => ({ value, label: `${value} (${count})` }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      priceRange: {
        min: productsToFilter.length ? Math.min(...productsToFilter.map((p) => p.price)) : 0,
        max: productsToFilter.length ? Math.max(...productsToFilter.map((p) => p.price)) : 50000,
      },
    };
  }, [category, products]);

  // Define applyFilters
  const applyFilters = useCallback(
    (newFilters) => {
      if (!Array.isArray(products)) {
        setFilteredProducts([]);
        return;
      }

      let result = [...products];
      if (category && category.toLowerCase() !== "dresses") {
        result = result.filter((p) => p.categorySlug?.toLowerCase() === category.toLowerCase()); // Use categorySlug
      }
      if (newFilters.availability.length > 0)
        result = result.filter((p) => newFilters.availability.includes(p.availability));
      if (newFilters.size.length > 0)
        result = result.filter((p) => newFilters.size.some((size) => p.size?.split(", ").includes(size)));
      if (newFilters.style.length > 0)
        result = result.filter((p) => newFilters.style.includes(p.style));
      if (newFilters.material.length > 0)
        result = result.filter((p) => newFilters.material.includes(p.material));
      if (newFilters.brand.length > 0)
        result = result.filter((p) => newFilters.brand.includes(p.brand));
      if (newFilters.color.length > 0)
        result = result.filter((p) => newFilters.color.some((color) => p.color?.split(", ").includes(color)));
      if (
        newFilters.priceRange.min > filterOptions.priceRange.min ||
        newFilters.priceRange.max < filterOptions.priceRange.max
      )
        result = result.filter((p) => p.price >= newFilters.priceRange.min && p.price <= newFilters.priceRange.max);
      switch (sort) {
        case "priceLowToHigh":
          result.sort((a, b) => a.price - b.price);
          break;
        case "priceHighToLow":
          result.sort((a, b) => b.price - a.price);
          break;
        case "bestSelling":
        default:
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.price - b.price);
          break;
      }
      setFilteredProducts(result);
    },
    [sort, category, filterOptions, products],
  );

  // Apply filters
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(filters);
    } else {
      setFilteredProducts([]);
    }
  }, [filters, sort, category, products]);

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      if (products.length > 0) {
        applyFilters(newFilters);
      }
    },
    [applyFilters, products],
  );

  const handleSortChange = useCallback((e) => setSort(e.target.value), []);

  const handleProductClick = useCallback(
    (product) => {
      // Navigate using slug instead of id
      navigate(`/product/${product.slug}`, { state: { product } });
    },
    [navigate],
  );

  const handleShopNow = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowPopup(true);
  };

  const handleAddToCart = useCallback(
    (product) => {
      dispatch(addToCart({ ...product, quantity }));
      toast.success("Item added to cart successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setShowPopup(false);
      setShowCartSidebar(true);
    },
    [dispatch, quantity],
  );

  const handleBuyNow = useCallback(
    (product) => {
      dispatch(addToCart({ ...product, quantity }));
      toast.success("Item added to cart successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setShowPopup(false);
      navigate("/checkout");
    },
    [dispatch, quantity, navigate],
  );

  const handleWishlistToggle = useCallback(
    (product) => {
      const isInWishlist = wishlistItems.some((item) => item.id === product.id);
      if (isInWishlist) {
        dispatch(removeFromWishlist(product.id));
      } else {
        dispatch(addToWishlist(product));
      }
    },
    [dispatch, wishlistItems],
  );

  const handleImageHover = (productId) => {
    setHoveredProductId(productId);
  };

  const handleImageLeave = () => {
    setHoveredProductId(null);
  };

  const closeCartSidebar = useCallback(() => {
    setShowCartSidebar(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(".cart-sidebar");
      if (
        sidebar &&
        !sidebar.contains(event.target) &&
        !event.target.closest(".cart-toggle-btn") &&
        showCartSidebar
      ) {
        closeCartSidebar();
      }
    };

    if (showCartSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCartSidebar, closeCartSidebar]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-5">
        <h5>Error: {error}</h5>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
        <p className="mt-2">Please ensure the backend server is running and try again.</p>
      </div>
    );
  }

  return (
    <div>
      <BannerBreadcrumb
        breadcrumbs={[{ label: "Home", link: "/home" }, { label: displayCategory }]}
        title={displayCategory}
        backgroundImage="https://images.unsplash.com/photo-1445205170230-053b83016050"
      />

      <div className="product-list">
        <div className="flex-container">
          <div className="filter-section d-none d-md-block">
            <FilterSection
              onFilterChange={handleFilterChange}
              currentFilters={filters}
              filterOptions={filterOptions}
              filteredProducts={filteredProducts}
            />
          </div>
          <div className="products-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-md-none d-flex align-items-center">
                <Button
                  variant="link"
                  className="d-flex align-items-center text-dark text-decoration-none"
                  onClick={() => setShowFilterModal(true)}
                >
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5zm0 4A.5.5 0 0 1 2 5h10a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5zm0 4A.5.5 0 0 1 2 9h6a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5z" />
                  </svg>
                  <span style={{ fontSize: "1rem" }}>Filter</span>
                </Button>
              </div>
              <div className="sort-section">
                <Form.Select
                  value={sort}
                  onChange={handleSortChange}
                  className="form-select-sm premium-select"
                >
                  <option value="bestSelling">Best Selling</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                </Form.Select>
              </div>
            </div>
            <div className="products-container">
              {filteredProducts.length === 0 && !loading && (
                <div className="text-center my-5">
                  <h5>No products found</h5>
                </div>
              )}
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-4 g-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="col">
                    <div className="product-card h-100">
                      <div
                        className="product-image-container"
                        onMouseEnter={() => handleImageHover(product.id)}
                        onMouseLeave={handleImageLeave}
                      >
                        <img
                          src={
                            hoveredProductId === product.id && product.secondaryImage
                              ? product.secondaryImage
                              : product.image
                          }
                          alt={product.name}
                          className="product-image"
                          onClick={() => handleProductClick(product)}
                          onError={(e) => (e.target.src = "/placeholder.svg")} // Fallback for broken images
                        />
                        <div className="wishlist-wrapper">
                          <IconLink
                            iconType="wishlist"
                            className={`wishlist-icon ${
                              wishlistItems.some((item) => item.id === product.id) ? "filled" : ""
                            }`}
                            onClick={() => handleWishlistToggle(product)}
                          />
                        </div>
                      </div>
                      <div className="product-info">
                        <div className="product-info-content">
                          <div className="content-wrapper">
                            <div className="brand-name">{product.brand}</div>
                            <h3 className="product-name">{product.name}</h3>
                            <div className="price-container">
                              {product.discount > 0 && (
                                <span className="original-price">₹{product.originalPrice.toFixed(0)}</span>
                              )}
                              <span className="discounted-price">₹{product.price.toFixed(0)}</span>
                              {product.discount > 0 && <span className="discount">-{product.discount}%</span>}
                            </div>
                          </div>
                        </div>
                        <PurchaseNowButton
                          label="Buy Now"
                          productId={product.slug} // Use slug instead of id
                          onClick={() => handleShopNow(product)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} className="d-md-none">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem" }}>Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FilterSection
            onFilterChange={handleFilterChange}
            currentFilters={filters}
            filterOptions={filterOptions}
            filteredProducts={filteredProducts}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showPopup} onHide={() => setShowPopup(false)} size="lg" className="product-popup">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div className="row">
              <div className="col-md-6">
                <img
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain", width: "100%" }}
                  onError={(e) => (e.target.src = "/placeholder.svg")} // Fallback for broken images
                />
              </div>
              <div className="col-md-6">
                <div className="product-details">
                  <h5>Price: ₹{selectedProduct.price.toFixed(2)}</h5>
                  {selectedProduct.discount > 0 && (
                    <p className="text-muted">
                      Original Price:{" "}
                      <span className="text-decoration-line-through">
                        ₹{selectedProduct.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-danger ms-2">-{selectedProduct.discount}%</span>
                    </p>
                  )}
                  <p>Size: {selectedProduct.size}</p>
                  <p>Material: {selectedProduct.material}</p>
                  <p className="mt-2">{selectedProduct.description}</p>
                  <p>Brand: {selectedProduct.brand}</p>
                  <p>Availability: {selectedProduct.availability}</p>

                  <div className="quantity-selector mb-3">
                    <label className="me-2">Quantity:</label>
                    <div className="quantity-control d-inline-flex align-items-center">
                      <button
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        className="quantity-input"
                      />
                      <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>

                  <div className="action-buttons" style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                    <AddToCartButton
                      label="Add to Cart"
                      onClick={() => handleAddToCart(selectedProduct)}
                    />
                    <PurchaseNowTwoButton
                      label="Buy Now"
                      productId={selectedProduct.slug} // Use slug instead of id
                      onClick={() => handleBuyNow(selectedProduct)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <CartSidebar
        cartItems={cartItems}
        updateQuantity={(id, newQuantity) => dispatch(updateQuantity({ id, quantity: Math.max(1, newQuantity) }))}
        removeFromCart={(id) => dispatch(removeFromCart(id))}
        getTotal={() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
        show={showCartSidebar}
        handleClose={closeCartSidebar}
        specialInstructions={specialInstructions}
        setSpecialInstructions={setSpecialInstructions}
        navigate={navigate}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ProductList;