"use client"

import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import IconLink from "../ui/Icons"
import { BuyNowButton } from "../ui/Buttons"
import { addToWishlist, removeFromWishlist } from "../../store/wishlistSlice"
import "../../styles/ProductSlider.css"

const FeaturedCollections = () => {
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCards, setVisibleCards] = useState(5)
  const [hoveredProductId, setHoveredProductId] = useState(null)

  // Fetch featured products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        let allProducts = []
        let page = 1
        let totalPages = 1

        while (page <= totalPages) {
          const response = await fetch(`http://localhost:5000/api/products?page=${page}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`)
          }
          const data = await response.json()
          console.log(`API Response (page ${page}):`, data) // Debug: Log API response
          if (!data.success) {
            throw new Error(data.error || "API request failed")
          }
          const productArray = data.data?.products || []
          if (!Array.isArray(productArray)) {
            throw new Error("Could not extract product array from API response")
          }
          allProducts = [...allProducts, ...productArray]
          totalPages = data.data?.pagination?.totalPages || 1
          page++
        }

        console.log("All Products:", allProducts) // Debug: Log all products

        // Transform API data to match expected structure
        const transformedData = allProducts.map((item) => {
          const variants = Array.isArray(item.variants) ? item.variants : []
          const firstVariant = variants[0] || {}
          return {
            id: item.id?.toString() || `temp-${Math.random()}`, // Fallback ID
            slug: item.slug || generateSlug(item.name || "unnamed-product"),
            name: item.name || "Unnamed Product",
            price: firstVariant.price || item.price || 0,
            originalPrice: firstVariant.originalPrice || item.originalPrice || firstVariant.price || 0,
            discount: item.discount || 0,
            category: item.category || "Uncategorized",
            categorySlug: item.cat_slug || generateSlug(item.category || "uncategorized"),
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
            featured: item.featured || false, // Assuming API may provide a featured flag
          }
        })

        console.log("Transformed Data:", transformedData) // Debug: Log transformed data

        // Select featured products: prioritize featured=true, fallback to top 6 by rating
        let featuredProducts = transformedData
          .filter((product) => product.featured)
          .slice(0, 6)

        if (featuredProducts.length < 6) {
          // Fallback to top 6 products by rating
          featuredProducts = transformedData
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 6)
        }

        console.log("Featured Products:", featuredProducts) // Debug: Log final featured products

        if (featuredProducts.length === 0) {
          toast.warn("No products available to display in Featured Collections.", {
            position: "top-right",
            autoClose: 3000,
          })
        }

        setProducts(featuredProducts)
        setLoading(false)
      } catch (err) {
        console.error("FeaturedCollections: Failed to load products:", err.message)
        setError(err.message)
        setProducts([])
        setLoading(false)
        toast.error(`Failed to load products: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        })
      }
    }

    fetchProducts()
    window.scrollTo(0, 0)
  }, [])

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleResize = () => {
    if (!containerRef.current) {
      return
    }
    const width = window.innerWidth
    if (width >= 1200) {
      setVisibleCards(5)
    } else if (width >= 992) {
      setVisibleCards(4)
    } else if (width >= 768) {
      setVisibleCards(2)
    } else {
      setVisibleCards(2)
    }
  }

  const handleImageHover = (productId) => {
    setHoveredProductId(productId)
  }

  const handleImageLeave = () => {
    setHoveredProductId(null)
  }

  const handleWishlistToggle = (product, e) => {
    e.stopPropagation()
    const isInWishlist = wishlistItems.some((item) => item.id === product.id)
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id))
    } else {
      dispatch(addToWishlist(product))
    }
  }

  const handleNavigation = (productId, product) => {
    window.scrollTo(0, 0)
    navigate(`/product/${product.slug}`, {
      replace: false,
      state: { product },
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [products])

  if (loading) {
    return (
      <section className="product-slider">
        <div className="text-center py-5">
          <div className="spinner"></div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="product-slider">
        <div className="text-center py-5">
          <h5>Error: {error}</h5>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
        <ToastContainer />
      </section>
    )
  }

  return (
    <section className="product-slider">
      <div className="products-wrapper">
        <h2 className="section-title">Featured Collections</h2>
        <p className="section-subtitle">Explore our top picks</p>

        <div className="products-container">
          <button
            className="arrow-button left-arrow d-none d-md-flex"
            onClick={() => {
              if (containerRef.current) {
                const scrollAmount = containerRef.current.clientWidth
                containerRef.current.scrollBy({
                  left: -scrollAmount,
                  behavior: "smooth",
                })
              }
            }}
            aria-label="Previous products"
          >
            <IconLink iconType="left-arrow" isArrow />
          </button>

          <div className="scroll-container" ref={containerRef}>
            {products.length === 0 ? (
              <div className="text-center py-5">
                <h5>No featured products available</h5>
                <p>Check back later or explore all products!</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/products")}
                >
                  View All Products
                </button>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="product-card" onClick={() => handleNavigation(product.id, product)}>
                  <div
                    className="product-image-container"
                    onMouseEnter={() => handleImageHover(product.id)}
                    onMouseLeave={handleImageLeave}
                  >
                    <img
                      src={
                        hoveredProductId === product.id && product.secondaryImage ? product.secondaryImage : product.image
                      }
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                    <div className="wishlist-wrapper">
                      <IconLink
                        iconType="wishlist"
                        className={`wishlist-icon ${wishlistItems.some((item) => item.id === product.id) ? "filled" : ""}`}
                        onClick={(e) => handleWishlistToggle(product, e)}
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
                    <BuyNowButton
                      className="purchase-button"
                      label="Shop Now"
                      productId={product.slug}
                      onClick={() => handleNavigation(product.id, product)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="arrow-button right-arrow d-none d-md-flex"
            onClick={() => {
              if (containerRef.current) {
                const scrollAmount = containerRef.current.clientWidth
                containerRef.current.scrollBy({
                  left: scrollAmount,
                  behavior: "smooth",
                })
              }
            }}
            aria-label="Next products"
          >
            <IconLink iconType="right-arrow" isArrow />
          </button>
        </div>
      </div>
      <ToastContainer />
    </section>
  )
}

export default FeaturedCollections