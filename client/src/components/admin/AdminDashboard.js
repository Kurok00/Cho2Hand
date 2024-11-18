import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { FaList, FaUsers } from 'react-icons/fa'; // Import icons
import { FcPhoneAndroid } from 'react-icons/fc'; // Import new icon
import ProductManagement from './ProductManagement'; // Import ProductManagement component
import { adminLogout } from '../../services/adminAuthService.ts';

function AdminDashboard() {
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [activeTab, setActiveTab] = useState('products');
	const [adminName, setAdminName] = useState(''); // New state for admin's username
	const navigate = useNavigate();

	useEffect(() => {
		// Check authentication
		const adminData = localStorage.getItem('adminData');
		if (!adminData) {
			navigate('/admin/auth');
			return;
		}

		// Set admin name from stored data
		const admin = JSON.parse(adminData);
		setAdminName(admin.name || admin.username);
	}, [navigate]);

	const handleLogout = async () => {
		try {
			setShowLogoutModal(true);
			adminLogout();
			navigate('/admin/auth');
		} catch (error) {
			console.error('Error logging out:', error);
			navigate('/admin/auth');
		}
	};

	const renderContent = () => {
		switch (activeTab) {
			case 'products':
				return <ProductManagement />; // Render ProductManagement component
			case 'categories':
				return <div>Quản lý danh mục</div>;
			case 'users':
				return <div>Quản lý người dùng</div>;
			default:
				return null;
		}
	};

	return (
		<div className="admin-dashboard-container">
			<div className="sidebar">
				<div className="sidebar-header">
					<img src="/cho2hand-logo.png" alt="Logo" className="admin-logo" />
					<h1>Admin Dashboard</h1>
				</div>
				<ul className="sidebar-menu">
					<li onClick={() => setActiveTab('products')}>
						<FcPhoneAndroid className="icon" /> Quản lý sản phẩm
					</li>
					<li onClick={() => setActiveTab('categories')}>
						<FaList className="icon" /> Quản lý danh mục
					</li>
					<li onClick={() => setActiveTab('users')}>
						<FaUsers className="icon" /> Quản lý người dùng
					</li>
				</ul>
				<p className="admin-greeting">Xin chào, {adminName}</p> {/* Display admin's username */}
				<button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
			</div>
			<div className="main-content">
				{showLogoutModal && (
					<div className="logout-modal">
						<div className="logout-modal-content">
							<p>Đang đăng xuất...</p>
						</div>
					</div>
				)}
				<div className="dashboard-content">
					{renderContent()}
				</div>
			</div>
		</div>
	);
}

export default AdminDashboard;