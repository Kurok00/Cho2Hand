/// <reference types="node" />
import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../hooks/useProducts.ts';
import './Body.css';
import { Link, useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  image: string;
}

const BodyComponent: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { products = [], loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/categories`);
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const result = await response.json();

        if (result?.status === 200 && result.data != null && Array.isArray(result.data)) {
          setCategories(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Ensure categories is an array
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (productsError) {
      const timer = setTimeout(() => {
        fetchProducts();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [productsError, fetchProducts]);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    navigate(`/category/${categoryName}`, { 
      state: { categoryId, categoryName } 
    });
  };

  const sortedProducts = products.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container">
      <div className='body'>
        <div className="banner">
          <img src="/banner.jpg" alt="Banner" />
        </div>

        <div className="category">
          <div style={{ textAlign: 'left', marginLeft: '15px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Danh Mục</p>     
          </div>
          
          <div className="category-grid">
            {loading ? (
              <div className="loading-state">Đang tải danh mục...</div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <button 
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  className="category-button"
                >
                  <img src={category.image} alt={category.name} />
                  <span>{category.name}</span>
                </button>
              ))
            ) : (
              <div className="empty-state">Không có danh mục nào</div>
            )}
          </div>
        </div>

        <div className="tin-dang">
          <div style={{ textAlign: 'left', marginLeft: '15px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Tin Đăng</p>     
          </div>
          
          <div className="tin-dang-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {productsLoading ? (
              <div className="loading-state">Đang tải sản phẩm...</div>
            ) : productsError ? (
              <div className="error-state">Lỗi: {productsError}</div>
            ) : sortedProducts && sortedProducts.length > 0 ? (
              sortedProducts.map(product => (
                <Link key={product._id} to={`/product/${product._id}`} className="product-card">
                  <img 
                    src={product.images[0] || '/placeholder.jpg'} 
                    alt={product.name}
                    onError={(e) => {
                      console.log('Image not found, using default image.');
                      (e.target as HTMLImageElement).src = '/assets/404-error-3060993_640.png';
                    }}
                  />
                  <span className="product-name">{product.name}</span>
                  <div className="product-info">
                    <span className="price">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(product.price)}
                    </span>
                    <span className="location">{product.location}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">Không có sản phẩm nào</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyComponent;