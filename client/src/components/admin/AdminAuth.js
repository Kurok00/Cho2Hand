import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, adminRegister } from '../../services/adminAuthService.ts';
import './AdminAuth.css';

function AdminAuth() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(loginData);
      localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
      navigate('/admin/dashboard');
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
        password: registerData.password
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
            <form onSubmit={handleLogin}>
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