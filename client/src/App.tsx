import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/common/Header/Header';
import Body from './components/common/Body/Body';
import Footer from './components/common/Footer/Footer';
import DetailProduct from './pages/DetailProduct';
import CategoryProductPage from './pages/CategoryProductPage';
import ChatPage from './pages/ChatPage'; // Import the ChatPage component
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Body />} />
          <Route path="/product/:productId" element={<DetailProduct />} />
          <Route path="/category/:categoryName" element={<CategoryProductPage />} />
          <Route path="/chat" element={<ChatPage />} /> {/* Add the ChatPage route */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;