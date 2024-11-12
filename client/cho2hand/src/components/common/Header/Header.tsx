import React from 'react';
import './Header.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faShoppingCart, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faBell as farBell } from '@fortawesome/free-regular-svg-icons';

const Header: React.FC = () => {
    return (
        <header className="hdr">
            <div className="hdr-left">
                <div className="logo">
                    <img src="/cho2hand-logo.png" alt="Logo" width="230" />
                </div>
                <nav className="nav">
                    <div className="nav-item">
                        <FontAwesomeIcon icon={faBars} />
                        <span className="nav-text">Danh mục</span>
                        <div className="dropdown">
                            <a href="#category1">Category 1</a>
                            <a href="#category2">Category 2</a>
                            <a href="#category3">Category 3</a>
                        </div>
                    </div>
                </nav>
            </div>
            <div className="hdr-center">
                <input type="text" placeholder="Tìm kiếm sản phẩm trên Chợ 2Hand" className="search" />
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
            <div className="hdr-right">
                <FontAwesomeIcon icon={faUser} className="icon" />
                <FontAwesomeIcon icon={farBell} className='icon' />
                <FontAwesomeIcon icon={faShoppingCart} className="icon" />               
                <button className="post-btn">ĐĂNG TIN</button>
            </div>
        </header>
    );
};

export default Header;