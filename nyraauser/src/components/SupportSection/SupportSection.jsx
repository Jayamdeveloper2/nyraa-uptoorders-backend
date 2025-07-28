import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import IconLink from '../ui/Icons';
import './SupportSection.css';

const SupportSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  
  const supportItems = [
    {
      id: 1,
      icon: <IconLink iconType="shipping" isSupport />,
      title: 'WORLDWIDE SHIPPING',
      description: 'For all orders over ₹100',
    },
    {
      id: 2,
      icon: <IconLink iconType="guarantee" isSupport />,
      title: 'SECURE PAYMENTS',
      description: 'Safe & trusted transactions',
    },
    {
      id: 3,
      icon: <IconLink iconType="discount" isSupport />,
      title: 'EXCLUSIVE OFFERS',
      description: 'Special discounts available',
    },
    {
      id: 4,
      icon: <IconLink iconType="support" isSupport />,
      title: '24/7 SUPPORT SERVICES',
      description: 'Contact us anytime',
    },
  ];

  const scrollToItem = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const items = container.querySelectorAll('.support-item-mobile');
      if (items[index]) {
        container.scrollTo({
          left: items[index].offsetLeft - container.offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollPosition = container.scrollLeft;
        const itemWidth = container.offsetWidth;
        const newIndex = Math.round(scrollPosition / itemWidth);
        
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex]);
  
  return (
    <section className="py-3 support-section">
      <Container fluid>
        <Row className="d-none d-md-flex text-center justify-content-center">
          {supportItems.map((item) => (
            <Col md={3} key={item.id} className="support-item">
              <div className="support-box d-flex align-items-center justify-content-center">
                <div className="support-icon-wrapper me-3">
                  <div className="icon-state normal">{item.icon}</div>
                  <div className="icon-state hover">{item.icon}</div>
                </div>
                <div className="text-start">
                  <h6 className="mb-0 fw-bold text-uppercase">{item.title}</h6>
                  <small className="text-muted">{item.description}</small>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="d-md-none mobile-support-container">
          <div className="support-scroll-container" ref={scrollContainerRef}>
            {supportItems.map((item, index) => (
              <div key={item.id} className="support-item-mobile">
                <div className="support-icon-wrapper">
                  <div className="icon-state normal">{item.icon}</div>
                  <div className="icon-state hover">{item.icon}</div>
                </div>
                <h6 className="fw-bold mt-3 text-uppercase">{item.title}</h6>
                <p className="text-muted small mb-2">{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mobile-scroll-indicators">
            <div className="scroll-dots">
              {supportItems.map((item, index) => (
                <span 
                  key={index} 
                  className={`scroll-dot ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => scrollToItem(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default SupportSection;