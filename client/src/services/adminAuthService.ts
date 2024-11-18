import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

export const adminLogin = (loginData: { username: string; password: string }) => {
    return axios.post(`${API_URL}/login`, loginData);
};

export const adminRegister = (registerData: {
    username: string;
    password: string;
}) => {
    return axios.post(`${API_URL}/register`, registerData);
};