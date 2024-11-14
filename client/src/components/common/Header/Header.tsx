import React, { useState } from 'react';
import './Header.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faShoppingCart, faSearch, faUser, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faBell as farBell } from '@fortawesome/free-regular-svg-icons';
import { authService } from '../../../services/auth.service.ts';

const Header: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            if (!loginData.email || !loginData.password) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const response = await authService.login(loginData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setShowLoginModal(false);
            window.location.reload(); // Refresh to update UI
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại');
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

            const response = await authService.register(registerData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setShowRegisterModal(false);
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <>
        <div className="header-container">
            <header className="hdr">
                <div className="hdr-left">
                    <div className="logo">
                        <img src="/cho2hand-logo.png" alt="Logo" width="230" />
                    </div>
                    <nav className="nav">
                        <div className="nav-item">
                            <FontAwesomeIcon icon={faBars} className="menu-bars-icon" />
                            <span className="nav-text" style={{ color: 'white' }}>Danh mục</span>
                            <div className="dropdown">
                                <a href="#category1">Category 1</a>
                                <a href="#category2">Category 2</a>
                                <a href="#category3">Category 3</a>
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
                    <button className="auth-btn login-btn" onClick={() => setShowLoginModal(true)}>
                        <FontAwesomeIcon icon={faSignInAlt} className="auth-icon" />
                        Đăng nhập
                    </button>
                    <button className="auth-btn register-btn" onClick={() => setShowRegisterModal(true)}>
                        <FontAwesomeIcon icon={faUserPlus} className="auth-icon" />
                        Đăng ký
                    </button>
                    <button className="post-btn">ĐĂNG TIN</button>
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
                                    <label>Email/Số điện thoại</label>
                                    <input 
                                        type="text" 
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                        placeholder="Nhập email hoặc số điện thoại" 
                                    />
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
                                    <a href="#">Quên mật khẩu?</a>
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