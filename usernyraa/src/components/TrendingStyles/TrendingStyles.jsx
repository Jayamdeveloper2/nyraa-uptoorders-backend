"use client"

import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Spinner } from "react-bootstrap"
import IconLink from "../ui/Icons"
import allProducts from "../../data/productsData"
import "./TrendingStyles.css"

const TrendingStyles = () => {
  const scrollRef = useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragThreshold] = useState(5)
  const [clickStarted, setClickStarted] = useState(false)
  const [moveDistance, setMoveDistance] = useState(0)
  const [visibleCards, setVisibleCards] = useState(5)
  const navigate = useNavigate()

  // Curated trending products from productsData
  const trendingProducts = allProducts.slice(0, 7)

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

  // Initialize products and resize listener
  useEffect(() => {
    try {
      setItems(trendingProducts)
      setLoading(false)
      window.addEventListener("resize", handleResize)
      handleResize()
    } catch (error) {
      console.error("TrendingStyles: Error in initialization:", error)
    }
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

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

  // Handle product click to navigate to product details
  const handleProductClick = (item) => {
    if (moveDistance <= dragThreshold) {
      navigate(`/product/${item.id}`, {
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
          {items.map((item) => (
            <div key={item.id} className="trending-card" onClick={() => handleProductClick(item)}>
              <div className="image-container">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="trending-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x400"
                  }}
                  draggable="false"
                />
                {item.discount > 0 && <span className="discount-badge">{item.discount}% OFF</span>}
                <IconLink iconType="heart" className="heart-icon" />
                <div className="image-overlay">
                  <h6 className="card-title">{item.name}</h6>
                  <div className="card-price">
                    {item.discount > 0 && <span className="original-price">₹{item.originalPrice.toFixed(0)}</span>}
                    <span className="current-price">₹{item.price.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  )
}

export default TrendingStyles