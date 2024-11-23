import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                setUser(userData);

                try {
                    const response = await axios.get(`http://localhost:5000/api/products/user/${userData._id || userData.id}`);
                    setProducts(response.data.data); // Ensure response data is correctly accessed
                } catch (error) {
                    console.error('Error fetching user products:', error);
                }
            }
        };

        fetchUserProfile();
    }, []);

    if (!user) return <div>Loading...</div>;

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
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p><strong>Giá:</strong> {product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;