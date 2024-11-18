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

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data.data);
        } catch (err) {
            setError('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/categories', newCategory);
            setCategories([...categories, response.data.data]);
            setNewCategory({ name: '', image: '' });
        } catch (err) {
            setError('Lỗi khi thêm danh mục');
        }
    };

    const handleUpdateCategory = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/categories/${editCategory.id}`, editCategory);
            setCategories(categories.map(cat => cat.id === editCategory.id ? response.data.data : cat));
            setEditCategory(null);
        } catch (err) {
            setError('Lỗi khi cập nhật danh mục');
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/categories/${id}`);
            setCategories(categories.filter(cat => cat.id !== id));
        } catch (err) {
            setError('Lỗi khi xóa danh mục');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewCategory({ ...newCategory, image: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleImageUrlChange = (e) => {
        setNewCategory({ ...newCategory, image: e.target.value });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="category-management">
            <h1>Quản lý danh mục</h1>
            {error && <p className="error-message">{error}</p>}
            <button onClick={() => setShowModal(true)}>Thêm danh mục</button>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div className="category-list">
                    {categories.map(category => (
                        <div key={category.id} className="category-item">
                            <img src={category.image} alt={category.name} />
                            <span>{category.name}</span>
                            <button onClick={() => setEditCategory(category)}>Sửa</button>
                            <button onClick={() => handleDeleteCategory(category.id)}>Xóa</button>
                        </div>
                    ))}
                </div>
            )}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <input
                            type="text"
                            placeholder="Tên danh mục"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="URL hình ảnh"
                            value={newCategory.image}
                            onChange={handleImageUrlChange}
                        />
                        <input
                            type="file"
                            onChange={handleFileChange}
                        />
                        {newCategory.image && <img src={newCategory.image} alt="Preview" />}
                        <button onClick={handleAddCategory}>Thêm danh mục</button>
                    </div>
                </div>
            )}
            {editCategory && (
                <div className="edit-category">
                    <input
                        type="text"
                        placeholder="Tên danh mục"
                        value={editCategory.name}
                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="URL hình ảnh"
                        value={editCategory.image}
                        onChange={(e) => setEditCategory({ ...editCategory, image: e.target.value })}
                    />
                    <button onClick={handleUpdateCategory}>Cập nhật danh mục</button>
                    <button onClick={() => setEditCategory(null)}>Hủy</button>
                </div>
            )}
        </div>
    );
}

export default CategoryManagement;
