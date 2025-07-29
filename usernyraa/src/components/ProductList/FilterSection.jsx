import React, { useState, useEffect } from "react";

const FilterSection = ({ onFilterChange, currentFilters, filterOptions, filteredProducts }) => {
  const [filters, setFilters] = useState(
    currentFilters || {
      availability: [],
      priceRange: { min: 0, max: 50000 },
      size: [],
      style: [],
      material: [],
      brand: [],
      color: [],
    }
  );

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleCheckboxChange = (category, value) => {
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((v) => v !== value)
          : [...prev[category], value],
      };
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        priceRange: { ...prev.priceRange, [name]: parseInt(value) || 0 },
      };
      onFilterChange(updatedFilters);
      return updatedFilters;
    });
  };

  return (
    <div className="p-3 bg-light filter-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <svg
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="me-2"
          >
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5zm0 4A.5.5 0 0 1 2 5h10a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5zm0 4A.5.5 0 0 1 2 9h6a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5z" />
          </svg>
          Filters
        </h5>
      </div>

      <div className="mb-3">
        <h6 className="mb-2">Availability</h6>
        {(filterOptions?.availability || [])
          .filter(({ value }) => value === "In Stock")
          .map(({ value, label }) => (
            <div key={value}>
              <input
                type="checkbox"
                checked={filters.availability.includes(value)}
                onChange={() => handleCheckboxChange("availability", value)}
              />{" "}
              {label}
            </div>
          ))}
      </div>

      <div className="mb-3">
        <h6 className="mb-2">Price (₹)</h6>
        <p className="text-muted small mb-2">
          Min: ₹{(filterOptions?.priceRange?.min || 0).toFixed(0)} - Max: ₹
          {(filterOptions?.priceRange?.max || 50000).toFixed(0)}
        </p>
        <input
          type="number"
          name="min"
          placeholder="From"
          className="form-control mb-2"
          value={filters.priceRange.min}
          onChange={handlePriceChange}
          min={filterOptions?.priceRange?.min || 0}
          max={filterOptions?.priceRange?.max || 50000}
        />
        <input
          type="number"
          name="max"
          placeholder="To"
          className="form-control"
          value={filters.priceRange.max}
          onChange={handlePriceChange}
          min={filterOptions?.priceRange?.min || 0}
          max={filterOptions?.priceRange?.max || 50000}
        />
      </div>

      <div className="mb-3">
        <h6 className="mb-2">Size</h6>
        {(filterOptions?.size || []).map(({ value, label }) => (
          <div key={value}>
            <input
              type="checkbox"
              checked={filters.size.includes(value)}
              onChange={() => handleCheckboxChange("size", value)}
            />{" "}
            {label}
          </div>
        ))}
      </div>

      <div className="mb-3">
        <h6 className="mb-2">Color</h6>
        {(filterOptions?.color || []).map(({ value, label }) => (
          <div key={value}>
            <input
              type="checkbox"
              checked={filters.color.includes(value)}
              onChange={() => handleCheckboxChange("color", value)}
            />{" "}
            {label}
          </div>
        ))}
      </div>

      <div className="mb-3">
        <h6 className="mb-2">Style</h6>
        {(filterOptions?.style || []).map(({ value, label }) => (
          <div key={value}>
            <input
              type="checkbox"
              checked={filters.style.includes(value)}
              onChange={() => handleCheckboxChange("style", value)}
            />{" "}
            {label}
          </div>
        ))}
      </div>

      <div className="mb-3">
        <h6 className="mb-2">Material</h6>
        {(filterOptions?.material || []).map(({ value, label }) => (
          <div key={value}>
            <input
              type="checkbox"
              checked={filters.material.includes(value)}
              onChange={() => handleCheckboxChange("material", value)}
            />{" "}
            {label}
          </div>
        ))}
      </div>

      <div className="mb-3">
        <h6 className="mb-2">Brand</h6>
        {(filterOptions?.brand || []).map(({ value, label }) => (
          <div key={value}>
            <input
              type="checkbox"
              checked={filters.brand.includes(value)}
              onChange={() => handleCheckboxChange("brand", value)}
            />{" "}
            {label}
          </div>
        ))}
      </div>

      <style>{`
        :root {
          --primary-color: #C5A47E;
          --hover-color: #b58963;
          --text-color: #333;
          --border-color: #eee;
          --background-color: #f8f9fa;
          --muted-color: #999;
          --font-family: 'Open Sans', sans-serif;
        }

        .filter-section {
          border-radius: 4px;
          font-family: var(--font-family);
          background-color: var(--background-color);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        h5 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-color);
        }
        h6 {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-color);
        }
        .form-control {
          font-size: 0.85rem;
          padding: 6px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-color);
        }
        input[type="checkbox"] {
          margin-right: 6px;
          vertical-align: middle;
        }
        div {
          font-size: 0.85rem;
          color: var(--text-color);
          margin-bottom: 4px;
        }
        .text-muted {
          font-size: 0.8rem;
          color: var(--muted-color);
        }
        @media (max-width: 768px) {
          .filter-section {
            padding: 12px;
          }
          h5 {
            font-size: 0.95rem;
          }
          h6 {
            font-size: 0.85rem;
          }
          .form-control {
            font-size: 0.8rem;
            padding: 4px;
          }
          div {
            font-size: 0.8rem;
          }
        }
        @media (max-width: 576px) {
          .filter-section {
            padding: 10px;
          }
          h5 {
            font-size: 0.9rem;
          }
          h6 {
            font-size: 0.8rem;
          }
          .form-control {
            font-size: 0.75rem;
          }
          div {
            font-size: 0.75rem;
          }
          .text-muted {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FilterSection;
