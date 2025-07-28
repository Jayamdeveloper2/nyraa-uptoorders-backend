
import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import IconLink from "../../../components/ui/Icons"
import { BuyNowButton } from "../../../components/ui/Buttons"
import { addToWishlist, removeFromWishlist } from "../../../store/wishlistSlice"
import allProducts from "../../../data/productsData"
import "../../../styles/ProductSlider.css"

const YouMayAlsoLike = ({ brand }) => {
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCards, setVisibleCards] = useState(5)
  const [hoveredProductId, setHoveredProductId] = useState(null)

  const fetchProducts = async () => {
    try {
      const brandProducts = allProducts.filter((p) => p.brand === brand)
      const randomProducts = brandProducts.length >= 6
        ? brandProducts.sort(() => 0.5 - Math.random()).slice(0, 6)
        : [...brandProducts, ...allProducts.filter((p) => p.brand !== brand).sort(() => 0.5 - Math.random())].slice(0, 6)
      setProducts(randomProducts)
      setLoading(false)
    } catch (err) {
      console.error("YouMayAlsoLike: Failed to load products:", err.message)
      setProducts(allProducts.slice(0, 6))
      setLoading(false)
    }
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
    navigate(`/product/${productId}`, {
      replace: false,
      state: { product },
    })
  }

  useEffect(() => {
    fetchProducts()
  }, [brand])

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

  return (
    <section className="product-slider">
      <div className="products-wrapper">
        <h2 className="section-title">You May Also Like</h2>
        <p className="section-subtitle">Discover more products from {brand}</p>

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
            {products.map((product) => (
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
                      e.target.src = "https://via.placeholder.com/300x400"
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
                    onClick={() => handleNavigation(product.id, product)}
                  />
                </div>
              </div>
            ))}
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
    </section>
  )
}

export default YouMayAlsoLike
