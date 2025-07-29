import React from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/Banner/Banner";
import SupportSection from "../components/SupportSection/SupportSection";
import FeaturedCategories from "../components/FeaturedCategories/FeaturedCategories";
import LatestProducts from "../components/LatestProducts/LatestProducts";
import TrendingStyles from "../components/TrendingStyles/TrendingStyles";
import FeaturedCollections from "../components/FeaturedCollections/FeaturedCollections";
import ActivewearSpotlight from "../components/ActivewearSpotlight/ActivewearSpotlight";
import Newsletter from "../components/Newsletter/Newsletter";
import ClothingSpotlight from "../components/ClothingSpotlight/ClothingSpotlight";

const HomePage = () => {
  const navigate = useNavigate();

  const handleProductClick = (id) => navigate(`product/${id}`);
  const handleCategoryClick = (category) => navigate(`collections/${category}`);

  return (
    <div>
      <Banner />
      <SupportSection />
      <FeaturedCategories onCategoryClick={handleCategoryClick} />
      <LatestProducts onProductClick={handleProductClick} />
      <TrendingStyles onProductClick={handleProductClick} />
      <FeaturedCollections onProductClick={handleProductClick} />
      <ClothingSpotlight />
      <ActivewearSpotlight onProductClick={handleProductClick} />
      <Newsletter />
    </div>
  );
};

export default HomePage;