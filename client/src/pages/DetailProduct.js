import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

import './DetailProduct.css';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id); // Custom validation function

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const DetailProduct = () => {
    const { productId } = useParams(); // Ensure productId is correctly extracted
    const [product, setProduct] = useState(null);
    const [phoneDetails, setPhoneDetails] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPhone, setUserPhone] = useState(null);
    const [mainImage, setMainImage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (!productId || !isValidObjectId(productId)) {
                    throw new Error('Invalid product ID');
                }
                console.log('Fetching product with ID:', productId); // Log productId
                const response = await axios.get(`http://localhost:5000/api/products/${productId}/phone-details`);
                const productData = response.data.product;
                const phoneDetailsData = response.data.phoneDetails;

                setProduct(productData); // Ensure the correct data path
                setPhoneDetails(phoneDetailsData);

                if (productData && productData.images && productData.images.length > 0) {
                    setMainImage(productData.images[0]);
                }

                // Fetch similar products after getting product category
                if (productData.category) {
                    console.log('Fetching similar products for category:', productData.category); // Log category
                    const similarResponse = await axios.get(`http://localhost:5000/api/products/category/${productData.category}`);
                    console.log('Fetched similar products response:', similarResponse.data); // Log the similar products response
                    // Filter out the current product and limit to 5 items
                    const filteredProducts = similarResponse.data.data
                        .filter(p => p._id !== productId)
                        .slice(0, 5);
                    
                    console.log('Filtered similar products:', filteredProducts); // Log filtered products
                    setSimilarProducts(filteredProducts);
                }

                if (productData.user_id && isValidObjectId(productData.user_id)) {
                    try {
                        console.log('Fetching user phone with user_id:', productData.user_id); // Log the user_id
                        const userResponse = await axios.get(`http://localhost:5000/api/users/${productData.user_id}/phone`);
                        console.log('Fetched user phone response:', JSON.stringify(userResponse.data, null, 2)); // Log the entire user response
                        if (userResponse.data && userResponse.data.phone) {
                            console.log('User phone:', userResponse.data.phone); // Log the phone number
                            setUserPhone(userResponse.data.phone);
                        } else {
                            console.log('User phone not found in response'); // Log if phone number is not found
                        }
                    } catch (error) {
                        console.error('Error fetching user phone:', error);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        } else {
            setLoading(false);
        }
    }, [productId]);

    const handleThumbnailClick = (image) => {
        setMainImage(image);
    };

    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true, // Enable auto-play
        autoplaySpeed: 2000, // Set auto-play speed to 2 seconds
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="container">
            <div className="detail-product-body">
                <div className='detail-product'>
                    <div className="product-image">
                        <div className="product-image-main">
                            <img 
                                src={mainImage || product.images[0] || '/placeholder.jpg'} 
                                alt={product.name} 
                                onError={(e) => { e.target.src = '/assets/404-error-3060993_640.png'; }} 
                            />
                        </div>
                        <div className="product-image-mini">
                            {product.images.map((image, index) => (
                                <div 
                                    key={index} 
                                    className={`product-image-mini-item ${mainImage === image ? 'active' : ''}`}
                                    onClick={() => handleThumbnailClick(image)}
                                >
                                    <img 
                                        src={image || '/placeholder.jpg'} 
                                        alt={`${product.name} mini ${index + 1}`} 
                                        onError={(e) => { e.target.src = '/assets/404-error-3060993_640.png'; }} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="product-details">
                        <h1>{product.name}</h1>
                        <div className="price">
                            {formatCurrency(product.price)}
                        </div>
                        <div className="additional-details">
                            <p>Danh Mục: {product.category}</p>
                            <p>Màu Sắc: {phoneDetails && phoneDetails.length > 0 ? phoneDetails[0].color : 'N/A'}</p>
                            <p>Bộ Nhớ: {phoneDetails && phoneDetails.length > 0 ? phoneDetails.map(detail => detail.storage).join(', ') : 'N/A'}</p>
                            <p>Bán Tại: {product.location?.district?.name}, {product.location?.city?.name}</p>
                            <p>Đăng Ngày: {product.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Invalid Date'}</p>
                        </div>
                        <div className="button-group">
                            <button>Call: {userPhone || 'N/A'}</button>
                            <button>Chat</button>
                        </div>
                    </div>
                </div>

                <div className='div-detail-product'>
                    <h2>Mô tả chi tiết</h2>
                    <h3>{product.name}</h3>
                    <div className="product-description-content">
                        <p>{product.description}</p>
                    </div>

                    <div className="product-description">
                        <div className="specifications">
                            <h4>Thông số chi tiết</h4>
                            <table>
                                <tbody>
                                    <tr><td>Hãng:</td><td>{phoneDetails && phoneDetails.length > 0 ? phoneDetails[0].brand : 'N/A'}</td></tr>
                                    <tr><td>Dung lượng:</td><td>{phoneDetails && phoneDetails.length > 0 ? phoneDetails.map(detail => detail.storage).join(', ') : 'N/A'}</td></tr>
                                    <tr><td>Màu Sắc:</td><td>{phoneDetails && phoneDetails.length > 0 ? phoneDetails[0].color : 'N/A'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {similarProducts.length > 0 ? (
                <div className="similar-products">
                    <h2>Tin đăng tương tự</h2>
                    <Slider {...carouselSettings}>
                        {similarProducts.map(item => (
                            <Link key={item._id} to={`/product/${item._id}`} className="similar-product-card">
                                <div className="similar-product-image">
                                    <img 
                                        src={item.images[0] || '/placeholder.jpg'} 
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.src = '/assets/404-error-3060993_640.png';
                                        }}
                                    />
                                </div>
                                <div className="similar-product-info">
                                    <h3>{item.name}</h3>
                                    <p className="price">{formatCurrency(item.price)}</p>
                                    <p className="created-at">
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Invalid Date'}
                                    </p>
                                    <p className="location">
                                        {item.location?.district?.name}, {item.location?.city?.name}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </Slider>
                </div>
            ) : (
                <div>No similar products found.</div>
            )}
        </div>
    );
};

export default DetailProduct;
