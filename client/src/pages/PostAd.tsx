import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PostAd.css';
import { useNavigate } from 'react-router-dom'; // Add this import

interface Category {
    _id: string;
    name: string;
}

interface Product {
    name: string;
    description: string;
    category: string;
    price: number;
    location: Location;  // Update to use the Location interface
    status: string;
    images: string[];
    imagesMini1: string[];
    imagesMini2: string[][];
    imagesMini3: string[];
}

interface PhoneDetail {
    color: string;
    storage: string;
    brand: string;
    model: string;
    ram: string;
}

// Update the Location interface to match server model
interface Location {
    city: {
        _id: string;  // Change id to _id
        name: string;
    };
    district: {
        _id: string;  // Change id to _id
        name: string;
        city_id: string;
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
    const navigate = useNavigate(); // Add this line
    const [product, setProduct] = useState<Product>({
        name: '',
        description: '',
        category: '',
        price: 0,
        location: {  // Initialize with empty location object
            city: {
                _id: '',  // Change id to _id
                name: ''
            },
            district: {
                _id: '',  // Change id to _id
                name: '',
                city_id: ''
            }
        },
        status: 'available',
        images: [],
        imagesMini1: [],
        imagesMini2: [[]],
        imagesMini3: []
    });

    const [phoneDetail, setPhoneDetail] = useState<PhoneDetail>({
        color: '',
        storage: '',
        brand: '',
        model: '',
        ram: ''
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedImagesMini1, setSelectedImagesMini1] = useState<File[]>([]);
    const [selectedImagesMini2, setSelectedImagesMini2] = useState<File[]>([]);
    const [selectedImagesMini3, setSelectedImagesMini3] = useState<File[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

    useEffect(() => {
        // Fetch categories from API
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories');
                if (Array.isArray(response.data.data)) {
                    setCategories(response.data.data);
                } else {
                    console.error('Invalid categories response:', response.data);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]); // Ensure categories is an array even if the fetch fails
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        // Get user location from localStorage
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            const location = JSON.parse(savedLocation);
            setUserLocation(location);
            
            // Set location in product form
            setProduct(prev => ({
                ...prev,
                location: {
                    city: location.city,
                    district: location.district
                }
            }));
        }
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleImagesMini1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImagesMini1(Array.from(e.target.files));
        }
    };

    const handleImagesMini2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImagesMini2(Array.from(e.target.files));
        }
    };

    const handleImagesMini3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImagesMini3(Array.from(e.target.files));
        }
    };

    // Update image upload handlers
    const handleMainImageUpload = async (image: File | null) => {
        if (!image) return null;
        
        const formData = new FormData();
        formData.append('image', image);
        
        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const uploadMultipleImages = async (images: File[]): Promise<string[]> => {
        try {
            const uploadPromises = images.map(async (image) => {
                const url = await handleMainImageUpload(image);
                return url;
            });
            
            const urls = await Promise.all(uploadPromises);
            return urls.filter((url): url is string => url !== null);
        } catch (error) {
            console.error('Error uploading multiple images:', error);
            return [];
        }
    };

    // Update submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
            
            // Basic validation
            if (!product.name || !product.description || !product.price) {
                throw new Error('Please fill all required fields');
            }

            // Upload images
            const mainImageUrl = selectedImage ? await handleMainImageUpload(selectedImage) : null;
            const mini1Urls = await uploadMultipleImages(selectedImagesMini1);
            const mini2Urls = await uploadMultipleImages(selectedImagesMini2);
            const mini3Urls = await uploadMultipleImages(selectedImagesMini3);

            // Format location data to match server expectations
            const formattedLocation = {
                city: {
                    _id: userLocation.city.id,  // Change from id to _id
                    name: userLocation.city.name
                },
                district: {
                    _id: userLocation.district.id,  // Change from id to _id
                    name: userLocation.district.name,
                    city_id: userLocation.district.city_id
                }
            };

            // Prepare phone details
            const phoneDetailsData = product.category === 'Điện thoại' ? {
                color: phoneDetail.color,
                storage: phoneDetail.storage,
                brand: phoneDetail.brand,
                model: phoneDetail.model,
                ram: phoneDetail.ram,
                quantity: 1,
                price: product.price  // Remove parseFloat since product.price is already a number
            } : null;

            // Prepare payload with formatted location
            const payload = {
                product: {
                    ...product,
                    price: parseInt(product.price.toString(), 10),
                    images: mainImageUrl ? [mainImageUrl] : [],
                    imagesMini1: mini1Urls,
                    imagesMini2: mini2Urls,
                    imagesMini3: mini3Urls,
                    location: formattedLocation  // Use formatted location
                },
                phoneDetails: phoneDetailsData ? [phoneDetailsData] : []
            };

            console.log('Sending payload:', payload); // Debug log

            // Send request with user ID header
            const response = await axios.post(
                'http://localhost:5000/api/products/with-phone-details',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-ID': user._id
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                console.log('Product created successfully:', response.data);
                // Navigate to product detail page or show success message
                navigate(`/product/${response.data.productId}`); // Now this will work
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', error.response?.data);
            } else {
                console.error('Error:', error);
            }
            // Show error to user
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
                            type="number" 
                            name="price" 
                            value={product.price} 
                            onChange={handleChange}
                            placeholder="Enter price in VND"
                            min="0"
                            step="1000"
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
                            <label>Main Image</label>
                            <input type="file" name="image" onChange={handleImageChange} />
                            {selectedImage && (
                                <div className="image-preview-grid">
                                    <div className="image-preview-item">
                                        <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="image-upload-section">
                            <label>Additional Images 1</label>
                            <input type="file" name="imagesMini1" multiple onChange={handleImagesMini1Change} />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="image-upload-section">
                            <label>Additional Images 2</label>
                            <input type="file" name="imagesMini2" multiple onChange={handleImagesMini2Change} />
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
