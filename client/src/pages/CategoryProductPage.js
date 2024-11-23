import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { IoLocationOutline } from 'react-icons/io5'; // Add this import
import axios from 'axios';
import './CategoryProductPage.css';

const CategoryProductPage = () => {
    const location = useLocation();
    const { categoryId, categoryName } = location.state || {};
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        location: '',
        brand: '',
        price: '',
        condition: '',
        type: '',
        sellerType: 'all'
    });
    const [sortType, setSortType] = useState('newest');
    const navigate = useNavigate(); // Initialize useNavigate

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/category/${categoryName}`);
                const sortedProducts = sortProducts(response.data.data, sortType);
                setProducts(sortedProducts);
                setLoading(false);
            } catch (err) {
                setError('Error fetching products');
                setLoading(false);
            }
        };

        if (categoryName) {
            fetchCategoryProducts();
        }
    }, [categoryName, sortType]);

    const sortProducts = (products, type) => {
        switch (type) {
            case 'newest':
                return [...products].sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
            case 'price-asc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...products].sort((a, b) => b.price - a.price);
            default:
                return products;
        }
    };

    const handleSortChange = (e) => {
        const newSortType = e.target.value;
        setSortType(newSortType);
        const sortedProducts = sortProducts([...products], newSortType);
        setProducts(sortedProducts);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    const locations = ['Tp Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương'];
    const brands = ['Apple', 'Asus', 'HP', 'Dell', 'Acer', 'Lenovo', 'MSI', 'Samsung'];
    const types = ['Laptop Cũ', 'Laptop Gaming', 'Laptop Văn Phòng', 'Laptop Sinh Viên'];
    const priceRanges = ['Dưới 3 Triệu', 'Dưới 10 Triệu', '10-15 Triệu', 'Trên 15 Triệu'];

    const handleProductClick = (productId) => {
        console.log('Navigating to product with ID:', productId); // Log the product ID
        navigate(`/product/${productId}`);
    };

    return (
        <div className="container">
            <div className='body'>
                <div className="category-header">
                    <h1>{categoryName}</h1>
                </div>

                <div className="category-content">
                    <div className="filters-sidebar">
                        
                    </div>

                    <div className="products-section">
                        <div className="products-header">

                            <div className="brand-filter">  
                                <div className="brand-filter-grid">
                                    <p>Thương Hiệu: </p>
                                    <div className="filter-buttons">
                                        {brands.map(brand => (
                                            <button 
                                                key={brand} 
                                                className={`filter-button ${filters.brand === brand ? 'active' : ''}`} 
                                                onClick={() => setFilters({...filters, brand: filters.brand === brand ? '' : brand})}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="location-filter">
                                <div className="location-filter-grid">
                                    <p>Địa Điểm: </p>
                                    <div className="filter-buttons">
                                        {locations.map(location => (
                                            <button 
                                                key={location} 
                                                className={`filter-button ${filters.location === location ? 'active' : ''}`} 
                                                onClick={() => setFilters({...filters, location: filters.location === location ? '' : location})}
                                            >
                                                {location}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="type-filter">
                                <div className="type-filter-grid">
                                    <p>Loại: </p>
                                    <div className="filter-buttons">
                                        {types.map(type => (
                                            <button 
                                                key={type} 
                                                className={`filter-button ${filters.type === type ? 'active' : ''}`} 
                                                onClick={() => setFilters({...filters, type: filters.type === type ? '' : type})}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="sort-filter">
                                <p>Sắp xếp: </p>
                                <select 
                                    value={sortType} 
                                    onChange={handleSortChange}
                                    className="sort-select"
                                >
                                    <option value="newest">Tin mới trước</option>
                                    <option value="price-asc">Giá thấp đến cao</option>
                                    <option value="price-desc">Giá cao đến thấp</option>
                                </select>
                            </div>
                            
                        </div>

                        <div className="tin-dang-container">
                            <div className="tin-dang-ban">
                                {products.map(product => (
                                    <div key={product._id} className="product-card">
                                        <div 
                                            className="productImageDiv" 
                                            onClick={() => handleProductClick(product._id)} // Use handleProductClick
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img 
                                                src={Array.isArray(product.images) ? product.images[0] : product.images} 
                                                alt={product.name} 
                                                className="product-image"
                                                onError={(e) => {
                                                    e.target.src = '/assets/404-error-3060993_640.png'; // Fallback image
                                                }}
                                            />
                                        </div>
                                        <div className="descript">
                                            <div className="product-details">
                                                <h2 className="product-name">{product.name}</h2>
                                                <p className="product-price">{formatCurrency(product.price)}</p>
                                                
                                                <div className="location-wrapper">
                                                    <IoLocationOutline className="location-icon" />
                                                    <p className="product-location">
                                                        {product.location.city.name}, {product.location.district.name}
                                                    </p>
                                                </div>
                                                <p className="product-created-at">
                                                    {new Date(product.created_at).toLocaleDateString('vi-VN', {
                                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryProductPage;
