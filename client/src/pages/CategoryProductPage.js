import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/category/${categoryName}`);
                setProducts(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching products');
                setLoading(false);
            }
        };

        if (categoryName) {
            fetchCategoryProducts();
        }
    }, [categoryName]);

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
                                    value={filters.sort} 
                                    onChange={e => setFilters({...filters, sort: e.target.value})}
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
                                            <img src={product.images} alt={product.name} className="product-image" />
                                        </div>
                                        <div className="descript">
                                            <div className="product-details">
                                                <h2 className="product-name">{product.name}</h2>
                                                <p className="product-price">{product.price} VND</p>
                                                <p className="product-location">{product.location}</p>
                                                <button className="chat-button">Chat</button>
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
