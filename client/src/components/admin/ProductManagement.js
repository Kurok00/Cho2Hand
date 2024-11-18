import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductManagement.css';

const provinces = [
	"An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Kạn", "Bắc Giang", "Bắc Ninh", "Bến Tre", "Bình Dương", 
	"Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", 
	"Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", 
	"Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", 
	"Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", 
	"Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", 
	"Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", 
	"Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

function ProductManagement() {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [addresses, setAddresses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	
	const [currentProduct, setCurrentProduct] = useState({
		_id: '',
		name: '',
		description: '',
		category: '',
		price: 0,
		images: [],
		locationId: ''
	});
	const [newProduct, setNewProduct] = useState({
		name: '',
		description: '',
		category: '',
		price: 0,
		images: [],
		locationId: ''
	});

	const formatPrice = (price) => {
		return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};

	const handlePriceChange = (e, setProduct) => {
		const value = e.target.value.replace(/\./g, '');
		setProduct(prev => ({ ...prev, price: parseInt(value) || 0 }));
	};

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/products');
				const sortedProducts = Array.isArray(response.data.data) ? response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []; // Ensure products is an array and sort by creation time
				setProducts(sortedProducts);
			} catch (err) {
				setError('Lỗi khi tải sản phẩm');
				setProducts([]); // Ensure products is an array
			} finally {
				setLoading(false);
			}
		};

		const fetchCategories = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/categories');
				if (response.status === 200 && Array.isArray(response.data.data)) {
					setCategories(response.data.data);
				} else {
					throw new Error('Invalid response format');
				}
			} catch (err) {
				console.error('Error fetching categories:', err);
				setError('Lỗi khi tải danh mục');
				setCategories([]); // Ensure categories is an array
			}
		};

		fetchProducts();
		fetchCategories();
	}, []);

	const handleDelete = async (id) => {
		if (!id || id.length !== 24) {
			setError('Invalid product ID');
			return;
		}

		try {
			await axios.delete(`http://localhost:5000/api/products/${id}`);
			setProducts(products.filter(product => product._id !== id));
		} catch (err) {
			setError('Lỗi khi xóa sản phẩm');
		}
	};

	const handleEdit = (product) => {
		console.log('Editing product:', product); // Debugging
		const productId = product._id; // Use _id consistently
		if (!productId) {
			console.error('Error: product or product._id is undefined');
			setError('Lỗi: ID sản phẩm không xác định');
			return;
		}
		setCurrentProduct({
			_id: productId,
			name: product.name,
			description: product.description,
			category: product.category,
			price: product.price,
			images: product.images,
			locationId: product.locationId // Use locationId instead of location
		});
		setShowEditModal(true);
	};

	const handleSave = async () => {
		console.log('Saving product:', currentProduct); // Debugging
		try {
			const productToUpdate = {
				...currentProduct,
				userId: currentProduct.userId || "60d5ec49f8d2c2a1d4f8e8b5", // Ensure valid ObjectID
				locationId: currentProduct.locationId || "60d5ec49f8d2c2a1d4f8e8b5", // Ensure valid ObjectID
			};
			await axios.put(`http://localhost:5000/api/products/${currentProduct._id}`, productToUpdate);
			setProducts(products.map(product => product._id === currentProduct._id ? productToUpdate : product));
			setShowEditModal(false);
		} catch (err) {
			setError('Lỗi khi cập nhật sản phẩm');
		}
	};

	const handleAdd = async () => {
		console.log('Adding product:', newProduct); // Debugging
		try {
			const productToAdd = {
				...newProduct,
				userId: "60d5ec49f8d2c2a1d4f8e8b5", // Ensure valid ObjectID
				locationId: "60d5ec49f8d2c2a1d4f8e8b5", // Ensure valid ObjectID
				status: "available", // Add a default status
				category: newProduct.category || "defaultCategory", // Ensure category is provided
			};
			console.log('Product to add:', productToAdd); // Log the product payload
			const response = await axios.post('http://localhost:5000/api/products', productToAdd);
			setProducts([...products, response.data]);
			setShowAddModal(false);
		} catch (err) {
			console.error('Error adding product:', err.response ? err.response.data : err.message); // Log the error response
			setError('Lỗi khi thêm sản phẩm');
		}
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onloadend = () => {
			setNewProduct({ ...newProduct, images: [reader.result] });
		};
		if (file) {
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="product-management">
			<h1>Quản lý sản phẩm</h1>
			<button className="add-btn" onClick={() => setShowAddModal(true)}>Thêm sản phẩm</button>
			{loading ? (
				<p>Đang tải...</p>
			) : error ? (
				<p>{error}</p>
			) : (
				<>
					<table>
						<thead>
							<tr>
								<th>Tên sản phẩm</th>
								<th>Hình ảnh</th>
								<th>Mô tả</th>
								<th>Giá</th>
								<th>Danh mục</th>
								<th>Hành động</th>
							</tr>
						</thead>
						<tbody>
							{products.map(product => (
								<tr key={product._id}>
									<td>{product.name}</td>
									<td>
										{product.images && product.images.length > 0 ? (
											<img src={product.images[0]} alt={product.name} className="product-image" />
										) : (
											<span>No Image</span>
										)}
									</td>
									<td>{product.description}</td>
									<td>{product.price}</td>
									<td>{product.category}</td>
									<td>
										<button className="edit-btn" onClick={() => handleEdit(product)}>Sửa</button>
										<button className="delete-btn" onClick={() => handleDelete(product._id)}>Xóa</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{showEditModal && (
						<div className="edit-modal">
							<div className="edit-modal-content">
								<h2>Sửa sản phẩm</h2>
								<label>Tên sản phẩm</label>
								<input
									type="text"
									value={currentProduct.name}
									onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
								/>
								<label>Danh mục</label>
								<select
									value={currentProduct.category}
									onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
								>
									{categories.map(category => (
										<option key={category._id} value={category.name}>{category.name}</option>
									))}
								</select>
								<label>Mô tả</label>
								<textarea
									value={currentProduct.description}
									onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
								/>
								<label>Giá</label>
								<input
									type="text"
									value={formatPrice(currentProduct.price)}
									onChange={(e) => handlePriceChange(e, setCurrentProduct)}
								/>
								<label>Hình ảnh URL</label>
								<input
									type="text"
									value={currentProduct.images[0] || ''}
									onChange={(e) => setCurrentProduct({ ...currentProduct, images: [e.target.value] })}
								/>
								<div className="image-preview">
									{currentProduct.images && currentProduct.images.length > 0 ? (
										<img src={currentProduct.images[0]} alt="Preview" className="product-image" />
									) : (
										<span>No Image</span>
									)}
								</div>
								<button onClick={handleSave}>Lưu</button>
								<button onClick={() => setShowEditModal(false)}>Hủy</button>
							</div>
						</div>
					)}
					{showAddModal && (
						<div className="edit-modal">
							<div className="edit-modal-content">
								<h2>Thêm sản phẩm</h2>
								<label>Tên sản phẩm</label>
								<input
									type="text"
									value={newProduct.name}
									onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
								/>
								<label>Danh mục</label>
								<select
									value={newProduct.category}
									onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
								>
									{categories.map(category => (
										<option key={category._id} value={category.name}>{category.name}</option>
									))}
								</select>
								<label>Mô tả</label>
								<textarea
									value={newProduct.description}
									onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
								/>
								<label>Giá</label>
								<input
									type="text"
									value={formatPrice(newProduct.price)}
									onChange={(e) => handlePriceChange(e, setNewProduct)}
								/>
								<label>Hình ảnh URL</label>
								<input
									type="text"
									value={newProduct.images[0] || ''}
									onChange={(e) => setNewProduct({ ...newProduct, images: [e.target.value] })}
								/>
								<label>Hoặc tải lên hình ảnh</label>
								<input
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
								/>
								<div className="image-preview">
									{newProduct.images && newProduct.images.length > 0 ? (
										<img src={newProduct.images[0]} alt="Preview" className="product-image" />
									) : (
										<span>No Image</span>
									)}
								</div>
								<button onClick={handleAdd}>Thêm</button>
								<button onClick={() => setShowAddModal(false)}>Hủy</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default ProductManagement;

