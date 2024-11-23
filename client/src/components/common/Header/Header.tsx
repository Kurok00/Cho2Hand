import React, { useState, useEffect } from 'react';
import './Header.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faSignInAlt, faUserPlus, faMoon, faSun, faUser, faSignOutAlt, faPlusCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { login, register } from '../../../services/authServices';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link
import axios from 'axios'; // Import axios


interface Category {
    id: string;
    name: string;
}

interface LoginData {
    usernameOrPhone: string;
    password: string;
}

interface City {
    id: string;
    name: string;
}

// Update the District interface to match the API response
interface District {
    id: string;
    name: string;
    city_id: string;
}

interface UserLocation {
    city: {
        id: string;
        name: string;
    };
    district: {
        id: string;
        name: string;
        city_id: string;
    };
}

// Add LoginModal component
const LoginModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onLogin: (e: React.FormEvent) => Promise<void>;
    error: string;
    onSwitchToRegister: () => void;
    loginData: LoginData;
    setLoginData: (data: LoginData) => void;
}> = ({ isOpen, onClose, onLogin, error, onSwitchToRegister, loginData, setLoginData }) => {
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content login-modal">
                <div className="modal-header">
                    <h2>Đăng nhập</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={onLogin}>
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
                            <button type="button" onClick={onSwitchToRegister} className="switch-auth-btn">
                                Đăng ký ngay
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Add RegisterModal component
const RegisterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onRegister: (e: React.FormEvent) => Promise<void>;
    error: string;
    onSwitchToLogin: () => void;
    registerData: any;
    setRegisterData: (data: any) => void;
    cities: City[];
    districts: District[];
}> = ({ isOpen, onClose, onRegister, error, onSwitchToLogin, registerData, setRegisterData, cities, districts }) => {
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const filteredDistricts = districts.filter(district => 
        district.city_id === registerData.cityId || 
        district.city_id === registerData.cityId
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content register-modal">
                <div className="modal-header">
                    <h2>Đăng ký</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={onRegister}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input 
                                type="text"
                                value={registerData.name}
                                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                                placeholder="Nhập họ và tên" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <input 
                                type="text"
                                value={registerData.username}
                                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                placeholder="Nhập tên đăng nhập" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email"
                                value={registerData.email}
                                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                placeholder="Nhập email" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="tel"
                                value={registerData.phone}
                                onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                                placeholder="Nhập số điện thoại" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Thành phố</label>
                            <select 
                                value={registerData.cityId}
                                onChange={(e) => setRegisterData({...registerData, cityId: e.target.value, districtId: ''})}
                            >
                                <option value="">Chọn thành phố</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Quận/Huyện</label>
                            <select 
                                value={registerData.districtId}
                                onChange={(e) => setRegisterData({...registerData, districtId: e.target.value})}
                                disabled={!registerData.cityId}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {filteredDistricts.map(district => (
                                    <option key={district.id} value={district.id}>
                                        {district.name || 'Unknown District'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
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
                        <div className="form-group">
                            <label>Xác nhận mật khẩu</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={registerData.confirmPassword}
                                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                    placeholder="Nhập lại mật khẩu" 
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
                            <button type="submit" className="submit-btn">Đăng ký</button>
                        </div>
                        <div className="form-footer">
                            <button type="button" onClick={onSwitchToLogin} className="switch-auth-btn">
                                Đã có tài khoản? Đăng nhập
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

interface ApiError {
    response?: {
        data?: {
            error?: string;
        };
    };
    message: string;
}

const Header: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loginData, setLoginData] = useState<LoginData>({ 
        usernameOrPhone: '', // Đổi tên từ emailOrUsername thành usernameOrPhone
        password: '' 
    });
    const [registerData, setRegisterData] = useState({
        name: '',
        username: '', // Add username field
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        cityId: '', // Add cityId field
        districtId: '' // Add districtId
    });
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]); // Define the type for categories
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [searchQuery, setSearchQuery] = useState(''); // Add searchQuery state
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Check for user in localStorage on component mount
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories');
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            if (showRegisterModal) {
                try {
                    const response = await axios.get('http://localhost:5000/api/cities');
                    console.log('Cities response:', response.data); // Debug log
                    if (response.data && Array.isArray(response.data.data)) {
                        const formattedCities = response.data.data.map((city: any) => ({
                            id: city._id || city.id,
                            name: city.name
                        }));
                        setCities(formattedCities);
                    }
                } catch (error) {
                    console.error('Error fetching cities:', error);
                }
            }
        };

        fetchCities();
    }, [showRegisterModal]);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (registerData.cityId) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/districts/city/${registerData.cityId}`);
                    console.log('Districts response:', response.data); // Debug log
                    if (response.data && Array.isArray(response.data.data)) {
                        const formattedDistricts = response.data.data.map((district: any) => ({
                            id: district._id || district.id,
                            name: district.name || '',
                            city_id: district.city_id || district.cityId
                        }));
                        setDistricts(formattedDistricts);
                    }
                } catch (error) {
                    console.error('Error fetching districts:', error);
                    setDistricts([]); // Reset districts on error
                }
            } else {
                setDistricts([]);
            }
        };

        fetchDistricts();
    }, [registerData.cityId]);

    useEffect(() => {
        const fetchUserLocation = async () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    const response = await axios.get('http://localhost:5000/api/users/location', {
                        headers: {
                            'X-User-ID': userData._id || userData.id // Try both _id and id
                        }
                    });
                    
                    console.log('Location data:', response.data);
                    setUserLocation(response.data);
                    localStorage.setItem('userLocation', JSON.stringify(response.data));
                } catch (error) {
                    console.error('Error fetching user location:', error);
                }
            }
        };

        fetchUserLocation();
    }, [user]); // Keep the dependency on user

    const handleCategorySelect = (categoryId: string, categoryName: string) => {
        navigate(`/category/${categoryName}`, { state: { categoryId, categoryName } });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('userLocation'); // Also remove location data
        setUser(null);
        setUserLocation(null);
        window.location.reload();
    };

    const handleUserMenuClick = () => {
        setShowUserDropdown(!showUserDropdown);
    };

    const handlePostSaleClick = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        navigate('/post-sale');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (!loginData.usernameOrPhone || !loginData.password) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const isPhoneNumber = /^\d+$/.test(loginData.usernameOrPhone);
            const loginPayload = {
                username: isPhoneNumber ? undefined : loginData.usernameOrPhone,
                phone: isPhoneNumber ? loginData.usernameOrPhone : undefined,
                password: loginData.password
            };

            const response = await login(loginPayload);
            
            if (response.data && response.data.user) {
                const userData = {
                    ...response.data.user,
                    name: response.data.user.name
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', response.data.token);
                setUser(userData);
                
                try {
                    const locationResponse = await axios.get('http://localhost:5000/api/users/location', {
                        headers: {
                            'X-User-ID': userData._id || userData.id
                        }
                    });
                    setUserLocation(locationResponse.data);
                    localStorage.setItem('userLocation', JSON.stringify(locationResponse.data));
                } catch (error) {
                    console.error('Error fetching user location:', error);
                }
                
                setShowLoginModal(false);
                window.location.reload();
            }
        } catch (err) {
            const error = err as ApiError;
            console.error('Login error:', error);
            setError(error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Enhanced validation
            if (!registerData.name || !registerData.username || !registerData.email || 
                !registerData.phone || !registerData.password || 
                !registerData.cityId || !registerData.districtId) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }

            if (registerData.password.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }

            if (registerData.password !== registerData.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp');
                return;
            }

            // Add debug logging
            console.log('Sending registration data:', {
                ...registerData,
                password: '[REDACTED]',
                confirmPassword: '[REDACTED]'
            });

            const response = await register(registerData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setShowRegisterModal(false);
                window.location.reload();
            }
        } catch (err) {
            const error = err as ApiError;
            console.error('Registration error:', error);
            setError(error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu && !userMenu.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search?query=${searchQuery}`);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <>
        <div className="header-container">
            <header className="hdr">
                <div className="hdr-left">
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}> {/* Add cursor pointer */}
                        <img src="/cho2hand-logo.png" alt="Logo" width="230" />
                    </div>
                    <nav className="nav">
                        <div className="nav-item">
                            <FontAwesomeIcon icon={faBars} className="menu-bars-icon" />
                            <span className="nav-text" style={{ color: 'white' }}>Danh mục</span>
                            <div className="dropdown">
                                {categories.map((category) => (
                                    <div 
                                        key={category.id} 
                                        className="dropdown-item" 
                                        onClick={() => handleCategorySelect(category.id, category.name)}
                                    >
                                        {category.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </nav>
                  
                </div>

                <div className="hdr-center">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm sản phẩm trên Chợ 2Hand" 
                        className="search" 
                        value={searchQuery} // Bind searchQuery state
                        onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
                        onKeyPress={handleKeyPress} // Handle Enter key press
                    />
                    <FontAwesomeIcon 
                        icon={faSearch} 
                        className="search-icon" 
                        onClick={handleSearch} // Handle search icon click
                    />
                </div>

                <div className="hdr-right">
                    
                    
                    <button 
                        className="post-sale-btn"
                        onClick={handlePostSaleClick}
                    >
                        <FontAwesomeIcon icon={faPlusCircle} className="icon" />
                        Đăng bán
                    </button>

                    {user ? (
                        <div className="user-menu">
                            <button 
                                className="user-btn" 
                                onClick={handleUserMenuClick}
                            >
                                <FontAwesomeIcon icon={faUser} className="auth-icon" />
                                <span>
                                    Xin chào, {user.name || "Khách"}
                                    {userLocation && (
                                        <small className="user-location">
                                            {` (${userLocation.district.name}, ${userLocation.city.name})`}
                                        </small>
                                    )}
                                </span>  
                            </button>
                            {showUserDropdown && (
                                <div className="user-dropdown">
                                    <Link to="/profile">Tài khoản của tôi</Link>
                                    <button onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button className="auth-btn login-btn" onClick={() => setShowLoginModal(true)}>
                                <FontAwesomeIcon icon={faSignInAlt} className="auth-icon" />
                                Đăng nhập
                            </button>
                            <button className="auth-btn register-btn" onClick={() => setShowRegisterModal(true)}>
                                <FontAwesomeIcon icon={faUserPlus} className="auth-icon" />
                                Đăng ký
                            </button>
                        </>
                    )}

                    <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                    </button>
                </div>
            </header>

            <LoginModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
                error={error}
                onSwitchToRegister={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                }}
                loginData={loginData}
                setLoginData={setLoginData}
            />

            <RegisterModal 
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onRegister={handleRegister}
                error={error}
                onSwitchToLogin={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                }}
                registerData={registerData}
                setRegisterData={setRegisterData}
                cities={cities}
                districts={districts}
            />
        </div>
        </>
    );
};

export default Header;
