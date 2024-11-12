import React from 'react';
import Header from './components/common/Header/Header.tsx';
import Body from './components/common/Body/Body.tsx';
import Footer from './components/common/Footer/Footer.tsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}

export default App;