import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>About Cho2Hand</h3>
                    <p>Your trusted platform for buying and selling second-hand items.</p>
                </div>
                
                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Products</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <p>Email: info@cho2hand.com</p>
                    <p>Phone: (84) 123-456-789</p>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; 2024 Cho2Hand. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;