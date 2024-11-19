import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CategoryManagement.css';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', image: '' });
    const [editCategory, setEditCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [existingCategories, setExistingCategories] = useState([]); // Thêm state mới
    const [newImagePreview, setNewImagePreview] = useState(null); // Add this line

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories'); // Add this line
            setCategories(response.data.data);
            // Lấy danh sách tên danh mục unique cho dropdown
            const uniqueCategories = [...new Set(response.data.data.map(cat => cat.name))];
            setExistingCategories(uniqueCategories);
        } catch (err) {
            setError('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        try {
            console.log('Starting file upload...', file);
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('Upload response:', response);
            
            if (!response.data || !response.data.url) {
                console.error('Invalid response format:', response.data);
                throw new Error('Invalid response format');
            }
            
            return response.data.url;
        } catch (err) {
            console.error('Upload error:', err);
            console.error('Error details:', err.response?.data);
            setError('Lỗi khi tải lên hình ảnh: ' + (err.response?.data?.error || err.message));
            return null;
        }
    };

    const handleAddCategory = async () => {
        try {
            if (!newCategory.name || !newCategory.image) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const response = await axios.post('http://localhost:5000/api/categories', newCategory);
            setCategories([...categories, response.data.data]);
            setNewCategory({ name: '', image: '' });
            setShowModal(false);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi thêm danh mục');
        }
    };

    const handleUpdateCategory = async () => {
        try {
            if (!editCategory.name) {
                setError('Vui lòng nhập tên danh mục');
                return;
            }

            const categoryId = editCategory._id || editCategory.id;
            console.log('Updating category:', categoryId, editCategory);

            const updateData = {
                name: editCategory.name,
                image: editCategory.image
            };

            const response = await axios.put(
                `http://localhost:5000/api/categories/${categoryId}`,
                updateData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Update response:', response);

            if (response.data && response.data.data) {
                setCategories(categories.map(cat => 
                    (cat._id || cat.id) === categoryId ? response.data.data : cat
                ));
                setEditCategory(null);
                setShowEditModal(false);
                setNewImagePreview(null);
                setError(null);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Update error:', err);
            if (err.response?.status === 404) {
                setError('Không tìm thấy danh mục để cập nhật');
            } else {
                setError(err.response?.data?.error || 'Lỗi khi cập nhật danh mục');
            }
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
            setCategories(categories.filter(cat => (cat._id || cat.id) !== categoryId));
        } catch (err) {
            setError('Lỗi khi xóa danh mục');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            console.log('Processing file:', file);
            // Show preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Upload to server
            const imageUrl = await handleFileUpload(file);
            console.log('Received image URL:', imageUrl);
            
            if (imageUrl) {
                if (editCategory) {
                    setEditCategory({ ...editCategory, image: imageUrl });
                } else {
                    setNewCategory({ ...newCategory, image: imageUrl });
                }
            }
        } catch (err) {
            console.error('File handling error:', err);
            setError('Lỗi xử lý file: ' + err.message);
        }
    };

    const handleImageUrlChange = (e) => {
        setNewCategory({ ...newCategory, image: e.target.value });
    };

    const handleOpenEditModal = (category) => {
        setEditCategory(category);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setEditCategory(null);
        setShowEditModal(false);
        setNewImagePreview(null); // Add this line
    };

    // Add this function to clear preview when closing add modal
    const handleCloseAddModal = () => {
        setShowModal(false);
        setNewCategory({ name: '', image: '' });
        setNewImagePreview(null);
    };

    const handleCategoryNameChange = (e) => {
        const value = e.target.value;
        if (value === 'new') {
            // Khi chọn "Thêm mới", reset name để người dùng nhập
            setNewCategory({ ...newCategory, name: '' });
        } else {
            setNewCategory({ ...newCategory, name: value });
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="category-management">
            <div className="management-header">
                <h1>Quản lý danh mục sản phẩm</h1>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus"></i> Thêm danh mục mới
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i> Đang tải...
                </div>
            ) : (
                <div className="category-list">
                    {categories.map(category => (
                        <div key={category._id || category.id} className="category-item">
                            <img src={category.image} alt={category.name} />
                            <span>{category.name}</span>
                            <div className="button-group">
                                <button className="btn-edit" onClick={() => handleOpenEditModal(category)}>
                                    <i className="fas fa-edit"></i> Sửa
                                </button>
                                <button className="btn-delete" onClick={() => handleDeleteCategory(category._id || category.id)}>
                                    <i className="fas fa-trash"></i> Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Thêm danh mục mới</h2>
                            <span className="close" onClick={handleCloseAddModal}>&times;</span>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên danh mục:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập tên danh mục"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ 
                                        ...newCategory, 
                                        name: e.target.value 
                                    })}
                                />
                            </div>

                            <div className="image-preview-container">
                                <div className="preview-grid">
                                    <div className="preview-item">
                                        <span className="preview-label">Hình ảnh hiện tại</span>
                                        {newCategory.image ? (
                                            <img src={newCategory.image} alt="Current" />
                                        ) : (
                                            <div className="preview-placeholder">
                                                Chưa có hình ảnh
                                            </div>
                                        )}
                                    </div>
                                    <div className="preview-item">
                                        <span className="preview-label">Hình ảnh mới</span>
                                        {newImagePreview ? (
                                            <img src={newImagePreview} alt="New" />
                                        ) : (
                                            <div className="preview-placeholder">
                                                Chưa chọn hình ảnh mới
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tải lên hình ảnh:</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCloseAddModal}>Hủy</button>
                            <button className="btn-submit" onClick={handleAddCategory}>Thêm danh mục</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editCategory && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Chỉnh sửa danh mục</h2>
                            <span className="close" onClick={handleCloseEditModal}>&times;</span>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên danh mục:</label>
                                <div className="select-wrapper">
                                    <select
                                        className="form-control"
                                        value={editCategory.name}
                                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {existingCategories.map((cat, index) => (
                                            <option key={index} value={cat}>{cat}</option>
                                        ))}
                                        <option value="new">+ Thêm danh mục mới</option>
                                    </select>
                                    <i className="fas fa-chevron-down select-icon"></i>
                                </div>
                                {editCategory.name === 'new' && (
                                    <input
                                        type="text"
                                        className="form-control mt-2"
                                        placeholder="Nhập tên danh mục mới"
                                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                    />
                                )}
                            </div>
                            <div className="image-preview-container">
                                <div className="preview-grid">
                                    <div className="preview-item">
                                        <span className="preview-label">Hình ảnh hiện tại</span>
                                        {editCategory.image ? (
                                            <img src={editCategory.image} alt="Current" />
                                        ) : (
                                            <div className="preview-placeholder">
                                                Chưa có hình ảnh
                                            </div>
                                        )}
                                    </div>
                                    <div className="preview-item">
                                        <span className="preview-label">Hình ảnh mới</span>
                                        {newImagePreview ? (
                                            <img src={newImagePreview} alt="New" />
                                        ) : (
                                            <div className="preview-placeholder">
                                                Chưa chọn hình ảnh mới
                                            </div>

                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tải lên hình ảnh mới:</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCloseEditModal}>Hủy</button>
                            <button className="btn-submit" onClick={handleUpdateCategory}>Cập nhật</button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

export default CategoryManagement;
