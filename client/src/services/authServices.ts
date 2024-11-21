import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

interface LoginData {
    username?: string;
    phone?: string;
    password: string;
}

export const register = (userData: any) => {
    return axios.post(`${API_URL}/register`, userData);
};

export const login = (loginData: LoginData) => {
    return axios.post(`${API_URL}/login`, loginData);
};