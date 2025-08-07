
"use client"

import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Spinner } from "react-bootstrap"
import IconLink from "../ui/Icons"
import { addToWishlist, removeFromWishlist } from "../../store/wishlistSlice"
import "./TrendingStyles.css"

const TrendingStyles = () => {
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragThreshold] = useState(5)
  const [clickStarted, setClickStarted] = useState(false)
  const [moveDistance, setMoveDistance] = useState(0)
  const [visibleCards, setVisibleCards] = useState(5)

  // Fetch trending products from API
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
            trending: item.trending || item.featured || false, // Check for trending or featured flag
          }
        })

        console.log("Transformed Data:", transformedData) // Debug: Log transformed data

        // Select trending products: prioritize trending=true or featured=true, fallback to top 7 by rating
        let trendingProducts = transformedData
          .filter((product) => product.trending || product.featured)
          .slice(0, 7)

        if (trendingProducts.length < 7) {
          trendingProducts = transformedData
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 7)
        }

        console.log("Trending Products:", trendingProducts) // Debug: Log final trending products

        if (trendingProducts.length === 0) {
          toast.warn("No trending products available.", {
            position: "top-right",
            autoClose: 3000,
          })
        }

        setItems(trendingProducts)
        setLoading(false)
      } catch (err) {
        console.error("TrendingStyles: Failed to load products:", err.message)
        setError(err.message)
        setItems([])
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

  // Handle window resize for responsive card display
  const handleResize = () => {
    if (!scrollRef.current) {
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
      setVisibleCards(1)
    }
  }

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (!scrollRef.current) {
      return
    }
    setClickStarted(true)
    setStartX(e.pageX)
    setScrollLeft(scrollRef.current.scrollLeft)
    setMoveDistance(0)
  }

  const handleMouseMove = (e) => {
    if (!clickStarted || !scrollRef.current) return
    const x = e.pageX
    const distance = Math.abs(x - startX)
    setMoveDistance(distance)
    if (distance > dragThreshold) {
      if (!isDragging) {
        setIsDragging(true)
        scrollRef.current.classList.add("dragging")
      }
      const walk = startX - x
      scrollRef.current.scrollLeft = scrollLeft + walk
    }
  }

  const handleMouseUp = () => {
    setClickStarted(false)
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.classList.remove("dragging")
      const cardWidth = scrollRef.current.querySelector(".trending-card")?.offsetWidth || 0
      const gap = 16
      const scrollPosition = scrollRef.current.scrollLeft
      const cardFullWidth = cardWidth + gap
      if (cardFullWidth > 0) {
        const nearestCardIndex = Math.round(scrollPosition / cardFullWidth)
        scrollRef.current.scrollTo({
          left: nearestCardIndex * cardFullWidth,
          behavior: "smooth",
        })
      }
    }
  }

  const handleMouseLeave = () => {
    if (isDragging && scrollRef.current) {
      scrollRef.current.classList.remove("dragging")
    }
    setClickStarted(false)
    setIsDragging(false)
  }

  // Touch drag handlers
  const handleTouchStart = (e) => {
    if (!scrollRef.current) {
      return
    }
    setClickStarted(true)
    setStartX(e.touches[0].pageX)
    setScrollLeft(scrollRef.current.scrollLeft)
    setMoveDistance(0)
  }

  const handleTouchMove = (e) => {
    if (!clickStarted || !scrollRef.current) return
    const x = e.touches[0].pageX
    const distance = Math.abs(x - startX)
    setMoveDistance(distance)
    if (distance > dragThreshold) {
      if (!isDragging) {
        setIsDragging(true)
        scrollRef.current.classList.add("dragging")
      }
      const walk = startX - x
      scrollRef.current.scrollLeft = scrollLeft + walk
    }
  }

  const handleTouchEnd = () => {
    setClickStarted(false)
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.classList.remove("dragging")
      const cardWidth = scrollRef.current.querySelector(".trending-card")?.offsetWidth || 0
      const gap = 16
      const scrollPosition = scrollRef.current.scrollLeft
      const cardFullWidth = cardWidth + gap
      if (cardFullWidth > 0) {
        const nearestCardIndex = Math.round(scrollPosition / cardFullWidth)
        scrollRef.current.scrollTo({
          left: nearestCardIndex * cardFullWidth,
          behavior: "smooth",
        })
      }
    }
  }

  // Handle wishlist toggle
  const handleWishlistToggle = (item, e) => {
    e.stopPropagation()
    const isInWishlist = wishlistItems.some((wishlistItem) => wishlistItem.id === item.id)
    if (isInWishlist) {
      dispatch(removeFromWishlist(item.id))
      toast.info(`${item.name} removed from wishlist`, {
        position: "top-right",
        autoClose: 2000,
      })
    } else {
      dispatch(addToWishlist(item))
      toast.success(`${item.name} added to wishlist`, {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  // Handle product click to navigate to product details
  const handleProductClick = (item) => {
    if (moveDistance <= dragThreshold) {
      navigate(`/product/${item.slug}`, {
        state: { product: item, from: "/home", scrollPosition: window.scrollY }
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="trending-section">
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
      </div>
    )
  }

  return (
    <div className="trending-section">
      <h2 className="text-center mb-4">Trending Styles</h2>
      <div className="trending-scrollable-container">
        <button
          className="arrow-button left-arrow d-none d-md-flex"
          onClick={() => {
            if (scrollRef.current) {
              const scrollAmount = scrollRef.current.clientWidth
              scrollRef.current.scrollBy({
                left: -scrollAmount,
                behavior: "smooth",
              })
            }
          }}
          aria-label="Previous products"
        >
          <IconLink iconType="left-arrow" isArrow />
        </button>
        <div
          className="trending-scrollable"
          ref={scrollRef}
          role="region"
          aria-label="Trending styles carousel"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {items.length === 0 ? (
            <div className="text-center py-5">
              <h5>No trending products available</h5>
              <p>Check back later or explore all products!</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/products")}
              >
                View All Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="trending-card" onClick={() => handleProductClick(item)}>
                <div className="image-container">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="trending-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg"
                    }}
                    draggable="false"
                  />
                  {item.discount > 0 && <span className="discount-badge">{item.discount}% OFF</span>}
                  <IconLink
                    iconType="heart"
                    className={`heart-icon ${wishlistItems.some((wishlistItem) => wishlistItem.id === item.id) ? "filled" : ""}`}
                    onClick={(e) => handleWishlistToggle(item, e)}
                  />
                  <div className="image-overlay">
                    <h6 className="card-title">{item.name}</h6>
                    <div className="card-price">
                      {item.discount > 0 && <span className="original-price">₹{item.originalPrice.toFixed(0)}</span>}
                      <span className="current-price">₹{item.price.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          className="arrow-button right-arrow d-none d-md-flex"
          onClick={() => {
            if (scrollRef.current) {
              const scrollAmount = scrollRef.current.clientWidth
              scrollRef.current.scrollBy({
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
      <ToastContainer />
    </div>
  )
}

export default TrendingStyles
