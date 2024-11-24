import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Replace useHistory with useNavigate
import axios from 'axios';
import './Profile.css';


const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null); // State to store user data
    const [products, setProducts] = useState<any[]>([]); // State to store user's products
    const navigate = useNavigate(); // Use navigate for navigation

    useEffect(() => {
        const fetchUserProfile = async () => {
            const savedUser = localStorage.getItem('user'); // Get user data from localStorage
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                setUser(userData);

                try {
                    console.log(`Fetching products for user ID: ${userData._id || userData.id}`); // Debug log
                    const response = await axios.get(`https://cho2hand-3.onrender.com/api/products/user/${userData._id || userData.id}`);
                    console.log('Fetched products:', response.data.data); // Log fetched products
                    setProducts(response.data.data); // Set products data
                } catch (error) {
                    console.error('Error fetching user products:', error);
                }
            }
        };

        fetchUserProfile();
    }, []);

    if (!user) return <div>Loading...</div>; // Show loading state if user data is not available

    const handleProductClick = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    return (
        <div className="profile-container">
            <h2>Thông tin tài khoản</h2>
            <div className="profile-info">
                <p><strong>Tên đăng nhập:</strong> {user.username}</p>
                <p><strong>Họ và tên:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Số điện thoại:</strong> {user.phone}</p>
                {user.location && user.location.city && user.location.district && (
                    <>
                        <p><strong>Thành phố:</strong> {user.location.city?.name || 'N/A'}</p>
                        <p><strong>Quận/Huyện:</strong> {user.location.district?.name || 'N/A'}</p>
                    </>
                )}
            </div>
            <h2>Sản phẩm đã đăng</h2>
            <div className="products-list">
                {products.map(product => {
                    const createdAt = new Date(product.created_at);
                    console.log('Product createdAt:', product.created_at, createdAt); // Log createdAt field
                    return (
                        <div key={product.id} className="product-item" onClick={() => handleProductClick(product._id)}>
                            <img src={product.images[0]} alt={product.name} /> {/* Render product image */}
                            <div className="product-details">
                                <h3>{product.name}</h3>
                                <p><strong>Giá:</strong> {product.price}</p>
                                {product.location && (
                                    <p><strong>Địa điểm:</strong> {product.location.city.name}, {product.location.district.name}</p>
                                )}
                                <p><strong>Ngày đăng:</strong> {product.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Invalid Date'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Profile;