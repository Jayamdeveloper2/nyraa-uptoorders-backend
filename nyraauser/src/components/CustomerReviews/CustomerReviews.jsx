import React, { useRef, useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const CustomerReviews = () => {
  const scrollRef = useRef();
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: "Luies Charls",
      role: "CEO",
      text: "Excellent product, worth every penny.",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-1.png?v=1737115558&width=100"
    },
    {
      id: 2,
      name: "Stefanie Rashford",
      role: "Founder",
      text: "Reliable product, consistently delivers.",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-2.png?v=1737115559&width=100"
    },
    {
      id: 3,
      name: "Augusta Wind",
      role: "Web Designer",
      text: "Excellent product, A+ customer service.",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-3.png?v=1737115558&width=100"
    },
    {
      id: 4,
      name: "Clara Jenkins",
      role: "Marketing Head",
      text: "Their service exceeded expectations.",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-4.png?v=1737115558&width=100"
    },
    {
      id: 5,
      name: "Jordan Marsh",
      role: "Creative Director",
      text: "Professional, efficient, and friendly support team.",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-1.png?v=1737115558&width=100"
    },
    {
      id: 6,
      name: "Nina Patel",
      role: "CTO",
      text: "From start to finish, it was a seamless experience.",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-2.png?v=1737115559&width=100"
    },
    {
      id: 7,
      name: "Carlos Mendes",
      role: "Tech Lead",
      text: "Affordable and effective, highly recommended!",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-3.png?v=1737115558&width=100"
    },
    {
      id: 8,
      name: "Alice Rivera",
      role: "Operations Manager",
      text: "Their team is quick to respond and deliver.",
      image: "https://jubilee-demo.myshopify.com/cdn/shop/files/author-4.png?v=1737115558&width=100"
    }
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track scroll position to update active indicator
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const scrollPosition = container.scrollLeft;
        const visibleWidth = container.clientWidth;
        const totalWidth = container.scrollWidth;
        
        // Calculate the index based on the scroll position
        const itemWidth = totalWidth / testimonials.length;
        const newIndex = Math.round(scrollPosition / itemWidth);
        
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < testimonials.length) {
          setActiveIndex(newIndex);
        }
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex, testimonials.length]);

  // Function to scroll to a specific item
  const scrollToItem = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const itemWidth = container.scrollWidth / testimonials.length;
      container.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 bg-light position-relative review-section">
      <div className="text-center mb-4">
        <h2 className="mb-2">What Our Clients Say</h2>
        <p className="text-muted">
          Hear from our customers about their clothing experiences
        </p>
      </div>

      <div className="position-relative review-container">
        <button className="scroll-btn left-arrow" onClick={() => scrollToItem(activeIndex - 1 >= 0 ? activeIndex - 1 : 0)}>←</button>
        <button className="scroll-btn right-arrow" onClick={() => scrollToItem(activeIndex + 1 < testimonials.length ? activeIndex + 1 : testimonials.length - 1)}>→</button>

        <div
          ref={scrollRef}
          className="review-scroll-container"
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="review-item">
              <Card className="shadow-sm border-0 text-center h-100">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <Card.Text className="text-dark mb-3">"{testimonial.text}"</Card.Text>
                  <div className="d-flex align-items-center justify-content-center mt-auto">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="rounded-circle me-2"
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        console.warn(`⚠️ Failed to load image for testimonial ${testimonial.id}: ${testimonial.image}`);
                        e.target.src = "https://www.asos.com/content/dam/asos1/userimages/profile-placeholder.jpg";
                      }}
                    />
                    <div>
                      <Card.Title className="mb-0 fs-6">{testimonial.name}</Card.Title>
                      <Card.Text className="text-muted small">{testimonial.role}</Card.Text>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>

        <div className="mobile-scroll-indicators">
          <div className="scroll-dots">
            {testimonials.map((_, index) => (
              <span 
                key={index} 
                className={`scroll-dot ${activeIndex === index ? 'active' : ''}`}
                onClick={() => scrollToItem(index)}
              ></span>
            ))}
          </div>
        </div>
      </div> 

      <style>
        {`
          .review-section {
            overflow: hidden;
          }
          
          .review-container {
            width: 100%;
            position: relative;
            padding: 0 10px;
          }
          
          .review-scroll-container {
            display: flex;
            overflow-x: auto;
            scroll-behavior: smooth;
            gap: 15px;
            padding: 10px 5px 20px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
          }
          
          .review-scroll-container::-webkit-scrollbar {
            display: none;
          }
          
          .review-item {
            flex: 0 0 calc(100% - 30px);
            scroll-snap-align: center;
            padding: 5px;
          }
          
          .scroll-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
            background-color: rgba(255, 255, 255, 0.8);
            border: none;
            font-size: 1.5rem;
            padding: 0.5rem 1rem;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            border-radius: 50%;
          }
          
          .left-arrow {
            left: 5px;
          }
          
          .right-arrow {
            right: 5px;
          }
          
          .mobile-scroll-indicators {
            display: flex;
            justify-content: center;
            margin-top: 10px;
          }
          
          .scroll-dots {
            display: flex;
            gap: 6px;
          }
          
          .scroll-dot {
            width: 8px;
            height: 8px;
            background-color: #ddd;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .scroll-dot.active {
            background-color: #c5a47e;
            transform: scale(1.2);
          }
          
          .scroll-dot:hover {
            background-color: #ccc;
          }
          
          @media (min-width: 576px) {
            .review-item {
              flex: 0 0 calc(50% - 15px);
            }
          }
          
          @media (min-width: 768px) {
            .review-item {
              flex: 0 0 calc(33.333% - 15px);
            }
          }
          
          @media (min-width: 992px) {
            .review-item {
              flex: 0 0 calc(25% - 15px);
            }
          }
          
          @media (max-width: 576px) {
            .scroll-btn {
              display: none;
            }
          }
        `}
      </style>
    </section>
  );
};

export default CustomerReviews;