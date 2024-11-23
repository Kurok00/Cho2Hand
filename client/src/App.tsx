import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/common/Header/Header';
import Body from './components/common/Body/Body';
import Footer from './components/common/Footer/Footer';
import AdminAuth from './components/admin/AdminAuth';
import AdminSidebar from './components/admin/AdminSidebar';
import UserHome from './pages/UserHome';
import CategoryManagement from './components/admin/CategoryManagement';
import UserManagement from './components/admin/UserManagement';
import DetailProduct from './pages/DetailProduct';
import CategoryProductPage from './pages/CategoryProductPage';
import PostAd from './pages/PostAd';
import Profile from './components/common/Profile/Profile';

import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminRoute && <Header />}
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/dashboard" element={<AdminSidebar />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin" element={<Navigate to="/admin/auth" />} />
        
        {/* User Routes */}
        <Route path="/" element={<UserHome />} />
        <Route path="/product/:productId" element={<DetailProduct />} />
        <Route path="/category/:categoryName" element={<CategoryProductPage />} />
        <Route path="/post-sale" element={<PostAd />} />
        <Route path="/profile" element={<Profile />} /> {/* Add profile route */}
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;