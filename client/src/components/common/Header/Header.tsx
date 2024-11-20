import React, { useState, useEffect } from 'react';
import './Header.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faShoppingCart, faSearch, faSignInAlt, faUserPlus, faMoon, faSun, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faBell as farBell } from '@fortawesome/free-regular-svg-icons';
import { login, register } from '../../../services/authServices.ts';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios

interface Category {
    id: string;
    name: string;
}

const Header: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loginData, setLoginData] = useState({ emailOrPhone: '', password: '' });
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]); // Define the type for categories
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Check for user in localStorage on component mount
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories');
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (!loginData.emailOrPhone || !loginData.password) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const response = await login(loginData);
            console.log('Login response:', response.data); // Debug log

            if (response.data && response.data.user && response.data.user.name) {
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setShowLoginModal(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (!registerData.name || !registerData.email || !registerData.phone || !registerData.password) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            if (registerData.password !== registerData.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp');
                return;
            }

            const response = await register(registerData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setShowRegisterModal(false);
                window.location.reload();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    const handleCategorySelect = (categoryId: string, categoryName: string) => {
        navigate(`/category/${categoryName}`, { state: { categoryId, categoryName } });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.reload();
    };

    const handleUserMenuClick = () => {
        setShowUserDropdown(!showUserDropdown);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu && !userMenu.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
        <div className="header-container">
            <header className="hdr">
                <div className="hdr-left">
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}> {/* Add cursor pointer */}
                        <img src="/cho2hand-logo.png" alt="Logo" width="230" />
                    </div>
                    <nav className="nav">
                        <div className="nav-item">
                            <FontAwesomeIcon icon={faBars} className="menu-bars-icon" />
                            <span className="nav-text" style={{ color: 'white' }}>Danh mục</span>
                            <div className="dropdown">
                                {categories.map((category) => (
                                    <div 
                                        key={category.id} 
                                        className="dropdown-item" 
                                        onClick={() => handleCategorySelect(category.id, category.name)}
                                    >
                                        {category.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </nav>
                  
                </div>

                <div className="hdr-center">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm sản phẩm trên Chợ 2Hand" 
                        className="search" 
                    />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>

                <div className="hdr-right">
                    <button className="icon-btn">
                        <FontAwesomeIcon icon={farBell} className="icon" />
                        <span className="icon-badge">12</span>
                        <span className="icon-tooltip">Thông báo</span>
                    </button>
                    <button className="icon-btn">
                        <FontAwesomeIcon icon={faShoppingCart} className="icon" />
                        <span className="icon-badge">3</span>
                        <span className="icon-tooltip">Giỏ hàng</span>
                    </button>

                    {user ? (
                        <div className="user-menu">
                            <button 
                                className="user-btn" 
                                onClick={handleUserMenuClick}
                            >
                                <FontAwesomeIcon icon={faUser} className="auth-icon" />
                                <span>Xin chào, {user.name || "Khách"}</span>  
                            </button>
                            {showUserDropdown && (
                                <div className="user-dropdown">
                                    <a href="/profile">Tài khoản của tôi</a>
                                    <a href="/orders">Đơn hàng</a>
                                    <button onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button className="auth-btn login-btn" onClick={() => setShowLoginModal(true)}>
                                <FontAwesomeIcon icon={faSignInAlt} className="auth-icon" />
                                Đăng nhập
                            </button>
                            <button className="auth-btn register-btn" onClick={() => setShowRegisterModal(true)}>
                                <FontAwesomeIcon icon={faUserPlus} className="auth-icon" />
                                Đăng ký
                            </button>
                        </>
                    )}

                    <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                    </button>
                </div>
            </header>

            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Đăng nhập</h2>
                            <button className="close-btn" onClick={() => setShowLoginModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleLogin}>
                                {error && <div className="error-message">{error}</div>}
                                <div className="form-group">
                                    <label>Email hoặc Số điện thoại</label>
                                    <input 
                                        type="text" 
                                        value={loginData.emailOrPhone}
                                        onChange={(e) => setLoginData({...loginData, emailOrPhone: e.target.value})}
                                        placeholder="Nhập email hoặc số điện thoại" 
                                    />
                                    <small className="form-hint">Sử dụng email hoặc số điện thoại để đăng nhập</small>
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu</label>
                                    <input 
                                        type="password" 
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                        placeholder="Nhập mật khẩu" 
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        Đăng nhập
                                    </button>
                                </div>
                                <div className="form-footer">
                                    <a href="/forgot-password">Quên mật khẩu?</a>
                                    <span>Chưa có tài khoản? <button onClick={() => {
                                        setShowLoginModal(false);
                                        setShowRegisterModal(true);
                                    }} className="switch-auth-btn">Đăng ký ngay</button></span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showRegisterModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Đăng ký</h2>
                            <button className="close-btn" onClick={() => setShowRegisterModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleRegister}>
                                {error && <div className="error-message">{error}</div>}
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input 
                                        type="text"
                                        value={registerData.name}
                                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                                        placeholder="Nhập họ và tên" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                        placeholder="Nhập email" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input 
                                        type="tel"
                                        value={registerData.phone}
                                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                                        placeholder="Nhập số điện thoại" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu</label>
                                    <input 
                                        type="password"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        placeholder="Nhập mật khẩu" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu</label>
                                    <input 
                                        type="password"
                                        value={registerData.confirmPassword}
                                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                        placeholder="Nhập lại mật khẩu" 
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        Đăng ký
                                    </button>
                                </div>
                                <div className="form-footer">
                                    <span>Đã có tài khoản? <button onClick={() => {
                                        setShowRegisterModal(false);
                                        setShowLoginModal(true);
                                    }} className="switch-auth-btn">Đăng nhập</button></span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default Header;