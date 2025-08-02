import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../store/wishlistSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Spinner } from "react-bootstrap";
import YouMayAlsoLike from "./YouMayAlsoLike/YouMayAlsoLike";
import Newsletter from "../../components/Newsletter/Newsletter";
import BannerBreadcrumb from "../../components/ui/BannerBreadcrumb";
import { AddToCartButton, PurchaseNowTwoButton } from "../../components/ui/Buttons";
import IconLink from "../../components/ui/Icons";
import "./ProductDetail.css";

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items) || [];
  const wishlistItems = useSelector((state) => state.wishlist.items) || [];
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [viewersCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("specifications");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mainImageRef = useRef(null);
  const thumbnailsContainerRef = useRef(null);
  const zoomLensRef = useRef(null);
  const zoomWindowRef = useRef(null);
  const zoomFactor = 2.5;
  const lensSize = 200;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/api/products/${slug}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.success || !data.data) {
          throw new Error(data.error || "API request failed");
        }
        const item = data.data;

        const variants = Array.isArray(item.variants) ? item.variants : [];
        const firstVariant = variants[0] || {};
        const specifications = Array.isArray(item.specifications) && item.specifications.length > 0 
          ? item.specifications[0] 
          : {};

        const transformedProduct = {
          id: item.id?.toString() || item.slug,
          slug: item.slug || generateSlug(item.name),
          name: item.name || "Unnamed Product",
          price: firstVariant.price || item.price || 0,
          originalPrice: firstVariant.originalPrice || item.originalPrice || firstVariant.price || 0,
          discount: item.discount || 0,
          category: typeof item.category === 'string' ? item.category : 
                    (typeof item.categoryName === 'string' ? item.categoryName : "Uncategorized"),
          categorySlug: item.cat_slug || generateSlug(item.categoryName || item.category || "uncategorized"),
          size: variants
            .map((v) => v.size)
            .filter(Boolean)
            .join(", ") || item.specifications?.Size || "N/A",
          style: item.style || specifications.Detail || "N/A",
          material: item.material || specifications.Fabric || "N/A",
          brand: item.brand || "N/A",
          color: variants
            .map((v) => v.color)
            .filter(Boolean)
            .join(", ") || specifications.Color || "N/A",
          images: item.images && Array.isArray(item.images) ? item.images : [item.image || "/placeholder.svg"],
          highResImages: item.highResImages && Array.isArray(item.highResImages) ? item.highResImages : (item.images || [item.image || "/placeholder.svg"]),
          image: item.image || (item.images && item.images[0]) || "/placeholder.svg", // Added to ensure cart compatibility
          availability: item.availability || "In Stock",
          description: item.description || "No description available",
          about: item.seoDescription || "No additional information available",
          rating: parseFloat(item.rating) || 0,
          specifications: specifications,
          variants,
        };
        setProduct(transformedProduct);
        setSelectedColor(transformedProduct.color.split(", ")[0] || null);
        setSelectedSize(transformedProduct.size.split(", ")[0] || null);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setProduct(null);
        setLoading(false);
        toast.error(`Failed to load product: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (thumbnailsContainerRef.current) {
      const activeThumb = thumbnailsContainerRef.current.querySelector(".thumbnail-item.active");
      if (activeThumb) {
        const containerHeight = thumbnailsContainerRef.current.clientHeight;
        const thumbHeight = activeThumb.clientHeight;
        const thumbTop = activeThumb.offsetTop;
        const scrollPosition = thumbTop - containerHeight / 2 + thumbHeight / 2;

        thumbnailsContainerRef.current.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [activeImageIndex]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity, color: selectedColor, size: selectedSize }));
    toast.success("Item added to cart successfully", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity, color: selectedColor, size: selectedSize }));
    toast.success("Item added to cart successfully", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    navigate("/checkout");
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleMouseMove = (e) => {
    if (!mainImageRef.current || !zoomLensRef.current || !zoomWindowRef.current) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const imageUrl = product.highResImages?.[activeImageIndex] || product.images?.[activeImageIndex];

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const boundedX = Math.max(lensSize / 2, Math.min(x, rect.width - lensSize / 2));
    const boundedY = Math.max(lensSize / 2, Math.min(y, rect.height - lensSize / 2));

    const lensLeft = boundedX - lensSize / 2;
    const lensTop = boundedY - lensSize / 2;

    zoomLensRef.current.style.left = `${lensLeft}px`;
    zoomLensRef.current.style.top = `${lensTop}px`;

    const bgWidth = rect.width * zoomFactor;
    const bgHeight = rect.height * zoomFactor;

    const ratioX = boundedX / rect.width;
    const ratioY = boundedY / rect.height;

    const zoomWindowWidth = zoomWindowRef.current.offsetWidth;
    const zoomWindowHeight = zoomWindowRef.current.offsetHeight;

    const bgPosX = -(ratioX * bgWidth - zoomWindowWidth / 2);
    const bgPosY = -(ratioY * bgHeight - zoomWindowHeight / 2);

    zoomWindowRef.current.style.backgroundImage = `url(${imageUrl})`;
    zoomWindowRef.current.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    zoomWindowRef.current.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;

    zoomLensRef.current.style.backgroundImage = `url(${imageUrl})`;
    zoomLensRef.current.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    zoomLensRef.current.style.backgroundPosition = `${-lensLeft * zoomFactor}px ${-lensTop * zoomFactor}px`;
  };

  const handleThumbnailHover = (index) => {
    setActiveImageIndex(index);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const handleWishlistToggle = () => {
    const isInWishlist = wishlistItems.some((item) => item.id === product.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleThumbnailMouseEnter = (index) => {
    setHoverIndex(index);
    handleThumbnailHover(index);
  };

  const handleThumbnailMouseLeave = () => {
    setHoverIndex(null);
  };

  const renderSpecificationValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
    return value;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-5">
        <h3>{error || "Product not found"}</h3>
        <Button variant="primary" onClick={() => navigate("/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const capitalizeCategory = (category) => {
    if (typeof category !== 'string') return "Uncategorized";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <>
      <BannerBreadcrumb
        breadcrumbs={[
          { label: "Home", link: "/home" },
          {
            label: capitalizeCategory(product.category),
            link: `/collections/${product.categorySlug}`,
          },
          { label: product.name },
        ]}
        title={product.name}
        backgroundImage="https://images.unsplash.com/photo-1445205170230-053b83016050"
      />
      <div className="product-detail">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="product-images-container">
                <div className="thumbnails-container d-none d-md-flex" ref={thumbnailsContainerRef}>
                  {product.images?.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${activeImageIndex === index ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(index)}
                      onMouseEnter={() => handleThumbnailMouseEnter(index)}
                      onMouseLeave={handleThumbnailMouseLeave}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} - view ${index + 1}`}
                        className="thumbnail-image"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80x120?text=Image+Not+Found";
                        }}
                      />
                      {hoverIndex === index && (
                        <IconLink
                          iconType="wishlist"
                          className={`thumbnail-heart-icon ${
                            wishlistItems.some((item) => item.id === product.id) ? "filled" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle();
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div
                  className="main-image-container"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  <img
                    ref={mainImageRef}
                    src={product.images?.[activeImageIndex] || product.image}
                    className="img-fluid product-images"
                    alt={product.name}
                    onError={(e) => (e.target.src = "/placeholder.svg")}
                  />
                  {isZoomed && (
                    <>
                      <div className="zoom-lens" ref={zoomLensRef}></div>
                      <div className="zoom-window" ref={zoomWindowRef}></div>
                    </>
                  )}
                </div>
              </div>
              <div className="mobile-thumbnails-container d-md-none">
                <div className="mobile-thumbnails-scroll">
                  {product.images?.map((img, index) => (
                    <div
                      key={index}
                      className={`mobile-thumbnail ${activeImageIndex === index ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(index)}
                      onMouseEnter={() => handleThumbnailMouseEnter(index)}
                      onTouchStart={() => handleThumbnailHover(index)}
                      onMouseLeave={handleThumbnailMouseLeave}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} - view ${index + 1}`}
                        className="thumbnail-image"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/60x90?text=Image+Not+Found";
                        }}
                      />
                      {hoverIndex === index && (
                        <IconLink
                          iconType="wishlist"
                          className={`mobile-thumbnail-heart-icon ${
                            wishlistItems.some((item) => item.id === product.id) ? "filled" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle();
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-6 product-details-container">
              <div className="product-details-content">
                <div className="brand-name" style={{ color: '#0058A3', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {product.brand}
                </div>
                <h1 className="product-title">{product.name}</h1>
                <div className="availability mb-1">
                  <span className="d-flex align-items-center">
                    Material:
                    <span className="ms-2 d-flex align-items-center">{product.material || "N/A"}</span>
                  </span>
                </div>
                <hr className="my-2" />
                <div className="product-price mb-3">
                  <span className="current-price">₹{product.price.toFixed(2)}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                      <span className="discount">-{product.discount}%</span>
                    </>
                  )}
                </div>
                <div className="availability mb-3">
                  <span className="d-flex align-items-center">
                    Availability:
                    <span className="ms-2 d-flex align-items-center">
                      <span className="stock-indicator me-2"></span>
                      {product.availability || "In Stock"}
                    </span>
                  </span>
                </div>
                <div className="color-selection mb-3">
                  <div className="mb-2">Color: {selectedColor}</div>
                  <div className="d-flex gap-2">
                    {product.color.split(", ").map((color) => (
                      <button
                        key={color}
                        className={`color-btn ${selectedColor === color ? "active" : ""}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="size-selection mb-3">
                  <div className="mb-2">Size: {selectedSize}</div>
                  <div className="d-flex gap-2">
                    {product.size.split(", ").map((size) => (
                      <button
                        key={size}
                        className={`size-btn ${selectedSize === size ? "active" : ""}`}
                        onClick={() => handleSizeChange(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="quantity-wishlist-container mb-3">
                  <div className="mb-2">Quantity</div>
                  <div className="quantity-with-wishlist d-flex align-items-center gap-3">
                    <div className="quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                        className="quantity-input"
                      />
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <IconLink
                      iconType="wishlist"
                      className={`heart-icon-quantity ${
                        wishlistItems.some((item) => item.id === product.id) ? "filled" : ""
                      }`}
                      onClick={handleWishlistToggle}
                    />
                  </div>
                </div>
                <div className="action-buttons">
                  <AddToCartButton
                    label="Add to Cart"
                    onClick={handleAddToCart}
                    showIcon={true}
                  />
                  <PurchaseNowTwoButton
                    label="Buy Now"
                    productId={product.slug}
                    onClick={handleBuyNow}
                    showIcon={true}
                  />
                </div>
                <div className="product-tabs mt-4">
                  <div className="tab-nav">
                    <button
                      className={`tab-btn ${activeTab === "specifications" ? "active" : ""}`}
                      onClick={() => setActiveTab("specifications")}
                    >
                      Specifications
                    </button>
                    <button
                      className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
                      onClick={() => setActiveTab("about")}
                    >
                      About
                    </button>
                  </div>
                  <div className="tab-content">
                    {activeTab === "specifications" && (
                      <div className="specifications-tab">
                        <ul>
                          {Object.entries(product.specifications || {}).map(([key, value]) => (
                            <li key={key}>
                              <span className="meta-label">{key}:</span> {renderSpecificationValue(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activeTab === "about" && (
                      <div className="about-tab">
                        <p className="product-detailed-description">{product.about}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <YouMayAlsoLike brand={product.brand} />
        <Newsletter />
      </div>
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
    </>
  );
};

export default ProductDetail;