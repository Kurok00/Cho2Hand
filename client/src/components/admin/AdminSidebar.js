import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminSidebar.css';
import { FaList, FaUsers } from 'react-icons/fa';
import { FcPhoneAndroid } from 'react-icons/fc';
import ProductManagement from './ProductManagement';
import { adminLogout } from '../../services/adminAuthService.ts';
import CategoryManagement from './CategoryManagement';
import UserManagement from './UserManagement';
import config from '../../config';

function AdminDashboard() {
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [activeTab, setActiveTab] = useState('products');
	const [adminName, setAdminName] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const adminData = localStorage.getItem('adminData');
		if (!adminData) {
			navigate('/admin/auth');
			return;
		}

		const admin = JSON.parse(adminData);
		setAdminName(admin.name || admin.username);
	}, [navigate]);

	const handleLogoutClick = () => {
		setShowLogoutConfirm(true);
	};

	const handleLogoutConfirm = async () => {
		try {
			setShowLogoutConfirm(false);
			setShowLogoutModal(true);
			adminLogout();
			navigate('/admin/auth');
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	const handleLogoutCancel = () => {
		setShowLogoutConfirm(false);
	};

	const renderContent = () => {
		switch (activeTab) {
			case 'products':
				return <ProductManagement />;
			case 'categories':
				return <CategoryManagement />;
			case 'users':
				return <UserManagement />;
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
						<li 
							className={activeTab === 'products' ? 'active' : ''} 
							onClick={() => setActiveTab('products')}
						>
							<FcPhoneAndroid className="icon" /> Quản lý sản phẩm
						</li>
						<li 
							className={activeTab === 'categories' ? 'active' : ''} 
							onClick={() => setActiveTab('categories')}
						>
							<FaList className="icon" /> Quản lý danh mục
						</li>
						<li 
							className={activeTab === 'users' ? 'active' : ''} 
							onClick={() => setActiveTab('users')}
						>
							<FaUsers className="icon" /> Quản lý tài khoản
						</li>
				</ul>
				<div className="sidebar-footer">
					<p className="admin-greeting">Xin chào, {adminName}</p>
					<button className="logout-btn" onClick={handleLogoutClick}>Đăng xuất</button>
				</div>
			</div>
			<div className="main-content">
				{showLogoutConfirm && (
					<div className="modal-overlay">
						<div className="modal-content">
							<h2>Xác nhận đăng xuất</h2>
							<p>Bạn có chắc chắn muốn đăng xuất?</p>
							<div className="modal-actions">
								<button onClick={handleLogoutConfirm}>Đồng ý</button>
								<button onClick={handleLogoutCancel}>Hủy</button>
							</div>
						</div>
					</div>
				)}
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