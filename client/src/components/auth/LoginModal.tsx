import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './AuthModals.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (data: any) => Promise<void>;
    error: string;
    onSwitchToRegister: () => void;
    loginData: {
        usernameOrPhone: string;
        password: string;
    };
    setLoginData: React.Dispatch<React.SetStateAction<{
        usernameOrPhone: string;
        password: string;
    }>>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, error, onSwitchToRegister, loginData, setLoginData }) => {
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(loginData);
    };

    return (
        <div className="modal-overlay">
            <div className="auth-modal login-modal">
                <div className="auth-modal-header">
                    <h2>Đăng nhập</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="auth-modal-body">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label>Tên đăng nhập hoặc Số điện thoại</label>
                            <input 
                                type="text" 
                                value={loginData.usernameOrPhone}
                                onChange={(e) => setLoginData({...loginData, usernameOrPhone: e.target.value})}
                                placeholder="Nhập tên đăng nhập hoặc số điện thoại" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    placeholder="Nhập mật khẩu" 
                                />
                                <button 
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn">Đăng nhập</button>
                        </div>
                        <div className="form-footer">
                            <a href="/forgot-password">Quên mật khẩu?</a>
                            <span>
                                Chưa có tài khoản? 
                                <button type="button" onClick={onSwitchToRegister} className="switch-auth-btn">
                                    Đăng ký ngay
                                </button>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;