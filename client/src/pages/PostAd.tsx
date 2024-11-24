import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PostAd.css';
import { useNavigate } from 'react-router-dom';

interface Category {
    _id: string;
    name: string;
}

interface Product {
    name: string;
    description: string;
    category: string;
    price: number;
    location: Location;
    status: string;
    images: string[];
}

interface PhoneDetail {
    color: string;
    storage: string;
    brand: string;
    model: string;
    ram: string;
}

interface Location {
    _id?: string;
    city_id: string;
    district_id: string;
    city?: {
        _id: string;
        name: string;
    };
    district?: {
        _id: string;
        name: string;
    };
}

interface UserLocation {
    city: {
        id: string;
        name: string;
    };
    district: {
        id: string;
        name: string;
        city_id: string;
    };
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const PostAd = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product>({
        name: '',
        description: '',
        category: '',
        price: 0,
        location: {
            city_id: '',
            district_id: '',
            city: {
                _id: '',
                name: ''
            },
            district: {
                _id: '',
                name: ''
            }
        },
        status: 'available',
        images: []
    });

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setProduct({
                ...product,
                price: parseInt(value, 10) || 0,
            });
        }
    };

    const [phoneDetail, setPhoneDetail] = useState<PhoneDetail>({
        color: '',
        storage: '',
        brand: '',
        model: '',
        ram: ''
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedImages, setSelectedImages] = useState<(File | null)[]>([null, null, null, null, null]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('https://cho2hand-3.onrender.com/api/categories');
                if (Array.isArray(response.data.data)) {
                    setCategories(response.data.data);
                } else {
                    console.error('Invalid categories response:', response.data);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            const location = JSON.parse(savedLocation);
            setUserLocation(location);
            setProduct(prev => ({
                ...prev,
                location: {
                    city_id: location.city.id,
                    district_id: location.district.id,
                    city: {
                        _id: location.city.id,
                        name: location.city.name
                    },
                    district: {
                        _id: location.district.id,
                        name: location.district.name
                    }
                }
            }));
        }
    }, []);

    useEffect(() => {
        const fetchUserLocation = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                console.log('Fetched user from localStorage:', user); // Log user data
                if (!user._id && !user.id) {
                    throw new Error('User ID is missing');
                }
                const userId = user._id || user.id;
                const response = await axios.get('https://cho2hand-3.onrender.com/api/users/location', {
                    headers: {
                        'X-User-ID': userId
                    }
                });
                const location = response.data;
                setUserLocation(location);
                setProduct(prev => ({
                    ...prev,
                    location: {
                        city_id: location.city.id,
                        district_id: location.district.id,
                        city: {
                            _id: location.city.id,
                            name: location.city.name
                        },
                        district: {
                            _id: location.district.id,
                            name: location.district.name
                        }
                    }
                }));
            } catch (error) {
                console.error('Error fetching user location:', error);
            }
        };

        fetchUserLocation();
    }, []);

    useEffect(() => {
        const refetchUser = () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('Refetched user from localStorage:', user); // Log user data
            if (!user._id && !user.id) {
                console.error('User ID is missing');
            }
        };

        refetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value,
        });
    };

    const handlePhoneDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPhoneDetail({
            ...phoneDetail,
            [name]: value,
        });
    };

    const handleImageChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newSelectedImages = [...selectedImages];
            newSelectedImages[index] = e.target.files[0];
            setSelectedImages(newSelectedImages);
        }
    };

    const handleImageUpload = async (image: File | null) => {
        if (!image) return null;
        
        const formData = new FormData();
        formData.append('image', image);
        
        try {
            console.log('Uploading image to server...');
            const response = await axios.post('https://cho2hand-3.onrender.com/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Image uploaded successfully:', response.data.url);
            return response.data.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const uploadMultipleImages = async (images: (File | null)[]): Promise<string[]> => {
        try {
            const uploadPromises = images.map(async (image) => {
                if (image) {
                    const url = await handleImageUpload(image);
                    return url;
                }
                return null;
            });
            
            const urls = await Promise.all(uploadPromises);
            return urls.filter((url): url is string => url !== null);
        } catch (error) {
            console.error('Error uploading multiple images:', error);
            return [];
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
            
            console.log('User ID:', user._id || user.id); // Log user ID

            if (!user._id && !user.id) {
                throw new Error('User ID is missing');
            }

            const userId = user._id || user.id;

            if (!product.name || !product.description || !product.price) {
                throw new Error('Please fill all required fields');
            }

            const imageUrls = await uploadMultipleImages(selectedImages);

            const formattedLocation = {
                city_id: userLocation.city.id,
                district_id: userLocation.district.id,
                city: {
                    _id: userLocation.city.id,
                    name: userLocation.city.name
                },
                district: {
                    _id: userLocation.district.id,
                    name: userLocation.district.name
                }
            };

            const phoneDetailsData = product.category === 'Điện thoại' ? {
                color: phoneDetail.color,
                storage: phoneDetail.storage,
                brand: phoneDetail.brand,
                model: phoneDetail.model,
                ram: phoneDetail.ram,
                quantity: 1,
                price: product.price
            } : null;

            const payload = {
                product: {
                    ...product,
                    price: parseInt(product.price.toString(), 10),
                    images: imageUrls,
                    location: formattedLocation
                },
                phoneDetails: phoneDetailsData ? [phoneDetailsData] : []
            };

            console.log('Sending payload:', payload);

            const response = await axios.post(
                'https://cho2hand-3.onrender.com/api/products/with-phone-details',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-ID': userId
                    }
                }
            );

            console.log('Request headers:', {
                'Content-Type': 'application/json',
                'X-User-ID': userId
            });

            if (response.status === 200 || response.status === 201) {
                console.log('Product created successfully:', response.data);
                navigate(`/product/${response.data.productId}`);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', error.response?.data);
            } else {
                console.error('Error:', error);
            }
        }
    };

    return (
        <div className="post-ad-container">
            <h2>Post a New Ad</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-layout">
                    <div className="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" value={product.name} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Category:</label>
                        <select name="category" value={product.category} onChange={handleChange}>
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Description:</label>
                        <textarea name="description" value={product.description} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Price (VND):</label>
                        <input 
                            type="text" 
                            name="price" 
                            value={product.price.toString()} 
                            onChange={handlePriceChange}
                            placeholder="Enter price in VND"
                        />
                        {product.price > 0 && (
                            <div className="price-display">
                                {formatCurrency(product.price)}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Location:</label>
                        <input 
                            type="text" 
                            value={userLocation ? `${userLocation.city.name}, ${userLocation.district.name}` : 'Loading...'}
                            disabled 
                            className="location-input"
                        />
                    </div>

                    <div className="form-group full-width">
                        <div className="image-upload-section">
                            <label>Images (up to 5)</label>
                            <div className="image-upload-grid">
                                {selectedImages.map((image, index) => (
                                    <div key={index} className="image-upload-item">
                                        {image ? (
                                            <div className="image-preview-item">
                                                <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                                            </div>
                                        ) : (
                                            <div className="image-placeholder">
                                                <input type="file" onChange={handleImageChange(index)} />
                                                <span>Click to select image</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {product.category === 'Điện thoại' && (
                        <div className="phone-details-section">
                            <h3>Phone Details</h3>
                            <div className="phone-details-grid">
                                <div className="form-group">
                                    <label>Brand:</label>
                                    <input type="text" name="brand" value={phoneDetail.brand} onChange={handlePhoneDetailChange} />
                                </div>
                                <div className="form-group">
                                    <label>Model:</label>
                                    <input type="text" name="model" value={phoneDetail.model} onChange={handlePhoneDetailChange} />
                                </div>
                                <div className="form-group">
                                    <label>Color:</label>
                                    <input type="text" name="color" value={phoneDetail.color} onChange={handlePhoneDetailChange} />
                                </div>
                                <div className="form-group">
                                    <label>Storage:</label>
                                    <input type="text" name="storage" value={phoneDetail.storage} onChange={handlePhoneDetailChange} />
                                </div>
                                <div className="form-group">
                                    <label>RAM:</label>
                                    <input type="text" name="ram" value={phoneDetail.ram} onChange={handlePhoneDetailChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn">Post Ad</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PostAd;
