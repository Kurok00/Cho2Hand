
import React from 'react';
import Header from './components/common/Header/Header';
import Body from './components/common/Body/Body';
import Footer from './components/common/Footer/Footer';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <Body />
      <Footer />
    </div>
  );
};

export default App;