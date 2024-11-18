import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add admin headers to requests if admin data exists
axiosInstance.interceptors.request.use((config) => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
        const admin = JSON.parse(adminData);
        config.headers['X-Admin-ID'] = admin.id;
        config.headers['X-Admin-Username'] = admin.username;
    }
    return config;
});

export const adminLogin = async (loginData: { username: string; password: string }) => {
    try {
        const response = await axiosInstance.post('/login', loginData);
        if (response.data.status === 200) {
            localStorage.setItem('adminData', JSON.stringify(response.data.admin));
            return response.data;
        }
        throw new Error(response.data.error || 'Login failed');
    } catch (error) {
        throw error;
    }
};

export const adminLogout = () => {
    localStorage.removeItem('adminData');
};

export const adminRegister = (registerData: { username: string; password: string; name: string }) => {
    return axiosInstance.post('/register', registerData);
};

export const isAuthenticated = () => {
    const adminData = localStorage.getItem('adminData');
    return !!adminData;
};

export const getAdminData = () => {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
};