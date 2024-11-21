import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/adminAuthService.ts'; // Thay đổi import adminLogin thành login
import { adminRegister } from '../../services/adminAuthService.ts';
import './AdminAuth.css';
import axios from 'axios';


function AdminAuth() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '' // Add name to the registerData state
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const response = await login({ // Thay đổi adminLogin thành login
            usernameOrPhone: loginData.username,
            password: loginData.password
        });
        if (response.status === 200) {
          // Redirect after successful login
          navigate('/admin/dashboard', { replace: true });
        }
    } catch (err) {
        setError(err.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (registerData.password !== registerData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
      await adminRegister({
        username: registerData.username,
        password: registerData.password,
        name: registerData.name // Include name in the registration data
      });
      setActiveTab('login');
      setError('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000); // Hide success modal after 2 seconds
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Username đã tồn tại');
      } else {
        setError(err.response?.data?.error || 'Đăng ký thất bại');
      }
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-box">
        <div className="admin-auth-header">
          <img src="/cho2hand-logo.png" alt="Logo" className="admin-logo" />
          <h1>Admin Dashboard</h1>
          <div className="tab-switcher">
            <button 
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Đăng nhập
            </button>
            <button 
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Đăng ký
            </button>
          </div>
        </div>

        <div className="admin-auth-form">
          {error && <div className="error-message">{error}</div>}
          {activeTab === 'login' ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Đăng nhập</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập admin"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên</label>
                <input
                  type="text"
                  placeholder="Nhập tên"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Tạo mật khẩu mạnh"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Đăng ký</button>
            </form>
          )}
        </div>
      </div>

      {success && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Đăng ký thành công!</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAuth;