import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PostSale.css';
import { useNavigate } from 'react-router-dom';

const PostSale = () => {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        status: 'available',
        location: '',
        images: [],
        imagesmini1: [],
    });

    const [phoneDetails, setPhoneDetails] = useState({
        brand: '',
        model: '',
        color: '',
        storage: '',
        ram: ''
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [previewImages, setPreviewImages] = useState(Array(5).fill(null));
    const [imageLoading, setImageLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories');
                setCategories(response.data.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Không thể tải danh mục sản phẩm');
            }
        };

        fetchCategories();
    }, []);

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhoneDetailsChange = (e) => {
        const { name, value } = e.target;
        setPhoneDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('Chỉ được phép tải lên tối đa 5 ảnh');
            return;
        }
        setLoading(true);
        
        try {
            const uploadPromises = files.map(async file => {
                const formData = new FormData();
                formData.append('image', file);
                const response = await axios.post('http://localhost:5000/api/upload', formData);
                return response.data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            
            setProduct(prev => ({
                ...prev,
                main_image: uploadedUrls[0], // Hình đầu tiên là hình chính
                images: uploadedUrls,         // Tất cả các hình
                thumbnails: uploadedUrls      // Sử dụng cùng URL cho thumbnails (có thể thay đổi nếu muốn resize)
            }));
        } catch (err) {
            setError('Lỗi khi tải ảnh lên');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (index) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    setImageLoading(true);
                    const formData = new FormData();
                    formData.append('image', file);
                    const response = await axios.post('http://localhost:5000/api/upload', formData);
                    
                    setPreviewImages(prev => {
                        const newImages = [...prev];
                        newImages[index] = response.data.url;
                        return newImages;
                    });

                    setProduct(prev => ({
                        ...prev,
                        main_image: index === 0 ? response.data.url : prev.main_image,
                        images: previewImages.filter(img => img !== null),
                        thumbnails: previewImages.filter(img => img !== null)
                    }));
                } catch (err) {
                    setError('Lỗi khi tải ảnh lên');
                    console.error(err);
                } finally {
                    setImageLoading(false);
                }
            }
        };
        input.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate images
        const validImages = previewImages.filter(img => img !== null);
        if (validImages.length === 0) {
            setError('Vui lòng tải lên ít nhất một hình ảnh');
            setLoading(false);
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            setError('Vui lòng đăng nhập để đăng bán sản phẩm');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                product: {
                    ...product,
                    price: parseInt(product.price, 10),
                    user_id: user._id,
                    main_image: previewImages[0],
                    images: validImages,
                    thumbnails: validImages,
                },
                phoneDetails: product.category === 'Điện thoại' ? [phoneDetails] : []
            };

            const response = await axios.post('http://localhost:5000/api/products/with-phone-details', payload);
            console.log('Full response:', response.data); // Debug log

            if (response.status === 201 && response.data) {
                const productId = response.data.productId; // Get productId directly from response.data
                
                if (productId) {
                    setShowSuccessModal(true);
                    setTimeout(() => {
                        setShowSuccessModal(false);
                        window.location.href = `/product/${productId}`;
                    }, 1500);
                } else {
                    console.error('Could not find product ID in response:', response.data);
                    setError('Đăng bán thành công nhưng không thể chuyển trang');
                }
            }
        } catch (err) {
            console.error('Submit error:', err);
            console.error('Error response:', err.response);
            setError(err.response?.data?.message || err.response?.data?.error || 'Lỗi khi đăng sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-sale-container">
            <h2>Đăng Bán Sản Phẩm</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="post-sale-form">
                {/* Tên sản phẩm - Full width */}
                <div className="form-group">
                    <label>Tên sản phẩm</label>
                    <input 
                        className="form-control"
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleProductChange}
                        required
                    />
                </div>

                {/* Mô tả - Full width */}
                <div className="form-group">
                    <label>Mô tả chi tiết</label>
                    <textarea 
                        className="form-control"
                        name="description"
                        value={product.description}
                        onChange={handleProductChange}
                        rows="4"
                        required
                    />
                </div>

                {/* Danh mục và Giá - Half width */}
                <div className="form-group half">
                    <label>Danh mục</label>
                    <select
                        className="form-control"
                        name="category"
                        value={product.category}
                        onChange={handleProductChange}
                        required
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group half">
                    <label>Giá bán</label>
                    <input
                        className="form-control"
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleProductChange}
                        required
                    />
                </div>

                {/* Image Preview Section */}
                <div className="image-preview-section">
                    <label>Hình ảnh sản phẩm (Tối đa 5 hình)</label>
                    <div className="image-preview-container">
                        {previewImages.map((url, index) => (
                            <div 
                                key={index}
                                className={`preview-slot ${url ? 'has-image' : ''} ${index === 0 ? 'main-image' : ''}`}
                                onClick={() => handleImageSelect(index)}
                            >
                                {url ? (
                                    <>
                                        <img src={url} alt={`Preview ${index + 1}`} />
                                        {index === 0 && <span className="main-label">Ảnh chính</span>}
                                    </>
                                ) : (
                                    <div className="upload-placeholder">
                                        <i className="fas fa-plus"></i>
                                        <span>{index === 0 ? 'Thêm ảnh chính' : 'Thêm ảnh'}</span>
                                    </div>
                                )}
                                {imageLoading && <div className="loading-overlay"><div className="loading-spinner" /></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Phone Details Section */}
                {product.category === 'Điện thoại' && (
                    <div className="phone-details-section">
                        <h3>Thông số kỹ thuật</h3>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Hãng sản xuất</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={phoneDetails.brand}
                                    onChange={handlePhoneDetailsChange}
                                    className="form-control"
                                    placeholder="Ví dụ: Apple, Samsung..."
                                    required
                                />
                            </div>
                            <div className="form-group half">
                                <label>Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={phoneDetails.model}
                                    onChange={handlePhoneDetailsChange}
                                    className="form-control"
                                    placeholder="Ví dụ: iPhone 13, Galaxy S21..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Màu sắc</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={phoneDetails.color}
                                    onChange={handlePhoneDetailsChange}
                                    className="form-control"
                                    placeholder="Ví dụ: Đen, Trắng..."
                                    required
                                />
                            </div>
                            <div className="form-group half">
                                <label>Bộ nhớ trong</label>
                                <input
                                    type="text"
                                    name="storage"
                                    value={phoneDetails.storage}
                                    onChange={handlePhoneDetailsChange}
                                    className="form-control"
                                    placeholder="Ví dụ: 64GB, 128GB..."
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>RAM</label>
                                <input
                                    type="text"
                                    name="ram"
                                    value={phoneDetails.ram}
                                    onChange={handlePhoneDetailsChange}
                                    className="form-control"
                                    placeholder="Ví dụ: 4GB, 8GB..."
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Đăng bán'}
                </button>
            </form>

            {/* Loading overlay for form submission */}
            {loading && (
                <div className="modal-overlay">
                    <div className="loading-spinner" />
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <h3>Đăng bán thành công!</h3>
                        <p>Đang chuyển đến trang sản phẩm...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostSale;
