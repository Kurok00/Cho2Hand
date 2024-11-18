import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/common/Header/Header.tsx';
import Body from './components/common/Body/Body.tsx';
import Footer from './components/common/Footer/Footer.tsx';
import AdminAuth from './components/admin/AdminAuth';
import AdminDashboard from './components/admin/AdminDashboard';
import UserHome from './pages/UserHome';
import './App.css';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<Navigate to="/admin/auth" />} />
        <Route path="/" element={<UserHome />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;